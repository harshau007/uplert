package com.github.uplert.service;

import com.github.uplert.model.MonitorRequestDTO;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.net.HttpURLConnection;
import java.net.URL;

public class MonitoringJobService implements Runnable{
    private final MonitorRequestDTO website;
    private final WebSocketSession session;

    public MonitoringJobService(MonitorRequestDTO website, WebSocketSession session) {
        this.website = website;
        this.session = session;
    }


    @Override
    public void run() {
        try {
            long startTime = System.currentTimeMillis();
            HttpURLConnection connection = (HttpURLConnection) new URL(website.getUrl()).openConnection();
            connection.setRequestMethod("GET");
            int statusCode = connection.getResponseCode();
            long responseTime = System.currentTimeMillis() - startTime;

            String logMessage = String.format(
                    "{\"website\":\"%s\",\"projectId\":\"%s\",\"responseTime\":%d,\"statusCode\":%d}",
                    website.getUrl(), website.getProjectId(),responseTime, statusCode
            );

            if (session.isOpen()) {
                synchronized (session) {
                    session.sendMessage(new TextMessage(logMessage));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(
                            String.format("{\"website\":\"%s\",\"error\":\"%s\"}",
                                    website.getUrl(), e.getMessage())
                    ));
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }
}
