package io.chumahumphrey.qagen.qagenbackend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * @Component tells Spring to manage this class so we can inject it elsewhere.
 * Extending OncePerRequestFilter guarantees this logic fires exactly one time per HTTP request.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // Dependency Injection: We need our engine, and Spring's built-in user fetching interface
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Grab the "Authorization" header from the incoming HTTP request
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 2. GUARDRAIL: If there is no header, or it doesn't start with "Bearer", this request isn't trying to use a JWT.
        // We simply pass the request to the next filter in the chain and exit early.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. EXTRACT: "Bearer " takes up the first 7 characters. We slice the string to get just the token.
        jwt = authHeader.substring(7);

        try {
            // Ask our engine to read the email from the token
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // If the token is expired or malformed, the JJWT library throws an error.
            // We catch it, ignore it, and pass the request down. Spring Security will block them automatically later.
            filterChain.doFilter(request, response);
            return;
        }

        // 4. AUTHENTICATE: If we successfully extracted an email AND the user isn't already authenticated...
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Go to the database and get the user's details
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // Ask our engine if this token is actually valid for this specific user
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // --- THE OFFICIAL CHECK-IN ---
                // Create the official "VIP Pass" object that Spring Security understands
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // We don't pass the password back and forth
                        userDetails.getAuthorities() // Their roles (e.g., ROLE_USER)
                );

                // Add extra request details (like IP address, session info)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Hand the VIP pass to Spring Security. They are now officially logged in for this request!
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 5. Always ensure the request continues down the chain to reach our actual Controllers
        filterChain.doFilter(request, response);
    }
}