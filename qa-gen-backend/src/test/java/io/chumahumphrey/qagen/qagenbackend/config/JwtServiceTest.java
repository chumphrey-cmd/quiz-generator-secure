package io.chumahumphrey.qagen.qagenbackend.config;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    private UserDetails mockUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // Forcefully inject a dummy key into the service so it doesn't crash during testing. It MUST be at least 64 characters long to satisfy the HS256 algorithm requirements!
        String dummyTestKey = "this_is_a_dummy_test_secret_key_that_must_be_long_enough_to_pass_the_math_check";
        ReflectionTestUtils.setField(jwtService, "secretKey", dummyTestKey);

        // Inject a dummy 24-hour expiration time (86400000 ms) so the tokens survive the tests!
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 12000000L);

        // 3. Create a standard Spring Security User object to act as our test subject.
        mockUser = new User("test.user@army.mil", "securepassword123", new ArrayList<>());
    }

    /**
     * TEST 1 (The Mint & Read Happy Path)
     * Goal: Prove that our engine can generate a token and correctly read the email back out of it.
     */
    @Test
    void test1_shouldGenerateTokenAndExtractUsername() {
        // --- ARRANGE & ACT ---
        // Attempt to generate a token for our mock user.
        String token = jwtService.generateToken(mockUser);

        // --- ASSERT ---
        // First, check that the token actually exists.
        assertNotNull(token, "The generated token should not be null");

        // If the token isn't null, try to read the email from it.
        String extractedUsername = jwtService.extractUsername(token);

        // Verify the email extracted matches the exact email we put in.
        assertEquals("test.user@army.mil", extractedUsername, "The extracted email should match the mock user's email");
    }

    /**
     * TEST 2 (The Validation Happy Path)
     * Goal: Prove that a legitimately generated token is recognized as valid for the user who owns it.
     */
    @Test
    void test2_shouldValidateCorrectToken() {
        // --- ARRANGE ---
        // Generate a real token for our mock user
        String token = jwtService.generateToken(mockUser);

        // --- ACT ---
        // Ask the service if this token is valid for this specific user
        boolean isValid = jwtService.isTokenValid(token, mockUser);

        // --- ASSERT ---
        assertTrue(isValid, "A newly generated token for this user should be valid");
    }

    /**
     * TEST 3 (The Imposter Guardrail)
     * Goal: Prove that a token generated for User A is strictly rejected if User B tries to use it.
     */
    @Test
    void test3_shouldRejectTokenForDifferentUser() {
        // --- ARRANGE ---
        // 1. Generate a real token for our primary mock user (test.user@army.mil)
        String token = jwtService.generateToken(mockUser);

        // 2. Create a completely different "imposter" user trying to access the system
        UserDetails imposterUser = new User("imposter@army.mil", "password", new ArrayList<>());

        // --- ACT ---
        // Ask the service if the first user's token is valid for the imposter
        boolean isValid = jwtService.isTokenValid(token, imposterUser);

        // --- ASSERT ---
        // This should return FALSE because the extracted email won't match the imposter's email.
        assertFalse(isValid, "The token should be instantly rejected if checked against a different user");
    }

    /**
     * TEST 4 (The Expiration Guardrail)
     * Goal: Prove that an expired token is strictly rejected and throws a security exception.
     */
    @Test
    void test4_shouldThrowExceptionWhenTokenIsExpired() {
        // --- ARRANGE (Time Travel) ---
        // 1. Temporarily override the expiration to -1000 milliseconds (1 second in the past)
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);

        // 2. Generate the token. Because of the override, it is "born dead".
        String expiredToken = jwtService.generateToken(mockUser);

        // --- ACT & ASSERT ---
        // Should throw an ExpiredJwtException the exact moment you try to parse an expired token and assertThrows verifies that this exact exception is triggered.
        assertThrows(ExpiredJwtException.class, () -> {
            jwtService.isTokenValid(expiredToken, mockUser);
        }, "The service should throw an ExpiredJwtException when parsing an expired token");
    }
}