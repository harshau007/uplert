package com.github.uplert.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailDetails {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BodyData {
        private String responseTime;
        private String url;
        private String statusCode;
    }
    private List<String> recipients;
    private BodyData msgBody;
    private String subject;
    private String attachment;
}
