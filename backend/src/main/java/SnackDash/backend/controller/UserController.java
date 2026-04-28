package SnackDash.backend.controller;

import SnackDash.backend.entity.User;
import SnackDash.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody Map<String, String> payload) {
        System.out.println("========== PROFILE UPDATE REQUEST ==========");
        System.out.println("Payload received: " + payload);

        if (authentication == null) {
            System.out.println("❌ ERROR: Authentication is null. Token is missing or invalid.");
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        // Safely extract the identifying string from the token
        String username = "";
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        
        System.out.println("Authenticated User String: " + username);

        // First, try to find the user by their Email
        Optional<User> userOptional = userRepository.findByEmail(username);

        // If not found by email, the token might be storing the User ID instead. Try finding by ID!
        if (userOptional.isEmpty()) {
            try {
                Long userId = Long.parseLong(username);
                userOptional = userRepository.findById(userId);
            } catch (NumberFormatException e) {
                // Not a number, so it wasn't an ID either.
            }
        }

        if (userOptional.isEmpty()) {
            System.out.println("❌ ERROR: User could not be found in the database.");
            return ResponseEntity.badRequest().body(Map.of("error", "User not found in database"));
        }

        User user = userOptional.get();
        System.out.println("✅ Found user: " + user.getName());

        // Update the database with the new information
        if (payload.containsKey("course") && payload.get("course") != null) {
            user.setCourse(payload.get("course"));
        }
        if (payload.containsKey("yearLevel") && payload.get("yearLevel") != null) {
            user.setYearLevel(payload.get("yearLevel"));
        }
        if (payload.containsKey("profileImageUrl") && payload.get("profileImageUrl") != null) {
            user.setProfileImageUrl(payload.get("profileImageUrl"));
        }

        // Save permanently to the database
        userRepository.save(user);
        System.out.println("✅ Profile successfully saved to database!");
        System.out.println("============================================");
        
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully!"));
    }
}