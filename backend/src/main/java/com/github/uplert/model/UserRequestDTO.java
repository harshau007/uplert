package com.github.uplert.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequestDTO {
    private String[] emails;
    private String fromEmail;
    private String appPassword;
}
