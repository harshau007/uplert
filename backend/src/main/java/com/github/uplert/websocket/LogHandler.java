package com.github.uplert.websocket;

import com.github.uplert.domain.MonitoringLog;
import com.github.uplert.repos.MonitoringLogRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;

@Component
public class LogHandler extends TextWebSocketHandler {
    private final MonitoringLogRepository monitoringLogRepository;

    public LogHandler(MonitoringLogRepository monitoringLogRepository) {
        this.monitoringLogRepository = monitoringLogRepository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String path = Objects.requireNonNull(session.getUri()).getPath();
        String[] pathSegments = path.split("/");
        String projectId = pathSegments[2];

        System.out.println("WebSocket connection established for projectId: " + projectId);
    }

    // TODO: Send log message as per the interval and try to send only latest log message
    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String path = Objects.requireNonNull(session.getUri()).getPath();
        String[] pathSegments = path.split("/");
        String projectId = pathSegments[2];

        Optional<MonitoringLog> monitoringLog = monitoringLogRepository.findByProjectId(projectId);
        if (monitoringLog.isPresent()) {
            List<MonitoringLog.LogEntry> logs = monitoringLog.get().getLogs();
            for (MonitoringLog.LogEntry logEntry : logs) {
                String logMessage = String.format(
                        "{\"website\":\"%s\",\"timestamp\":\"%s\",\"responseTime\":%d,\"statusCode\":%d}",
                        logEntry.getWebsite(), logEntry.getTimestamp(), logEntry.getResponseTime(), logEntry.getStatusCode()
                );
                session.sendMessage(new TextMessage(logMessage));
            }
        }
    }

    @MessageMapping("/ws")
    public void log(String message) {

    }
}
