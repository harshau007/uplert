package com.github.uplert.repos;

import com.github.uplert.domain.MonitorRequest;
import org.springframework.data.jpa.repository.JpaRepository;


public interface MonitorRequestRepository extends JpaRepository<MonitorRequest, Long> {

    boolean existsByUrlIgnoreCase(String url);

}
