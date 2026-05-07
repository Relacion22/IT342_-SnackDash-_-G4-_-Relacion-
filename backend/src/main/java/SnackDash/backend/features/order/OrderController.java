package SnackDash.backend.controller;

import SnackDash.backend.dto.ApiResponse;
import SnackDash.backend.dto.OrderCreateRequest;
import SnackDash.backend.dto.OrderStatusUpdateRequest;
import SnackDash.backend.entity.User;
import SnackDash.backend.repository.UserRepository;
import SnackDash.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class OrderController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Authentication failed.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createOrder(@RequestBody OrderCreateRequest request, Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success(orderService.createOrder(getAuthenticatedUser(authentication), request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<?>> getMyOrders(Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success(orderService.getStudentOrders(getAuthenticatedUser(authentication))));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/owner")
    public ResponseEntity<ApiResponse<?>> getOwnerOrders(Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success(orderService.getOwnerOrders(getAuthenticatedUser(authentication))));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<?>> updateOrderStatus(@PathVariable Long orderId, @RequestBody OrderStatusUpdateRequest request, Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success(orderService.updateOrderStatus(getAuthenticatedUser(authentication), orderId, request.getStatus())));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }
}
