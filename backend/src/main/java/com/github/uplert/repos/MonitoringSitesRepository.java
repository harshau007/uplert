package com.github.uplert.repos;

import com.github.uplert.domain.MonitoringSites;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonitoringSitesRepository extends JpaRepository<MonitoringSites, Long> {
    MonitoringSites findByUrl(String url);
}
