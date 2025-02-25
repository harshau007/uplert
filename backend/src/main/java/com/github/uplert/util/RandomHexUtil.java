package com.github.uplert.util;

import java.security.SecureRandom;

public class RandomHexUtil {

    private static final SecureRandom secureRandom = new SecureRandom();

    public static String generateRandom12ByteHex() {
        byte[] bytes = new byte[12];
        secureRandom.nextBytes(bytes);
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }
}
