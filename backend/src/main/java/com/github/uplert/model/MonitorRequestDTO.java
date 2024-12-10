package com.github.uplert.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MonitorRequestDTO {
    private Long requestId;

    @NotNull
    private Long userId;

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
