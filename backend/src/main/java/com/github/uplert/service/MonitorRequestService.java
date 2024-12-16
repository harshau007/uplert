package com.github.uplert.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.uplert.domain.MonitorRequest;
import com.github.uplert.domain.MonitoringLog;
import com.github.uplert.domain.MonitoringSites;
import com.github.uplert.model.MonitorRequestDTO;
import com.github.uplert.model.MonitoringSitesDTO;
import com.github.uplert.model.Status;
import com.github.uplert.repos.MonitorRequestRepository;
import com.github.uplert.repos.MonitoringLogRepository;
import com.github.uplert.repos.MonitoringSitesRepository;
import com.github.uplert.util.NotFoundException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.*;

import com.mongodb.MongoInterruptedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Slf4j
@Service
public class MonitorRequestService {

    private final MonitorRequestRepository monitorRequestRepository;
    private final MonitoringSitesRepository monitoringSitesRepository;
    private final MonitoringLogRepository monitoringLogRepository;
    private final ScheduledExecutorService schedular = Executors.newScheduledThreadPool(10);
    private final Map<Integer, ScheduledFuture<?>> jobs = new ConcurrentHashMap<>();
    private final Map<Integer, ScheduledFuture<?>> pauseJobs = new ConcurrentHashMap<>();
    private final Map<Integer, MonitorRequestDTO> pausedMonitorRequests = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public MonitorRequestService(final MonitorRequestRepository monitorRequestRepository, MonitoringSitesRepository monitoringSitesRepository, MonitoringLogRepository monitoringLogRepository, ObjectMapper objectMapper) {
        this.monitorRequestRepository = monitorRequestRepository;
        this.monitoringSitesRepository = monitoringSitesRepository;
        this.monitoringLogRepository = monitoringLogRepository;
        this.objectMapper = objectMapper;
    }

    public List<MonitorRequestDTO> findAll() {
        final List<MonitorRequest> monitorRequests = monitorRequestRepository.findAll(Sort.by("requestId"));
        return monitorRequests.stream()
                .map(monitorRequest -> mapToDTO(monitorRequest, new MonitorRequestDTO()))
                .toList();
    }

    public MonitorRequestDTO get(final String requestId) {
        return monitorRequestRepository.findById(requestId)
                .map(monitorRequest -> mapToDTO(monitorRequest, new MonitorRequestDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public String create(final MonitorRequestDTO monitorRequestDTO) {
        final MonitorRequest monitorRequest = new MonitorRequest();
        mapToEntity(monitorRequestDTO, monitorRequest);
        return monitorRequestRepository.save(monitorRequest).getId();
    }

    public void update(final String requestId, final MonitorRequestDTO monitorRequestDTO) {
        final MonitorRequest monitorRequest = monitorRequestRepository.findById(requestId)
                .orElseThrow(NotFoundException::new);
        mapToEntity(monitorRequestDTO, monitorRequest);
        monitorRequestRepository.save(monitorRequest);
    }

    public void delete(final String requestId) {
        monitorRequestRepository.deleteById(requestId);
    }

    private MonitorRequestDTO mapToDTO(final MonitorRequest monitorRequest,
            final MonitorRequestDTO monitorRequestDTO) {
        monitorRequestDTO.setProjectId(monitorRequest.getProjectId());
        monitorRequestDTO.setUrl(monitorRequest.getUrl());
        monitorRequestDTO.setInterval(monitorRequest.getInterval());
        monitorRequestDTO.setStatus(monitorRequest.getStatus());
        return monitorRequestDTO;
    }

    private MonitorRequest mapToEntity(final MonitorRequestDTO monitorRequestDTO,
            final MonitorRequest monitorRequest) {
        monitorRequest.setProjectId(monitorRequestDTO.getProjectId());
        monitorRequest.setUrl(monitorRequestDTO.getUrl());
        monitorRequest.setInterval(monitorRequestDTO.getInterval());
        monitorRequest.setStatus(monitorRequestDTO.getStatus());
        return monitorRequest;
    }

    public boolean urlExists(final String url) {
        return monitorRequestRepository.existsByUrlIgnoreCase(url);
    }

    public String currentlyRunning() throws JsonProcessingException {
        List<MonitoringSites> monitoringSites = monitoringSitesRepository.findAll();

        List<MonitoringSitesDTO> sitesDTOS = monitoringSites.stream().map(site -> new MonitoringSitesDTO(
                site.getId(),
                site.getProjectId(),
                site.getUrl(),
                site.getInterval(),
                site.getStatus()
        )).toList();

        return objectMapper.writeValueAsString(sitesDTOS);
    }

    public void startMonitorfromMonitoringSites(WebSocketSession session) {
        List<MonitoringSites> monitoringSites = monitoringSitesRepository.findByStatus(Status.ACTIVE);

        List<MonitoringSites> pausedSites = monitoringSitesRepository.findByStatus(Status.PAUSED);
        for (MonitoringSites monitoringSite : pausedSites) {
            pausedMonitorRequests.put(monitoringSite.getUrl().hashCode(), new MonitorRequestDTO(
                    monitoringSite.getProjectId(), monitoringSite.getUrl(), monitoringSite.getInterval(), monitoringSite.getStatus()
            ));
        }

        if (jobs.isEmpty()) {
            for (MonitoringSites monitoringSite : monitoringSites) {
                startMonitoring(new MonitorRequestDTO(
                        monitoringSite.getProjectId(),
                        monitoringSite.getUrl(),
                        monitoringSite.getInterval(),
                        monitoringSite.getStatus()
                ), session);
            }
        }
    }

    public void startMonitoring(MonitorRequestDTO monitorRequestDTO, WebSocketSession session) {
        MonitoringJobService job = new MonitoringJobService(monitorRequestDTO, session, monitoringLogRepository, monitoringSitesRepository);

        if (!monitoringSitesRepository.existsByUrl(monitorRequestDTO.getUrl())) {
            Status status = monitorRequestDTO.getStatus() != null
                    ? monitorRequestDTO.getStatus() : Status.ACTIVE;
            MonitoringSites monitoringSite = new MonitoringSites(
                    null, monitorRequestDTO.getProjectId(), monitorRequestDTO.getUrl(), monitorRequestDTO.getInterval(), status
            );
            monitoringSitesRepository.save(monitoringSite);
        }

        ScheduledFuture<?> future = schedular.scheduleAtFixedRate(
                job, 0, monitorRequestDTO.getInterval().getInterval(), TimeUnit.SECONDS
        );
        jobs.put(monitorRequestDTO.getUrl().hashCode(), future);
    }

//    public void stopMonitoring(MonitorRequestDTO monitorRequestDTO) {
//        try {
//            MonitoringSites existingSite = monitoringSitesRepository.findByUrl(monitorRequestDTO.getUrl());
//
//            if (existingSite.getUrl().equals(monitorRequestDTO.getUrl())) {
//                monitoringSitesRepository.deleteById(monitoringSitesRepository.findByUrl(monitorRequestDTO.getUrl()).getId());
//            }
//
//            ScheduledFuture<?> future = jobs.remove(monitorRequestDTO.getUrl().hashCode());
//
//            if (future != null) {
//                try {
//                    boolean cancelled = future.cancel(true);
//
//                    if (cancelled) {
//                        log.info("Monitoring stopped for URL: {}", monitorRequestDTO.getUrl());
//                    } else {
//                        log.warn("Could not cancel monitoring job for URL: {}", monitorRequestDTO.getUrl());
//                    }
//                } catch (Exception cancellationEx) {
//                    log.error("Error cancelling monitoring job for URL: {}", monitorRequestDTO.getUrl(), cancellationEx);
//                }
//            } else {
//                log.warn("No scheduled job found for URL: {}", monitorRequestDTO.getUrl());
//            }
//        } catch (MongoInterruptedException e) {
//            log.error("MongoDB interruption while stopping monitoring for URL: {}", monitorRequestDTO.getUrl(), e);
//
//            try {
//                jobs.remove(monitorRequestDTO.getUrl().hashCode());
//            } catch (Exception recoveryEx) {
//                log.error("Recovery attempt failed", recoveryEx);
//            }
//
//            throw new RuntimeException("Failed to stop monitoring", e);
//        } catch (Exception e) {
//            log.error("Unexpected error stopping monitoring for URL: {}", monitorRequestDTO.getUrl(), e);
//            throw new RuntimeException("Unexpected error stopping monitoring", e);
//        }
//    }

    public void pauseMonitoring(MonitorRequestDTO monitorRequestDTO) {
        ScheduledFuture<?> future = jobs.get(monitorRequestDTO.getUrl().hashCode());

        MonitoringSites monitoringSite = monitoringSitesRepository.findByUrl(monitorRequestDTO.getUrl());
        monitoringSite.setStatus(Status.PAUSED);
        monitoringSitesRepository.save(monitoringSite);

        pausedMonitorRequests.put(monitorRequestDTO.getUrl().hashCode(), monitorRequestDTO);
        pauseJobs.put(monitorRequestDTO.getUrl().hashCode(), future);
        jobs.remove(monitorRequestDTO.getUrl().hashCode());
        if(future != null){
            future.cancel(false);
            try{
                future.get();
            } catch (InterruptedException | ExecutionException | CancellationException e){
                System.out.println(e.getMessage());
            }
        }
    }

    public void deleteMonitoringEntry(MonitorRequestDTO monitorRequestDTO, WebSocketSession session) {
        try {
            MonitoringSites existingSite = monitoringSitesRepository.findByUrl(monitorRequestDTO.getUrl());

            if (existingSite.getUrl().equals(monitorRequestDTO.getUrl())) {
                monitoringSitesRepository.deleteById(monitoringSitesRepository.findByUrl(monitorRequestDTO.getUrl()).getId());
            }

            Optional<MonitoringLog> monitoringLog = monitoringLogRepository.findByProjectId(monitorRequestDTO.getProjectId());
            if (monitoringLog.isPresent() && monitoringLog.get().getProjectId().equals(existingSite.getProjectId())) {
                monitoringLogRepository.deleteById(monitoringLog.get().getId());
            }

            ScheduledFuture<?> future = jobs.remove(monitorRequestDTO.getUrl().hashCode());

            if (future != null) {
                try {
                    boolean cancelled = future.cancel(true);

                    if (cancelled) {
                        log.info("Monitoring stopped for URL: {}", monitorRequestDTO.getUrl());
                    } else {
                        log.warn("Could not cancel monitoring job for URL: {}", monitorRequestDTO.getUrl());
                    }
                } catch (Exception cancellationEx) {
                    log.error("Error cancelling monitoring job for URL: {}", monitorRequestDTO.getUrl(), cancellationEx);
                }
            } else {
                log.warn("No scheduled job found for URL: {}", monitorRequestDTO.getUrl());
            }
        } catch (MongoInterruptedException e) {
            log.error("MongoDB interruption while stopping monitoring for URL: {}", monitorRequestDTO.getUrl(), e);

            try {
                jobs.remove(monitorRequestDTO.getUrl().hashCode());
            } catch (Exception recoveryEx) {
                log.error("Recovery attempt failed", recoveryEx);
            }

            throw new RuntimeException("Failed to stop monitoring", e);
        } catch (Exception e) {
            log.error("Unexpected error stopping monitoring for URL: {}", monitorRequestDTO.getUrl(), e);
            throw new RuntimeException("Unexpected error stopping monitoring", e);
        }
    }

    public void resumeMonitoring(String url, WebSocketSession session) {
        MonitorRequestDTO pausedMonitorRequestDTO = pausedMonitorRequests.get(url.hashCode());

        MonitoringSites monitoringSite = monitoringSitesRepository.findByUrl(url);
        monitoringSite.setStatus(Status.ACTIVE);
        monitoringSitesRepository.save(monitoringSite);

        MonitoringJobService job = new MonitoringJobService(pausedMonitorRequestDTO, session, monitoringLogRepository, monitoringSitesRepository);

        ScheduledFuture<?> future = schedular.scheduleAtFixedRate(
                job, 0, pausedMonitorRequestDTO.getInterval().getInterval(), TimeUnit.SECONDS
        );

        jobs.put(url.hashCode(), future);
        pausedMonitorRequests.remove(url.hashCode());
        pauseJobs.remove(url.hashCode());
    }

    public void manualPing(MonitorRequestDTO monitorRequestDTO, WebSocketSession session) throws IOException {
        if (!jobs.containsKey(monitorRequestDTO.getUrl().hashCode())) {
            session.sendMessage(new TextMessage("Website monitoring is not running for URL: " + monitorRequestDTO.getUrl()));
            return;
        }
        MonitoringJobService job = new MonitoringJobService(monitorRequestDTO, session, monitoringLogRepository, monitoringSitesRepository);
        job.run();
    }
}
