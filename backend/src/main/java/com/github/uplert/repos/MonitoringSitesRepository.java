package com.github.uplert.repos;

import com.github.uplert.domain.MonitoringSites;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MonitoringSitesRepository extends MongoRepository<MonitoringSites, String> {
    MonitoringSites findByUrl(String url);

    boolean existsByUrl(String url);
}
