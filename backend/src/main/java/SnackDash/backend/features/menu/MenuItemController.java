package SnackDash.backend.controller;

import SnackDash.backend.dto.MenuItemRequest;
import SnackDash.backend.dto.MenuItemResponse;
import SnackDash.backend.entity.User;
import SnackDash.backend.repository.UserRepository;
import SnackDash.backend.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Helper method to get authenticated user
     */
    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Authentication failed.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Add a new menu item
     * POST /api/menu/add
     */
    @PostMapping("/add")
    public ResponseEntity<?> addMenuItem(Authentication authentication, @RequestBody MenuItemRequest request) {
        try {
            User owner = getAuthenticatedUser(authentication);
            MenuItemResponse response = menuItemService.addMenuItem(owner, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding menu item: " + e.getMessage());
        }
    }

    /**
     * Get all menu items for the owner
     * GET /api/menu/all
     */
    @GetMapping("/all")
    public ResponseEntity<?> getMenuItems(Authentication authentication) {
        try {
            User owner = getAuthenticatedUser(authentication);
            List<MenuItemResponse> items = menuItemService.getMenuItemsForOwner(owner);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching menu items: " + e.getMessage());
        }
    }

    /**
     * Get a single menu item
     * GET /api/menu/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getMenuItem(Authentication authentication, @PathVariable Long id) {
        try {
            User owner = getAuthenticatedUser(authentication);
            MenuItemResponse item = menuItemService.getMenuItem(owner, id);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching menu item: " + e.getMessage());
        }
    }

    /**
     * Update a menu item
     * PUT /api/menu/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(Authentication authentication, @PathVariable Long id, @RequestBody MenuItemRequest request) {
        try {
            User owner = getAuthenticatedUser(authentication);
            MenuItemResponse response = menuItemService.updateMenuItem(owner, id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating menu item: " + e.getMessage());
        }
    }

    /**
     * Delete a menu item
     * DELETE /api/menu/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(Authentication authentication, @PathVariable Long id) {
        try {
            User owner = getAuthenticatedUser(authentication);
            menuItemService.deleteMenuItem(owner, id);
            return ResponseEntity.ok("Menu item deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting menu item: " + e.getMessage());
        }
    }
}
