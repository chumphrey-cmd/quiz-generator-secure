package io.chumahumphrey.qagen.qagenbackend.auth;

import io.chumahumphrey.qagen.qagenbackend.config.JwtService;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 1. Tell Spring to ONLY boot up the web layer for the AuthController
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
// Normally Spring security blocks all unregistered post requests, but this temporarily pauses it since we're testing our backend.
public class AuthControllerTest {

    // 2. The Fake Customer (Drives up to the window to send HTTP requests)
    @Autowired
    private MockMvc mockMvc;

    // --- SPRING SECURITY MOCKS ---
    // We must provide fake versions of these so the SecurityFilterChain can successfully boot up in our test context
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    // 3. The Fake Kitchen (Replaces @Mock. Tells Spring to put a fake service into the controller)
    @MockitoBean
    private AuthService authService; // (You might need to create this class if you haven't yet!)

    // 4. The Translator (Converts Java objects into clean JSON strings)
    @Autowired
    private ObjectMapper objectMapper;

    /// TEST 1: Registration Happy Path
    @Test
    public void shouldReturn201WhenRegistrationIsSuccessful() throws Exception {

        // 1. Arrange: Create a JSON request with a new email and password
        // Using a Map is a quick way to represent a JSON object: {"email": "...", "password": "..."}
        Map<String, String> registerRequest = Map.of(
                "email", "newuser@gmail.com",
                "password", "SecurePassword123!"
        );
        String jsonPayload = objectMapper.writeValueAsString(registerRequest);

        // 2. Arrange: Tell the Mock AuthService to return a success message
        // (Assuming our service returns a string message on success)
        when(authService.register(any())).thenReturn("User registered successfully");

        // 3 & 4. Act & Assert: Send the request and expect specific results!
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(jsonPayload))
                .andExpect(status().isCreated()) // Expecting 201 Created
                .andExpect(content().string("User registered successfully"))
                .andDo(print());
    }

    /// TEST 2: Registration Guardrail (Email in use)
    @Test
    public void shouldReturn400WhenEmailIsAlreadyInUse() throws Exception {
        // 1. Arrange: Create a JSON request with an email that already exists
        Map<String, String> registerRequest = Map.of(
                "email", "newuser@gmail.com",
                "password", "SecurePassword123!"
        );
        String jsonPayload = objectMapper.writeValueAsString(registerRequest);

        // 2. Arrange: Tell the Mock AuthService to throw an exception saying "Email already in use"
        when(authService.register(any())).thenThrow(new IllegalArgumentException("Email already in use"));

        // 3. Act: Send a POST request to "/api/auth/register" with the JSON payload.
        // 4. Assert: Expect a 400 Bad Request status and the specific error message.
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(jsonPayload))
                .andExpect(status().isBadRequest()) // Expecting 400 here
                .andExpect(content().string("Email already in use"))
                .andDo(print());
    }

    /// TEST 3: Login Happy Path
    @Test
    public void shouldReturn200AndTokenWhenLoginIsSuccessful() throws Exception {

        // 1. Arrange: Create a JSON request with a valid email and password.
        Map<String, String> loginRequest = Map.of(
                "email", "newuser@gmail.com",
                "password", "SecurePassword123!"
        );
        String jsonPayload = objectMapper.writeValueAsString(loginRequest);

        // 2. Arrange: Tell the Mock AuthService to return a fake token when 'login' is called.
        when(authService.login(any())).thenReturn("fake-jwt-token");

        // 3. Act: Send a POST request to "/api/auth/login" with the JSON payload.
        // 4. Assert: Expect a 200 (OK) status and the "fake-jwt-token" message.
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(jsonPayload))
                .andExpect(status().isOk()) // Expecting 200 (OK) here...
                .andExpect(content().string("fake-jwt-token"))
                .andDo(print());
    }

    /// TEST 4: Login Guardrail
    @Test
    public void shouldReturn401WhenCredentialsAreInvalid() throws Exception {

        // 1. Arrange: Create a JSON request with bad credentials.
        Map<String, String> loginRequest = Map.of(
                "email", "newuser@gmail.com",
                "password", "BadPassword!"
        );
        String jsonPayload = objectMapper.writeValueAsString(loginRequest);

        // 2. Arrange: Tell the Mock AuthService to throw a SecurityException
        // with the message "Invalid email or password" when login is called.
        when(authService.login(any())).thenThrow(new SecurityException("Invalid email or password"));

        // 3. Act: Send a POST request to "/api/auth/login" with the JSON payload.
        // 4. Assert: Expect a 401 Unauthorized status and the exact vague error message
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(jsonPayload))
                .andExpect(status().isUnauthorized()) // Expecting 401 (Unauthorized) here...
                .andExpect(content().string("Invalid email or password"))
                .andDo(print());
    }

}


