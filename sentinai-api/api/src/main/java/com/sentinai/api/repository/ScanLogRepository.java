package com.sentinai.api.repository;

import com.sentinai.api.model.ScanLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanLogRepository extends MongoRepository<ScanLog, String> {
    List<ScanLog> findAllByOrderByCreatedAtDesc();
}
