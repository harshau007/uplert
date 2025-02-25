package com.github.uplert.config;

import com.github.uplert.domain.User;
import com.github.uplert.repos.UserRepository;
import com.github.uplert.util.RandomHexUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SingleUserInitializer {

    private final UserRepository userRepository;

    public static String SINGLE_USER_ID;

    public SingleUserInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            SINGLE_USER_ID = RandomHexUtil.generateRandom12ByteHex();
            User newUser = new User();
            newUser.setUserId(SINGLE_USER_ID);
            newUser.setEmails(new ArrayList<>());
            userRepository.save(newUser);
        } else {
            SINGLE_USER_ID = users.get(0).getUserId();
        }
    }
}
