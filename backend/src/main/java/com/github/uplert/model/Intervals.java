package com.github.uplert.model;

import lombok.Getter;

@Getter
public enum Intervals {

    TEN(10), THIRTY(30), SIXTY(60);

    private final int interval;

    Intervals(int i) {
        this.interval = i;
    }
}
