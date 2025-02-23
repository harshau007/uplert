package com.github.uplert.service;

import com.github.uplert.model.EmailDetails;

public interface EmailService {
    String sendEmail(EmailDetails details);
}
