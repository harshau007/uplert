package com.github.uplert.model;

import lombok.Getter;

@Getter
public enum Status {

    ACTIVE("active"), PAUSED("paused");

    private final String status;

    Status(String status) {
        this.status = status;
    }
}
