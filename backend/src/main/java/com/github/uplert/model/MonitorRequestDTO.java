package com.github.uplert.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MonitorRequestDTO {
    private String id;

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

    private Boolean isPaused;
}
