package SnackDash.backend.service;

import SnackDash.backend.entity.User;
import SnackDash.backend.entity.Role;
import SnackDash.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.util.Collections;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Replace this with your actual Google Client ID from Google Cloud Console
    private static final String CLIENT_ID = "569783179376-ctp1kqkeasiasm4pu42lkcmjojn4e6tb.apps.googleusercontent.com";

    // 1. User Registration Logic (Standard)
    public User registerUser(String name, String email, String rawPassword, Role role) throws Exception {
        if (userRepository.existsByEmail(email)) {
            throw new Exception("Email is already registered!");
        }

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        newUser.setRole(role);

        // Explicitly set as LOCAL for standard email/password registrations
        newUser.setAuthProvider("LOCAL");

        return userRepository.save(newUser);
    }

    // 2. User Login Logic (Standard)
    public Optional<User> authenticateUser(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    // 3. NEW: Google Sign-In Logic
    public User verifyGoogleTokenAndLogin(String idTokenString, Role selectedRole) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(CLIENT_ID))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();

            String email = payload.getEmail();
            String name = (String) payload.get("name");

            Optional<User> existingUser = userRepository.findByEmail(email);

            if (existingUser.isPresent()) {
                // User exists, return the user to log them in
                return existingUser.get();
            } else {
                // User doesn't exist, register them automatically
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name);
                // Assign the role they selected on the frontend
                newUser.setRole(selectedRole != null ? selectedRole : Role.STUDENT);

                // NEW: Tell the database this is a Google account
                newUser.setAuthProvider("GOOGLE");

                // Give them a random UUID password since they use Google to log in
                newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));

                return userRepository.save(newUser);
            }
        } else {
            throw new Exception("Invalid Google ID token.");
        }
    }
}