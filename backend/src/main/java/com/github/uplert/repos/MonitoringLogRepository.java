package com.github.uplert.repos;

import com.github.uplert.domain.MonitoringLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MonitoringLogRepository extends MongoRepository<MonitoringLog, String> {
    Optional<MonitoringLog> findByProjectId(String projectId);
}
