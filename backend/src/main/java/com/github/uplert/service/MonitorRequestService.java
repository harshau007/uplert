package com.github.uplert.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.uplert.domain.MonitorRequest;
import com.github.uplert.domain.MonitoringSites;
import com.github.uplert.model.MonitorRequestDTO;
import com.github.uplert.model.MonitoringSitesDTO;
import com.github.uplert.repos.MonitorRequestRepository;
import com.github.uplert.repos.MonitoringSitesRepository;
import com.github.uplert.util.NotFoundException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;


@Service
public class MonitorRequestService {

    private final MonitorRequestRepository monitorRequestRepository;
    private final MonitoringSitesRepository monitoringSitesRepository;
    private final ScheduledExecutorService schedular = Executors.newScheduledThreadPool(10);
    private final Map<Integer, ScheduledFuture<?>> jobs = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public MonitorRequestService(final MonitorRequestRepository monitorRequestRepository, MonitoringSitesRepository monitoringSitesRepository, ObjectMapper objectMapper) {
        this.monitorRequestRepository = monitorRequestRepository;
        this.monitoringSitesRepository = monitoringSitesRepository;
        this.objectMapper = objectMapper;
    }

    public List<MonitorRequestDTO> findAll() {
        final List<MonitorRequest> monitorRequests = monitorRequestRepository.findAll(Sort.by("requestId"));
        return monitorRequests.stream()
                .map(monitorRequest -> mapToDTO(monitorRequest, new MonitorRequestDTO()))
                .toList();
    }

    public MonitorRequestDTO get(final Long requestId) {
        return monitorRequestRepository.findById(requestId)
                .map(monitorRequest -> mapToDTO(monitorRequest, new MonitorRequestDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public Long create(final MonitorRequestDTO monitorRequestDTO) {
        final MonitorRequest monitorRequest = new MonitorRequest();
        mapToEntity(monitorRequestDTO, monitorRequest);
        return monitorRequestRepository.save(monitorRequest).getRequestId();
    }

    public void update(final Long requestId, final MonitorRequestDTO monitorRequestDTO) {
        final MonitorRequest monitorRequest = monitorRequestRepository.findById(requestId)
                .orElseThrow(NotFoundException::new);
        mapToEntity(monitorRequestDTO, monitorRequest);
        monitorRequestRepository.save(monitorRequest);
    }

    public void delete(final Long requestId) {
        monitorRequestRepository.deleteById(requestId);
    }

    private MonitorRequestDTO mapToDTO(final MonitorRequest monitorRequest,
            final MonitorRequestDTO monitorRequestDTO) {
        monitorRequestDTO.setRequestId(monitorRequest.getRequestId());
        monitorRequestDTO.setUserId(monitorRequest.getUserId());
        monitorRequestDTO.setProjectId(monitorRequest.getProjectId());
        monitorRequestDTO.setUrl(monitorRequest.getUrl());
        monitorRequestDTO.setInterval(monitorRequest.getInterval());
        monitorRequestDTO.setStatus(monitorRequest.getStatus());
        return monitorRequestDTO;
    }

    private MonitorRequest mapToEntity(final MonitorRequestDTO monitorRequestDTO,
            final MonitorRequest monitorRequest) {
        monitorRequest.setUserId(monitorRequestDTO.getUserId());
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
                site.getSiteId(),
                site.getProjectId(),
                site.getUrl(),
                site.getInterval(),
                site.getStatus()
        )).toList();

        return objectMapper.writeValueAsString(sitesDTOS);
    }

    public void startMonitorfromMonitoringSites(WebSocketSession session) {
        List<MonitoringSites> monitoringSites = monitoringSitesRepository.findAll();
        if (jobs.isEmpty()) {
            for (MonitoringSites monitoringSite : monitoringSites) {
                startMonitoring(new MonitorRequestDTO(
                        1L,
                        1L,
                        monitoringSite.getProjectId(),
                        monitoringSite.getUrl(),
                        monitoringSite.getInterval(),
                        monitoringSite.getStatus()
                ), session);
            }
        }
    }

    public void startMonitoring(MonitorRequestDTO monitorRequestDTO, WebSocketSession session) {
        MonitoringJobService job = new MonitoringJobService(monitorRequestDTO, session);

        MonitoringSites monitoringSite = new MonitoringSites();
        monitoringSite.setProjectId(monitorRequestDTO.getProjectId());
        monitoringSite.setUrl(monitorRequestDTO.getUrl());
        monitoringSite.setInterval(monitorRequestDTO.getInterval());
        monitoringSite.setStatus(monitorRequestDTO.getStatus());
        monitoringSitesRepository.save(monitoringSite);

        ScheduledFuture<?> future = schedular.scheduleAtFixedRate(
                job, 0, monitorRequestDTO.getInterval().getInterval(), TimeUnit.SECONDS
        );
        jobs.put(monitorRequestDTO.getUrl().hashCode(), future);
    }

    public void stopMonitoring(MonitorRequestDTO monitorRequestDTO) {
        monitoringSitesRepository.delete(monitoringSitesRepository.findByUrl(monitorRequestDTO.getUrl()));
        ScheduledFuture<?> future = jobs.remove(monitorRequestDTO.getUrl().hashCode());
        if (future != null) {
            future.cancel(true);
        }
    }
}
