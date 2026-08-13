package com.sentinai.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScanResponse {
    private String scanId;
    private String status;      // "CLEARED", "FLAGGED", "BLOCKED"
    private String confidence;
    private String threatType;
    private Boolean cached;
    private Long latencyMs;
}
