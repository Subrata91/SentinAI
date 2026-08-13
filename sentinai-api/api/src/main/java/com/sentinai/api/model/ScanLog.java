package com.sentinai.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "scan_logs")
public class ScanLog {

    @Id
    private String id;          // Maps to scanId (e.g., EV-8902)
    private String contentType; // "TEXT" or "FILE"
    private String payload;
    private String status;      // "PROCESSING", "CLEARED", "FLAGGED", "BLOCKED"
    private String threatType;
    private String confidence;
    private String timestamp;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
