package com.sentinai.api.controller;

import com.sentinai.api.dto.request.ScanRequest;
import com.sentinai.api.dto.response.ScanResponse;
import com.sentinai.api.model.ScanLog;
import com.sentinai.api.service.ScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/scan")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class ScanController {

    private final ScanService scanService; // Interface injection

    @PostMapping
    public ResponseEntity<ScanResponse> submitScan(@RequestBody ScanRequest request) {
        return ResponseEntity.ok(scanService.processScan(request));
    }

    @GetMapping("/{scanId}")
    public ResponseEntity<ScanResponse> getScanStatus(@PathVariable String scanId) {
        return ResponseEntity.ok(scanService.getScanById(scanId));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<ScanLog>> getAllLogs() {
        return ResponseEntity.ok(scanService.getAllLogs());
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("SentinAI API Gateway operational.");
    }
}
