package com.github.uplert.repos;

import com.github.uplert.domain.MonitoringSites;
import com.github.uplert.model.Status;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MonitoringSitesRepository extends MongoRepository<MonitoringSites, String> {
    MonitoringSites findByUrl(String url);

    List<MonitoringSites> findByStatus(@NotNull Status status);

    boolean existsByUrl(String url);
}
