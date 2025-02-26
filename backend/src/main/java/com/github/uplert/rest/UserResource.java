package com.github.uplert.rest;

import com.github.uplert.domain.User;
import com.github.uplert.model.UserRequestDTO;
import com.github.uplert.repos.UserRepository;
import com.github.uplert.config.SingleUserInitializer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;

@RestController
public class UserResource {

    private final UserRepository userRepository;

    public UserResource(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/api/me")
    public ResponseEntity<Map<String, Object>> GetMe() {
        Map<String, Object> resp = new HashMap<>();
        User user = userRepository.findById(SingleUserInitializer.SINGLE_USER_ID).orElse(null);

        if (user == null) {
            resp.put("message", "User not found");
            return ResponseEntity.badRequest().body(resp);
        }

        resp.put("message", "Hello World");
        resp.put("emails", user.getEmails());
        resp.put("fromEmail", user.getFromEmail());
        resp.put("appPassword", user.getAppPassword());
        return ResponseEntity.ok(resp);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/api/me")
    public ResponseEntity<Map<String, Object>> UpdateMe(@RequestBody UserRequestDTO reqBody) {
        Map<String, Object> resp = new HashMap<>();
        User user = userRepository.findById(SingleUserInitializer.SINGLE_USER_ID).orElse(null);

        if (user == null) {
            resp.put("message", "User not found");
            return ResponseEntity.badRequest().body(resp);
        }

        System.out.println(reqBody);
        user.setEmails(Arrays.asList(reqBody.getEmails()));
        user.setFromEmail(reqBody.getFromEmail());
        user.setAppPassword(reqBody.getAppPassword());
        userRepository.save(user);

        resp.put("message", "User updated successfully");
        return ResponseEntity.ok(resp);
    }
}
