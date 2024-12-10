package com.github.uplert.domain;

import com.github.uplert.model.Intervals;
import com.github.uplert.model.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "MonitoringSites")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class MonitoringSites {
    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "primary_sequence",
            sequenceName = "primary_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "primary_sequence"
    )
    private Long siteId;

    @Column(nullable = false)
    private String projectId;

    @Column(nullable = false, unique = true)
    private String url;

    @Column(nullable = false, name = "\"interval\"")
    @Enumerated(EnumType.ORDINAL)
    private Intervals interval;

    @Column
    @Enumerated(EnumType.STRING)
    private Status status;
}
