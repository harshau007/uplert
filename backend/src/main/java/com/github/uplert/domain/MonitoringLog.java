package com.github.uplert.domain;

import com.github.uplert.model.Intervals;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

@Document(collection = "monitoring_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MonitoringLog {
    @Id
    private String id;
    private String projectId;
    private Intervals intervals;
    private List<LogEntry> logs = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    public static class LogEntry {
        private String timestamp;
        private String website;
        private Long responseTime;
        private Integer statusCode;
        private String error;

        public LogEntry(String website, String timestamp, long responseTime, int statusCode) {
            this.timestamp = timestamp;
            this.website = website;
            this.responseTime = responseTime;
            this.statusCode = statusCode;
        }

        public LogEntry(String website, String error) {
            this.website = website;
            this.error = error;
        }
    }

    public void addLogEntry(LogEntry entry) {
        if (this.logs == null) {
            this.logs = new ArrayList<>();
        }

        this.logs.add(0, entry);

        if (this.logs.size() > 5) {
            this.logs = this.logs.subList(0, 5);
        }
    }
}
