package com.github.uplert.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String recipient;
    private BodyData msgBody;
    private String subject;
    private String attachment;
}
