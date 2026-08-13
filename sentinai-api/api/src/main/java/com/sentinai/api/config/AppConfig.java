package com.sentinai.api.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;

@Configuration
public class AppConfig {

    @Value("${MONGO_URI:mongodb://localhost:27017}")
    private String mongoUri;

    @PostConstruct
    public void setupTruststore() {
        try {
            Path targetPath = Paths.get("/tmp/truststore.p12");
            String base64 = System.getenv("TRUSTSTORE_BASE64");

            if (base64 != null && !base64.trim().isEmpty()) {
                byte[] decoded = Base64.getDecoder().decode(base64.trim());
                Files.write(targetPath, decoded);
                System.out.println("[SENTINAI KAFKA] Created truststore from TRUSTSTORE_BASE64 at /tmp/truststore.p12");
            } else {
                try (InputStream is = getClass().getResourceAsStream("/truststore.p12")) {
                    if (is != null) {
                        Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);
                        System.out.println("[SENTINAI KAFKA] Extracted truststore from classpath to /tmp/truststore.p12");
                    } else {
                        System.err.println("[SENTINAI KAFKA] truststore.p12 not found in classpath!");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[SENTINAI KAFKA] Failed to initialize truststore file: " + e.getMessage());
        }
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public MongoClient mongoClient() {
        System.out.println("=================================================");
        System.out.println("[SENTINAI DB] Explicitly initializing MongoClient with URI:");
        System.out.println(mongoUri);
        System.out.println("=================================================");
        return MongoClients.create(mongoUri);
    }
}
