package io.chumahumphrey.qagen.qagenbackend.auth;

import io.chumahumphrey.qagen.qagenbackend.config.JwtService;
import io.chumahumphrey.qagen.qagenbackend.user.User;
import io.chumahumphrey.qagen.qagenbackend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    // 2. The Mock Dependencies
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    // 3. The Class Under Test (Mockito will automatically inject the @Mocks above into this service!)
    @InjectMocks
    private AuthService authService;

    /// TEST 1: The Happy Path for Registration
    @Test
    void test1_register_ShouldHashPasswordAndSaveUser() {
        // Arrange: Create a fake request
        AuthRequest request = new AuthRequest("officer@army.mil", "SecurePassword123!");

        // Arrange: Tell the fake encoder what to do when asked to hash
        when(passwordEncoder.encode("SecurePassword123!")).thenReturn("hashed_password_123");

        // Act: Call the real method
        String response = authService.register(request);

        // Assert: Verify the response is correct
        assertEquals("User registered successfully", response);

        // Assert: Verify that the repository's save() method was actually called exactly once!
        verify(userRepository, times(1)).save(any(User.class));
    }

    /// TEST 2: The Happy Path for Login
    @Test
    void test2_login_ShouldAuthenticateAndReturnJwt() {
        // Arrange: Create a fake request and a fake user
        AuthRequest request = new AuthRequest("officer@army.mil", "SecurePassword123!");
        User mockUser = new User();
        mockUser.setEmail("officer@army.mil");

        // Arrange: Tell the fake repo to return our mockUser when searched by email
        when(userRepository.findByEmail("officer@army.mil")).thenReturn(Optional.of(mockUser));

        // Arrange: Tell the fake JwtService to return a specific string when given our mockUser
        when(jwtService.generateToken(mockUser)).thenReturn("eyJhbG.fake.token");

        // Act: Call the real method
        String token = authService.login(request);

        // Assert: Verify the bouncer (AuthenticationManager) was actually called
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));

        // Assert: Verify we got the token back
        assertEquals("eyJhbG.fake.token", token);
    }

    /// TEST 3: The Unhappy Path for Login (Bad Password)
    @Test
    void test3_login_ShouldThrowExceptionWhenCredentialsAreInvalid() {
        // Arrange: Create a fake request with a BAD password
        AuthRequest request = new AuthRequest("officer@army.mil", "WrongPassword!");

        // Arrange: Tell the bouncer (AuthenticationManager) to throw a Spring Security exception
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // Act & Assert: Verify that calling login actually throws the exception upward
        assertThrows(BadCredentialsException.class, () -> authService.login(request));

        // Assert: Verify that because the bouncer threw an error, we NEVER tried to search the database
        verify(userRepository, never()).findByEmail(anyString());
    }
}