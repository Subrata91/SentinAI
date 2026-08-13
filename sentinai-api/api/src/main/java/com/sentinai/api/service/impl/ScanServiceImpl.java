package com.sentinai.api.service.impl;

import com.sentinai.api.dto.request.ScanRequest;
import com.sentinai.api.dto.response.ScanResponse;
import com.sentinai.api.model.ScanLog;
import com.sentinai.api.repository.ScanLogRepository;
import com.sentinai.api.service.ScanService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ScanServiceImpl implements ScanService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final StringRedisTemplate redisTemplate;
    private final ScanLogRepository scanLogRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.kafka.topics.scan-requests}")
    private String scanRequestsTopic;

    private String getISTTimestamp() {
        ZonedDateTime nowIST = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
        return nowIST.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z"));
    }

    @Override
    @SneakyThrows
    public ScanResponse processScan(ScanRequest request) {
        long startTime = System.currentTimeMillis();

        // 1. Redis Cache Lookup
        String hash = computeHash(request.getPayload());
        String cachedResult = redisTemplate.opsForValue().get("hash:" + hash);

        if (cachedResult != null) {
            ScanResponse response = objectMapper.readValue(cachedResult, ScanResponse.class);
            response.setCached(true);
            response.setLatencyMs(System.currentTimeMillis() - startTime);
            return response;
        }

        // 2. Cache Miss -> Persist record in MongoDB
        String scanId = "EV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String currentISTTime = getISTTimestamp();

        ScanLog scanLog = new ScanLog();
        scanLog.setId(scanId);
        scanLog.setContentType(request.getContentType());
        scanLog.setPayload(request.getPayload());
        scanLog.setStatus("PROCESSING");
        scanLog.setThreatType("Queued for AI Model Analysis");
        scanLog.setTimestamp(currentISTTime);
        scanLogRepository.save(scanLog);

        // 3. Publish to Kafka with scanId explicitly included
        Map<String, Object> kafkaMessage = new HashMap<>();
        kafkaMessage.put("scanId", scanId);
        kafkaMessage.put("payload", request.getPayload());
        kafkaMessage.put("contentType", request.getContentType());
        kafkaMessage.put("timestamp", currentISTTime);

        kafkaTemplate.send(scanRequestsTopic, scanId, objectMapper.writeValueAsString(kafkaMessage));

        return ScanResponse.builder()
                .scanId(scanId)
                .status("PROCESSING")
                .threatType("Queued for AI Model Analysis")
                .cached(false)
                .latencyMs(System.currentTimeMillis() - startTime)
                .build();
    }

    @Override
    @SneakyThrows
    public ScanResponse getScanById(String scanId) {
        ScanLog scanLog = scanLogRepository.findById(scanId)
                .orElseThrow(() -> new RuntimeException("Scan not found for ID: " + scanId));

        // Check Redis for the completed result produced by the Python worker
        if (scanLog.getPayload() != null) {
            String hash = computeHash(scanLog.getPayload());
            String cachedResult = redisTemplate.opsForValue().get("hash:" + hash);

            if (cachedResult != null) {
                ScanResponse response = objectMapper.readValue(cachedResult, ScanResponse.class);
                response.setCached(false);
                return response;
            }
        }

        return ScanResponse.builder()
                .scanId(scanLog.getId())
                .status(scanLog.getStatus())
                .confidence(scanLog.getConfidence() != null ? scanLog.getConfidence() : "N/A")
                .threatType(scanLog.getThreatType())
                .cached(false)
                .build();
    }

    @Override
    public List<ScanLog> getAllLogs() {
        List<ScanLog> logs = scanLogRepository.findAllByOrderByCreatedAtDesc();

        // Cross-reference Redis for any pending 'PROCESSING' records
        for (ScanLog log : logs) {
            if ("PROCESSING".equals(log.getStatus()) && log.getPayload() != null) {
                String hash = computeHash(log.getPayload());
                String cachedResult = redisTemplate.opsForValue().get("hash:" + hash);

                if (cachedResult != null) {
                    try {
                        ScanResponse response = objectMapper.readValue(cachedResult, ScanResponse.class);
                        log.setStatus(response.getStatus());
                        log.setThreatType(response.getThreatType());
                        log.setConfidence(response.getConfidence());

                        // Sync completed verdict back to Mongo
                        scanLogRepository.save(log);
                    } catch (Exception ignored) {
                    }
                }
            }
        }
        return logs;
    }

    @SneakyThrows
    private String computeHash(String input) {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(encodedHash);
    }
}