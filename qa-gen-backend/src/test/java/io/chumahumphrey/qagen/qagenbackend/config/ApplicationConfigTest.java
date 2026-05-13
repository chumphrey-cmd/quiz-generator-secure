package io.chumahumphrey.qagen.qagenbackend.config;

import io.chumahumphrey.qagen.qagenbackend.user.User;
import io.chumahumphrey.qagen.qagenbackend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ApplicationConfigTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ApplicationConfig applicationConfig;

    private UserDetailsService userDetailsService;

    @BeforeEach
    void setUp(){

        // Instantiate the UserDetailsService method from ApplicationConfig.java
        userDetailsService = applicationConfig.userDetailsService();
    }

    /**
     * TEST 1 (The Happy Path - Translation Success)
     * Goal: Prove that a custom database User is correctly mapped to a Spring Security UserDetails object.
     */
    @Test
    void test1_shouldTranslateValidUser() {
        // Arrange
        String testEmail = "user@army.mil";

        // Create our custom database User entity
        User mockedUser = new User();
        mockedUser.setEmail(testEmail);
        mockedUser.setPasswordHash("hashed_password_123");

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(mockedUser));

        // ACT
        UserDetails translatedUser = userDetailsService.loadUserByUsername(testEmail);

        // ASSERT
        assertNotNull(translatedUser, "The translated UserDetails object should not be null");

        // VERIFY
        assertEquals(testEmail, translatedUser.getUsername(), "The username should match email");
        assertEquals("hashed_password_123", translatedUser.getPassword(), "Password should match the database hash");
    }

    /**
     * TEST 2 (The Missing User Guardrail)
     * Goal: Prove that if an email isn't in our database, the translator strictly throws a UsernameNotFoundException.
     */
    @Test
    void test2_shouldThrowExceptionWhenUserNotFound() {
        // --- ARRANGE ---
        // Arrange
        String testEmail = "fake-user@army.mil";

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(UsernameNotFoundException.class, () -> {

            userDetailsService.loadUserByUsername(testEmail);

        }, "Should throw a UsernameNotFoundException when the user is not in the database");
    }
}
