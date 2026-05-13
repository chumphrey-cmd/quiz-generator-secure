package io.chumahumphrey.qagen.qagenbackend.auth;

/**
 * A Data Transfer Object (DTO) used to securely catch incoming JSON requests.
 * Java Records automatically generate the constructor and getters
 */
public record AuthRequest(
        String email,
        String password
) {}