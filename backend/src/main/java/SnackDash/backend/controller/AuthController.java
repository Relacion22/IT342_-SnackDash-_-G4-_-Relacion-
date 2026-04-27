package SnackDash.backend.controller;

import SnackDash.backend.dto.LoginRequest;
import SnackDash.backend.dto.LoginResponse;
import SnackDash.backend.dto.RegisterRequest;
import SnackDash.backend.dto.GoogleLoginRequest; // Make sure you created this DTO
import SnackDash.backend.entity.User;
import SnackDash.backend.service.UserService;
import SnackDash.backend.util.JwtTokenProvider;

// Google API Client Imports
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Value("${GOOGLE_CLIENT_ID:YOUR_CLIENT_ID_HERE.apps.googleusercontent.com}")
    private String googleClientId;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User newUser = userService.registerUser(
                    request.getName(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getRole()
            );
            return ResponseEntity.ok("User registered successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.authenticateUser(request.getEmail(), request.getPassword());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check if the user's role matches the requested role
            if (request.getRole() != null && !request.getRole().equals(user.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("❌ Invalid role. You are a " + user.getRole() + ", not a " + request.getRole() + ".");
            }
            
            // Generate JWT token
            String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().toString());
            
            // Return login response with token
            LoginResponse response = new LoginResponse(
                    "✅ Login successful!",
                    token,
                    user.getEmail(),
                    user.getName(),
                    user.getRole().toString()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Invalid email or password");
        }
    }

    // --- NEW GOOGLE LOGIN ENDPOINT ---
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            // Use configured Google client ID, or override with GOOGLE_CLIENT_ID environment variable.
            String clientId = googleClientId;

            // 1. Set up the Google Verifier
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            // 2. Verify the token sent from the frontend
            GoogleIdToken idToken = verifier.verify(request.getToken());

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                // 3. Extract user info from the token
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // 4. Find or create the user in your database using the service method
                User user = userService.processOAuthPostLogin(email, name, request.getRole());

                // 5. Check if the user's role matches the requested role
                if (request.getRole() != null && !request.getRole().equals(user.getRole().toString())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("❌ Invalid role. You are a " + user.getRole() + ", not a " + request.getRole() + ".");
                }

                // 6. Generate JWT token
                String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().toString());

                // 7. Return login response with token
                LoginResponse response = new LoginResponse(
                        "✅ Google Login successful!",
                        token,
                        user.getEmail(),
                        user.getName(),
                        user.getRole().toString()
                );
                return ResponseEntity.ok(response);

            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google token");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Google Authentication Failed: " + e.getMessage());
        }
    }
}