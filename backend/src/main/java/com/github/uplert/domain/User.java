package com.github.uplert.domain;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;
import java.util.List;

@Document(collection = "users")
@Getter
@Setter
public class User {

    @Id
    private String userId; // MongoDB typically uses String or ObjectId

    private List<String> emails;

    private String fromEmail;

    private String appPassword;

    @CreatedDate
    private OffsetDateTime dateCreated;

    @LastModifiedDate
    private OffsetDateTime lastUpdated;
}
