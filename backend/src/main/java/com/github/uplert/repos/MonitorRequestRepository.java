package com.github.uplert.repos;

import com.github.uplert.domain.MonitorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface MonitorRequestRepository extends MongoRepository<MonitorRequest, String> {

    boolean existsByUrlIgnoreCase(String url);

}
