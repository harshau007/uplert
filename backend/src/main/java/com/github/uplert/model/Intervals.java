package com.github.uplert.model;

import lombok.Getter;

@Getter
public enum Intervals {

    THREE(3), FIVE(5), TEN(10);

    private final int interval;

    Intervals(int i) {
        this.interval = i;
    }
}
