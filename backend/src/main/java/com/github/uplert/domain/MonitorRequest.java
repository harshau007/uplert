package com.github.uplert.domain;

import com.github.uplert.model.Intervals;
import com.github.uplert.model.Status;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

import lombok.Getter;
import lombok.Setter;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "monitoring_request")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class MonitorRequest {

    @Id
    private String id;

    private Long userId;

    private String projectId;

    private String url;

    @BsonProperty(value = "interval")
    @Enumerated(EnumType.ORDINAL)
    private Intervals interval;

    @Enumerated(EnumType.STRING)
    private Status status;

    private Boolean isPaused;

    @CreatedDate
    private OffsetDateTime dateCreated;

    @LastModifiedDate
    private OffsetDateTime lastUpdated;

}
