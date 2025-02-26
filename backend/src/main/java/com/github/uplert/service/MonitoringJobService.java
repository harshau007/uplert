package com.github.uplert.service;

import com.github.uplert.domain.MonitoringLog;
import com.github.uplert.domain.MonitoringSites;
import com.github.uplert.domain.User;
import com.github.uplert.model.EmailDetails;
import com.github.uplert.model.MonitorRequestDTO;
import com.github.uplert.repos.MonitoringLogRepository;
import com.github.uplert.repos.MonitoringSitesRepository;
import com.github.uplert.repos.UserRepository;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

public class MonitoringJobService implements Runnable{
    private final MonitorRequestDTO website;
    private final WebSocketSession session;
    private final MonitoringLogRepository monitoringLogRepository;
    private final MonitoringSitesRepository monitoringSitesRepository;
    private final EmailServiceImpl emailService;
    private final UserRepository userRepository;

    public MonitoringJobService(MonitorRequestDTO website, WebSocketSession session, MonitoringLogRepository monitoringLogRepository, MonitoringSitesRepository monitoringSitesRepository, UserRepository userRepository) {
        this.website = website;
        this.session = session;
        this.monitoringLogRepository = monitoringLogRepository;
        this.monitoringSitesRepository = monitoringSitesRepository;
        this.userRepository = userRepository;
        this.emailService = new EmailServiceImpl(userRepository);
    }

    @Override
    public void run() {
        try {
            long startTime = System.currentTimeMillis();
            HttpURLConnection connection = (HttpURLConnection) new URL(website.getUrl()).openConnection();
            connection.setRequestMethod("GET");
            int statusCode = connection.getResponseCode();
            long responseTime = System.currentTimeMillis() - startTime;

            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
            sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
            String timestamp = sdf.format(new Date(System.currentTimeMillis()));

            MonitoringLog.LogEntry logEntry = new MonitoringLog.LogEntry(
                    website.getUrl(), timestamp,responseTime, statusCode
            );

            MonitoringLog monitoringLog = monitoringLogRepository
                    .findByProjectId(website.getProjectId())
                    .orElse(new MonitoringLog(null, website.getProjectId(), website.getInterval(), null));

            monitoringLog.addLogEntry(logEntry);

            monitoringLogRepository.save(monitoringLog);

            MonitoringSites monitoringSites = monitoringSitesRepository.findByUrl(website.getUrl());

            System.out.println("Status: "+ monitoringSites.getStatus());
            System.out.println("Status Code: "+ statusCode);
            if (statusCode == 404) {
                EmailDetails emailDetails = getEmailDetails(responseTime, statusCode);
                emailService.sendEmail(emailDetails);
            }
            String logMessage = String.format(
                    "{\"website\":\"%s\",\"projectId\":\"%s\",\"status\":\"%s\",\"responseTime\":%d,\"statusCode\":%d}",
                    website.getUrl(), monitoringSites.getProjectId(), monitoringSites.getStatus(),responseTime, statusCode
            );
            this.notifyUser(logMessage);
        } catch (Exception e) {
            e.printStackTrace();
            try {
                this.notifyUser(String.format("{\"website\":\"%s\",\"error\":\"%s\"}", website.getUrl(), e.getMessage()));
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }

    private EmailDetails getEmailDetails(long responseTime, int statusCode) {
        List<User> users = userRepository.findAll();
        EmailDetails emailDetails = new EmailDetails();
        emailDetails.setSubject("Urgent: Your Website Is Down – Immediate Action Required");
        EmailDetails.BodyData bodyData = new EmailDetails.BodyData("" + responseTime, website.getUrl(), "" + statusCode);
        emailDetails.setMsgBody(bodyData);
        emailDetails.setRecipients(users.get(0).getEmails());
        return emailDetails;
    }

    public void notifyUser(String message) {
        if (session != null && session.isOpen()) {
            synchronized (session) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    System.err.println("Error sending message: " + e.getMessage());
                }
            }
        }
    }
}
