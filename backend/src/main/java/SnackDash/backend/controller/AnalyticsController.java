package SnackDash.backend.controller;

import SnackDash.backend.dto.ApiResponse;
import SnackDash.backend.entity.User;
import SnackDash.backend.repository.UserRepository;
import SnackDash.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Authentication failed.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found."));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<?>> getAdminAnalytics(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            if (user.getRole() != SnackDash.backend.entity.Enums.Role.ADMIN) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied."));
            }
            return ResponseEntity.ok(ApiResponse.success(analyticsService.getAdminAnalytics()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/owner")
    public ResponseEntity<ApiResponse<?>> getOwnerAnalytics(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            if (user.getRole() != SnackDash.backend.entity.Enums.Role.OWNER) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied."));
            }
            return ResponseEntity.ok(ApiResponse.success(analyticsService.getStallOwnerAnalytics(user)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}