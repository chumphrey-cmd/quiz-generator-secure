package io.chumahumphrey.qagen.qagenbackend.auth;

import io.chumahumphrey.qagen.qagenbackend.config.JwtService;
import io.chumahumphrey.qagen.qagenbackend.user.User;
import io.chumahumphrey.qagen.qagenbackend.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // Inject all our new security tools!
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * REGISTER: Hash the password and save to the database.
     */
    public String register(AuthRequest request) {
        User user = new User();
        user.setEmail(request.email());
        user.setRole("USER");

        user.setPasswordHash(passwordEncoder.encode(request.password()));

        userRepository.save(user);

        return "User registered successfully";
    }

    /**
     * LOGIN: Verify credentials and generate the real JWT.
     */
    public String login(AuthRequest request) { // Change AuthRequest to whatever DTO you named yours!
        // 1. The Bouncer: Tell Spring Security to verify the email and password.
        // If the password is wrong, this will automatically throw an exception and stop!
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        // 2. The VIP Pass: If they survived the bouncer, fetch the user from the database.
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // 3. The Math: Hand the user to our JwtService to generate the real, cryptographic token.
        return jwtService.generateToken(user);
    }
}