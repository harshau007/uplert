package com.github.uplert.domain;

import com.github.uplert.model.Intervals;
import com.github.uplert.model.Status;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "monitoring_sites")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MonitoringSites {
    @Id
    private String id;

    @NotNull
    private String projectId;

    @NotNull
    @Indexed(unique = true)
    private String url;

    @NotNull
    @BsonProperty(value = "interval")
    @Enumerated(EnumType.ORDINAL)
    private Intervals interval;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Status status;
}
