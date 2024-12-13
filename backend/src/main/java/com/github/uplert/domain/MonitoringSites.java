package com.github.uplert.domain;

import com.github.uplert.model.Intervals;
import com.github.uplert.model.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
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

    private String projectId;

    @Indexed(unique = true)
    private String url;

    @BsonProperty(value = "interval")
    @Enumerated(EnumType.ORDINAL)
    private Intervals interval;

    @Enumerated(EnumType.STRING)
    private Status status;
}
