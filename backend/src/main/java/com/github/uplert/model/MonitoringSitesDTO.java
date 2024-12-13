package com.github.uplert.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringSitesDTO {
    private String siteId;

    @NotNull
    private String projectId;

    @NotNull
    @Size(max = 255)
    @MonitorRequestUrlUnique
    private String url;

    @NotNull
    private Intervals interval;

    private Status status;
}
