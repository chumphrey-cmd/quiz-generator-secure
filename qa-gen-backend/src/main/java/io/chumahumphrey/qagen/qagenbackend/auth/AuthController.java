package io.chumahumphrey.qagen.qagenbackend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// 1. Tells Spring: Window that returns JSON/Text
@RestController

// 2. Sets the base URL for every endpoint in this file
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    // 3. Tells Spring: "If a POST request comes to /api/auth/register, route it here"
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest request) {

        // Hand the JSON payload to the Service
        String message = authService.register(request);

        // Package the Service's answer into an HTTP 201
        return  ResponseEntity.status(HttpStatus.CREATED).body(message);
    }
    // The Exception Catcher: If ANY method in this file throws an IllegalArgumentException it routes here!
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequest request) {
        String token = authService.login(request);
        /// Here we are returning the generated token via /api/auth/login so that our frontend authentication can grab it!
        return ResponseEntity.ok(token);
    }

    // Exception Catcher: if any method throws a security exception it routes here!
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<String> handleUnauthorized(SecurityException e) {
        // Take the generic error message and wrap it in a 401
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }
}
