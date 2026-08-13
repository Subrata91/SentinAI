package com.sentinai.api.service;

import com.sentinai.api.dto.request.ScanRequest;
import com.sentinai.api.dto.response.ScanResponse;
import com.sentinai.api.model.ScanLog;

import java.util.List;

public interface ScanService {
    ScanResponse processScan(ScanRequest request);
    ScanResponse getScanById(String scanId);
    List<ScanLog> getAllLogs();
}
