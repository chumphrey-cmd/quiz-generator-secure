package io.chumahumphrey.qagen.qagenbackend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

/**
 * @ExtendWith tells JUnit to enable Mockito. This allows us to use @Mock annotations
 * to create fake dependencies instead of manually typing "new FakeJwtService()".
 */
@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    // --- DEPENDENCIES TO MOCK ---
    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    // --- THE CLASS WE ARE TESTING ---
    // @InjectMocks tells Mockito: "Take the mocks above and shove them into this filter's constructor."
    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // --- FAKE HTTP OBJECTS ---
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();

        // Clear the Security Context before every test. Spring Security stores the logged-in user in a global ThreadLocal. If we don't clear it, a successful login from one test will bleed into the next test!
        SecurityContextHolder.clearContext();
    }

    /**
     * TEST 1 (The Missing Header Guardrail)
     * Goal: Prove that if a request comes in without an Authorization header,
     * the filter ignores it, does NOT authenticate anyone, and passes it down the chain.
     */
    @Test
    void test1_shouldIgnoreRequestWithoutAuthHeader() throws ServletException, IOException {

        // --- ACT ---
        // Fire the fake HTTP request through our filter
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // --- ASSERT ---
        // 1. Verify that the Security Context remains entirely empty (nobody is logged in)
        assertNull(SecurityContextHolder.getContext().getAuthentication(), "Security context should remain null");

        // 2. Verify that our filter gracefully passed the request down to the next filter
        verify(filterChain, times(1)).doFilter(request, response);

        // 3. Verify that our JwtService engine was never even touched (saves CPU cycles!)
        verifyNoInteractions(jwtService);
    }

    /**
     * TEST 2 (The Malformed Header Guardrail)
     * Goal: Prove that if a request has an Authorization header, but it doesn't start with "Bearer ",
     * the filter ignores it and safely passes the request down the chain.
     */
    @Test
    void test2_shouldIgnoreRequestWithMalformedAuthHeader() throws ServletException, IOException {
        // --- ARRANGE ---
        // We add an Authorization header to the fake request, but we deliberately make it a "Basic" token.
        request.addHeader("Authorization", "Basic someRandomBase64String");

        // --- ACT ---
        // Fire the fake HTTP request through our filter
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // --- ASSERT ---
        // 1. Verify that the Security Context remains entirely empty (nobody is logged in)
        assertNull(SecurityContextHolder.getContext().getAuthentication(), "Security context should remain null");

        // 2. Verify that our filter gracefully passed the request down to the next filter
        verify(filterChain, times(1)).doFilter(request, response);

        // 3. Verify that our JwtService engine was never touched
        verifyNoInteractions(jwtService);
    }

    /**
     * TEST 3 (The Expired/Invalid Token Guardrail)
     * Goal: Prove that if a request has a properly formatted token, but the JwtService engine
     * determines it is invalid or expired, the user is NOT authenticated.
     */
    @Test
    void test3_shouldNotAuthenticateIfTokenIsInvalid() throws ServletException, IOException {
        // --- ARRANGE ---
        String fakeJwt = "some.fake.jwt.token";
        String userEmail = "hacker@army.mil";

        // Add a properly formatted Bearer token to the request
        request.addHeader("Authorization", "Bearer " + fakeJwt);

        // 4. Create a mock Spring Security `UserDetails` object using your dummy email and a fake password.
        /// NOTE: Here we are instantiating the Spring Security default user, NOT our User Entity...
        UserDetails newUser = new User(userEmail, "password", new java.util.ArrayList<>());

        // --- MOCKITO MAGIC ---
        // We dictate exactly how our mock dependencies should behave when the filter calls them.

        // 1. When the filter asks for the email, return our fake email.
        when(jwtService.extractUsername(fakeJwt)).thenReturn(userEmail);

        // 2. When the filter looks up the user, return our mock user details.
        when(userDetailsService.loadUserByUsername(userEmail)).thenReturn(newUser);

        // 3. When the filter asks if the token is valid, force it to return FALSE.
        when(jwtService.isTokenValid(fakeJwt, newUser)).thenReturn(false);

        // --- ACT ---
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // --- ASSERT ---
        // Because the token was invalid, the Security Context must remain entirely empty!
        assertNull(SecurityContextHolder.getContext().getAuthentication(), "Security context should remain null for invalid tokens");

        // The filter must still safely pass the request down the chain (so Spring Security can officially block it later)
        verify(filterChain, times(1)).doFilter(request, response);
    }

    /**
     * TEST 4 (The Golden Path / Happy Path)
     * Goal: Prove that a valid token correctly authenticates the user and populates the Security Context.
     */
    @Test
    void test4_shouldAuthenticateValidUser() throws ServletException, IOException {
        // --- ARRANGE ---
        String validJwt = "real.jwt.token";
        String userEmail = "real-user@army.mil";

        // 3. Add an "Authorization" header to the `request` object.
        request.addHeader("Authorization", "Bearer " + validJwt);

        // 4. Create a mock Spring Security `UserDetails` object using your dummy email and a fake password.
        /// NOTE: Here we are instantiating the Spring Security default user, NOT our User Entity...
        UserDetails newUser = new User(userEmail, "password", new java.util.ArrayList<>());

        // --- MOCKITO MAGIC ---
        // We dictate exactly how our mock dependencies should behave when the filter calls them.

        // 1. When the filter asks for the email, return our fake email.
        when(jwtService.extractUsername(validJwt)).thenReturn(userEmail);

        // 2. When the filter looks up the user, return our mock user details.
        when(userDetailsService.loadUserByUsername(userEmail)).thenReturn(newUser);

        // 3. When the filter asks if the token is valid, force it to return true.
        when(jwtService.isTokenValid(validJwt, newUser)).thenReturn(true);

        // --- ACT ---
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // --- ASSERT ---
        // 1. Verify that the Security Context is NO LONGER null
        assertNotNull(SecurityContextHolder.getContext().getAuthentication(), "Security context should remain NOT NULL for valid tokens");

        // 2. Verify that the filter safely passed the request down to the next filter in the chain.
        verify(filterChain, times(1)).doFilter(request, response);

    }
}