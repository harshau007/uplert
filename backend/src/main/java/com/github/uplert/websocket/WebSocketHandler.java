package com.github.uplert.websocket;

import com.github.uplert.model.MonitorRequestDTO;
import com.github.uplert.service.MonitorRequestService;
import com.google.gson.*;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final MonitorRequestService monitorRequestService;

    public WebSocketHandler(MonitorRequestService monitorRequestService) {
        this.monitorRequestService = monitorRequestService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = extractSessionId(session);

        if(sessionId.isEmpty()) {
            if (!userSessions.containsKey(sessionId)) {
                sessionId = session.getId();
            }
        }

        userSessions.put(sessionId, session);
        monitorRequestService.startMonitorfromMonitoringSites(session);
        session.sendMessage(new TextMessage(monitorRequestService.currentlyRunning()));
        session.sendMessage(new TextMessage(String.format("{\"sessionId\":\"%s\"}", sessionId)));
        System.out.println("WebSocket connection established. Session ID: " + sessionId);
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String payload = (String) message.getPayload();
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String sessionId = extractSessionId(session);

        if (!userSessions.containsKey(sessionId)) {
            userSessions.put(sessionId, session);
        }

        try {
            JsonObject json = JsonParser.parseString(payload).getAsJsonObject();

            if (!json.has("action")) {
                sendErrorMessage(session, "Missing 'action' field");
                return;
            }
            String action = json.get("action").getAsString();

            switch (action.toLowerCase()) {
                case "start":
                    handleStartAction(session, json, gson);
                    break;

                case "stop":
                    handleStopAction(session, json, gson);
                    break;

                case "pause":
                    handlePauseAction(session, json, gson);
                    break;

                case "resume":
                    handleResumeAction(session, json, gson);
                    break;

                default:
                    sendErrorMessage(session, "Unknown action: " + action);
            }
        } catch (Exception e) {
            sendErrorMessage(session, "Invalid payload: " + e.getMessage());
            System.err.println("Error processing WebSocket message: " + e.getMessage());
        }
    }

    private void handlePauseAction(WebSocketSession session, JsonObject json, Gson gson) {
        try {
            if (!json.has("website")) {
                sendErrorMessage(session, "Missing 'website' field in start action");
                return;
            }

            JsonObject websiteJson = json.getAsJsonObject("website");
            MonitorRequestDTO monitorRequest = gson.fromJson(websiteJson, MonitorRequestDTO.class);

            if (!validateMonitorRequest(monitorRequest)) {
                sendErrorMessage(session, "Invalid website details provided");
                return;
            }

            monitorRequestService.pauseMonitoring(monitorRequest);
            session.sendMessage(new TextMessage("Monitoring paused for: " + monitorRequest.getUrl()));
        } catch (Exception e) {
            sendErrorMessage(session, "Invalid payload: " + e.getMessage());
        }
    }

    private void handleResumeAction(WebSocketSession session, JsonObject json, Gson gson) {
       try {
           if (!json.has("website")) {
               sendErrorMessage(session, "Missing 'website' field in start action");
               return;
           }

           JsonObject websiteJson = json.getAsJsonObject("website");
           MonitorRequestDTO monitorRequestURL = gson.fromJson(websiteJson, MonitorRequestDTO.class);

           monitorRequestService.resumeMonitoring(monitorRequestURL.getUrl(), session);
           session.sendMessage(new TextMessage("Monitoring resumed for: " + monitorRequestURL));
       } catch (Exception e) {
           sendErrorMessage(session, "Invalid payload: " + e.getMessage());
       }
    }

    private void handleStartAction(WebSocketSession session, JsonObject json, Gson gson) {
        try {
            if (!json.has("website")) {
                sendErrorMessage(session, "Missing 'website' field in start action");
                return;
            }

            JsonObject websiteJson = json.getAsJsonObject("website");
            MonitorRequestDTO monitorRequest = gson.fromJson(websiteJson, MonitorRequestDTO.class);

            if (!validateMonitorRequest(monitorRequest)) {
                sendErrorMessage(session, "Invalid website details provided");
                return;
            }

            monitorRequestService.startMonitoring(monitorRequest, session);
            session.sendMessage(new TextMessage("Monitoring started for: " + monitorRequest.getUrl()));
        } catch (Exception e) {
            sendErrorMessage(session, "Failed to start monitoring: " + e.getMessage());
            System.err.println("Error in handleStartAction: " + e.getMessage());
        }
    }

    private void handleStopAction(WebSocketSession session, JsonObject json, Gson gson) {
        try {
            String sessionId = extractSessionId(session);
            if (!json.has("website")) {
                sendErrorMessage(session, "Missing 'website' field in stop action");
                return;
            }

            JsonObject websiteJson = json.getAsJsonObject("website");
            MonitorRequestDTO monitorRequest = gson.fromJson(websiteJson, MonitorRequestDTO.class);

            if (monitorRequest.getId() == null || monitorRequest.getId().isEmpty()) {
                sendErrorMessage(session, "Invalid request ID provided");
                return;
            }

            synchronized (userSessions.get(sessionId)) {
                monitorRequestService.stopMonitoring(monitorRequest);
            }
            session.sendMessage(new TextMessage("Monitoring stopped for: " + monitorRequest.getUrl()));
        } catch (Exception e) {
            sendErrorMessage(session, "Failed to stop monitoring: " + e.getMessage());
            System.err.println("Error in handleStopAction: " + e.getMessage());
        }
    }

    private void sendErrorMessage(WebSocketSession session, String errorMessage) {
        try {
            session.sendMessage(new TextMessage("Error: " + errorMessage));
        } catch (IOException e) {
            System.err.println("Failed to send error message to client: " + e.getMessage());
        }
    }

    private boolean validateMonitorRequest(MonitorRequestDTO request) {
        if (request == null || request.getUserId() == null || request.getUserId() <= 0) {
            return false;
        }
        if (request.getProjectId() == null || request.getProjectId().isEmpty()) {
            return false;
        }
        if (request.getUrl() == null || request.getUrl().isEmpty()) {
            return false;
        }
        if (request.getInterval() == null) {
            return false;
        }
        return isValidUrl(request.getUrl());
    }

    private boolean isValidUrl(String url) {
        try {
            new java.net.URL(url).toURI();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

//    @Override
//    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
//        String sessionId = extractSessionId(session);
//        if (sessionId != null) {
//            userSessions.remove(sessionId);
//            System.out.println("WebSocket connection closed. SessionId: " + sessionId);
//        }
//    }

    private String extractSessionId(WebSocketSession session) {
        if (session.getUri() == null) {
            return "";
        }

        String query = session.getUri().getQuery();
        if (query == null || query.isEmpty()) {
            return "";
        }

        for (String param : query.split("&")) {
            String[] keyValue = param.split("=");
            if (keyValue.length == 2 && "sessionId".equals(keyValue[0])) {
                return keyValue[1];
            }
        }
        return "";
    }

}
