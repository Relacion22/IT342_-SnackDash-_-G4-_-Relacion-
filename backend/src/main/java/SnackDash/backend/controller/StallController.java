package SnackDash.backend.controller;

import SnackDash.backend.dto.StallRequest;
import SnackDash.backend.dto.StallResponse;
import SnackDash.backend.entity.User;
import SnackDash.backend.repository.UserRepository;
import SnackDash.backend.service.StallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stall")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class StallController {

    @Autowired
    private StallService stallService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Helper method to get authenticated user from JWT token
     */
    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Create a new stall for the authenticated owner
     * POST /api/stall/create
     */
    @PostMapping("/create")
    public ResponseEntity<?> createStall(@RequestBody StallRequest request, Authentication authentication) {
        try {
            User owner = getAuthenticatedUser(authentication);
            if (owner == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Authentication failed.");
            }

            StallResponse response = stallService.createStall(owner, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("❌ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ Error creating stall: " + e.getMessage());
        }
    }

    /**
     * Get stall for the authenticated owner
     * GET /api/stall/my-stall
     */
    @GetMapping("/my-stall")
    public ResponseEntity<?> getMyStall(Authentication authentication) {
        try {
            User owner = getAuthenticatedUser(authentication);
            if (owner == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new java.util.HashMap<>(java.util.Map.of("error", "Authentication failed", "message", "User not found in database")));
            }

            StallResponse stall = stallService.getStallByOwner(owner);
            if (stall == null) {
                return ResponseEntity.ok(null); // Return null if stall doesn't exist
            }
            return ResponseEntity.ok(stall);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new java.util.HashMap<>(java.util.Map.of("error", "Error fetching stall", "message", e.getMessage())));
        }
    }

    /**
     * Update stall details
     * PUT /api/stall/{stallId}
     */
    @PutMapping("/{stallId}")
    public ResponseEntity<?> updateStall(@PathVariable Long stallId, @RequestBody StallRequest request, Authentication authentication) {
        try {
            User owner = getAuthenticatedUser(authentication);
            if (owner == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Authentication failed.");
            }

            StallResponse response = stallService.updateStall(owner, stallId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ Error updating stall: " + e.getMessage());
        }
    }

    /**
     * Toggle stall open/close status
     * PUT /api/stall/toggle-status
     */
    @PutMapping("/toggle-status")
    public ResponseEntity<?> toggleStallStatus(Authentication authentication) {
        try {
            User owner = getAuthenticatedUser(authentication);
            if (owner == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Authentication failed.");
            }

            StallResponse response = stallService.toggleStallStatus(owner);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ Error toggling stall status: " + e.getMessage());
        }
    }
}
