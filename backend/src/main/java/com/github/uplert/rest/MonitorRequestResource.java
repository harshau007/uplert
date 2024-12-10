package com.github.uplert.rest;

import com.github.uplert.model.MonitorRequestDTO;
import com.github.uplert.service.MonitorRequestService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping(value = "/api/monitorRequests", produces = MediaType.APPLICATION_JSON_VALUE)
public class MonitorRequestResource {

    private final MonitorRequestService monitorRequestService;

    public MonitorRequestResource(final MonitorRequestService monitorRequestService) {
        this.monitorRequestService = monitorRequestService;
    }

    @GetMapping
    public ResponseEntity<List<MonitorRequestDTO>> getAllMonitorRequests() {
        return ResponseEntity.ok(monitorRequestService.findAll());
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<MonitorRequestDTO> getMonitorRequest(
            @PathVariable(name = "requestId") final Long requestId) {
        return ResponseEntity.ok(monitorRequestService.get(requestId));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createMonitorRequest(
            @RequestBody @Valid final MonitorRequestDTO monitorRequestDTO) {
        final Long createdRequestId = monitorRequestService.create(monitorRequestDTO);
        return new ResponseEntity<>(createdRequestId, HttpStatus.CREATED);
    }

    @PutMapping("/{requestId}")
    public ResponseEntity<Long> updateMonitorRequest(
            @PathVariable(name = "requestId") final Long requestId,
            @RequestBody @Valid final MonitorRequestDTO monitorRequestDTO) {
        monitorRequestService.update(requestId, monitorRequestDTO);
        return ResponseEntity.ok(requestId);
    }

    @DeleteMapping("/{requestId}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteMonitorRequest(
            @PathVariable(name = "requestId") final Long requestId) {
        monitorRequestService.delete(requestId);
        return ResponseEntity.noContent().build();
    }

}
