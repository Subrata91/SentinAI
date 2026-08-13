package com.sentinai.api.dto.request;

import lombok.Data;

@Data
public class ScanRequest {
    private String contentType; // "TEXT" or "FILE"
    private String payload;     // Text content or Base64/URL string
    private String fileName;
}
