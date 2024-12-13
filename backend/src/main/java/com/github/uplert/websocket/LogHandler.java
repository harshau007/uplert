package com.github.uplert.websocket;

import com.github.uplert.domain.MonitoringLog;
import com.github.uplert.model.Intervals;
import com.github.uplert.repos.MonitoringLogRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;

@Component
public class LogHandler extends TextWebSocketHandler {
    private final MonitoringLogRepository monitoringLogRepository;
    private final ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(10);
    private final Map<WebSocketSession, ScheduledFuture<?>> sessionTasks = new ConcurrentHashMap<>();
    private final Map<WebSocketSession, MonitoringLog.LogEntry> lastSentLogs = new ConcurrentHashMap<>();

    public LogHandler(MonitoringLogRepository monitoringLogRepository) {
        this.monitoringLogRepository = monitoringLogRepository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String path = Objects.requireNonNull(session.getUri()).getPath();
        String[] pathSegments = path.split("/");
        String projectId = pathSegments[2];

        System.out.println("WebSocket connection established for projectId: " + projectId);

        Optional<MonitoringLog> monitoringLog = monitoringLogRepository.findByProjectId(projectId);
        if (monitoringLog.isPresent()) {
            Intervals interval = monitoringLog.get().getIntervals();

            sendAllLogs(session, monitoringLog.get().getLogs());

            ScheduledFuture<?> task = scheduledExecutorService.scheduleAtFixedRate(() -> {
                try {
                    if (!session.isOpen()) {
                        return;
                    }

                    Optional<MonitoringLog> updatedLog = monitoringLogRepository.findByProjectId(projectId);
                    if (updatedLog.isPresent()) {
                        List<MonitoringLog.LogEntry> logs = updatedLog.get().getLogs();
                        if (!logs.isEmpty()) {
                            MonitoringLog.LogEntry latestLog = logs.get(0);

                            if (!latestLog.equals(lastSentLogs.get(session))) {
                                sendLog(session, latestLog);
                                lastSentLogs.put(session, latestLog);
                            }
                        }
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }, 0, interval.getInterval(), TimeUnit.SECONDS);

            sessionTasks.put(session, task);
        } else {
            session.close();
        }
    }

    private void sendAllLogs(WebSocketSession session, List<MonitoringLog.LogEntry> logs) throws IOException {
        for (MonitoringLog.LogEntry log : logs) {
            sendLog(session, log);
        }
    }

    private void sendLog(WebSocketSession session, MonitoringLog.LogEntry log) throws IOException {
        String logMessage = String.format(
                "{\"website\":\"%s\",\"timestamp\":\"%s\",\"responseTime\":%d,\"statusCode\":%d}",
                log.getWebsite(), log.getTimestamp(), log.getResponseTime(), log.getStatusCode()
        );
        session.sendMessage(new TextMessage(logMessage));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        ScheduledFuture<?> task = sessionTasks.remove(session);
        if (task != null) {
            task.cancel(true);
        }
        lastSentLogs.remove(session);
        System.out.println("WebSocket connection closed: " + session.getId());
    }
}
