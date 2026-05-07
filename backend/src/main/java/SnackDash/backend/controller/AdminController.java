package SnackDash.backend.controller;

import SnackDash.backend.dto.ApiResponse;
import SnackDash.backend.dto.OrderResponse;
import SnackDash.backend.entity.User;
import SnackDash.backend.factory.OrderFactory;
import SnackDash.backend.repository.OrderRepository;
import SnackDash.backend.repository.StallRepository;
import SnackDash.backend.repository.UserRepository;
import SnackDash.backend.repository.WalletTransactionRepository;
import SnackDash.backend.service.AnalyticsService;
import SnackDash.backend.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private AnalyticsService analyticsService;
    @Autowired private UserRepository userRepository;
    @Autowired private StallRepository stallRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private WalletService walletService;
    @Autowired private OrderFactory orderFactory;
    @Autowired private WalletTransactionRepository transactionRepository;
    @Autowired private SnackDash.backend.service.StallService stallService;

    // ==========================================
    // 1. ANALYTICS (Overview)
    // ==========================================
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<?>> getOverviewMetrics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAdminAnalytics()));
    }

    // ==========================================
    // 2. USER MANAGEMENT
    // ==========================================
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Page<User> usersPage = userRepository.findAll(
                PageRequest.of(page, size, Sort.by("id").descending())
        );

        // Safely map the raw Database Entities to prevent Lazy-Loading crashes
        List<Map<String, Object>> safeUsers = usersPage.getContent().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("name", user.getName());
            map.put("email", user.getEmail());
            
            // Safely convert Enums to Strings
            map.put("role", user.getRole() != null ? user.getRole().name() : "N/A");
            map.put("accountStatus", user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE");
            
            map.put("walletBalance", user.getWalletBalance());
            return map;
        }).collect(Collectors.toList());

        // Re-package the data into the exact format React expects (res.data.data.content)
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("content", safeUsers);
        responseData.put("totalPages", usersPage.getTotalPages());

        return ResponseEntity.ok(ApiResponse.success(responseData));
    }
    // ==========================================
    // 3. STALL MANAGEMENT
    // ==========================================
   @PutMapping("/stalls/{id}/toggle")
    public ResponseEntity<ApiResponse<String>> toggleStallStatus(@PathVariable Long id) {
        // Calls the new admin function to force the stall open/closed
        stallService.adminToggleStallStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Stall status toggled successfully"));
    }

    @PutMapping("/stalls/{id}/approve")
    public ResponseEntity<ApiResponse<String>> approveStall(@PathVariable Long id) {
        // TODO: Implement approval logic
        return ResponseEntity.ok(ApiResponse.success("Stall approved successfully"));
    }

    // ==========================================
    // 4. GLOBAL ORDERS
    // ==========================================
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getGlobalOrders() {
        // We use the OrderFactory to safely convert raw Database Entities into DTOs
        List<OrderResponse> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(orderFactory::toOrderResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    // ==========================================
    // 5. FINANCIALS & WALLET
    // ==========================================
    @PostMapping("/wallet/refund")
    public ResponseEntity<ApiResponse<String>> issueRefund(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        
        walletService.issueRefund(userId, amount);
        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully"));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTransactions() {
        // Safely map the raw Database Entities to prevent Lazy-Loading crashes
        List<Map<String, Object>> safeTxns = transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(txn -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", txn.getId());
                    map.put("amount", txn.getAmount());
                    map.put("transactionType", txn.getTransactionType().name());
                    map.put("createdAt", txn.getCreatedAt());

                    // Safely extract just the User ID and Name
                    if (txn.getUser() != null) {
                        map.put("user", Map.of(
                                "id", txn.getUser().getId(),
                                "name", txn.getUser().getName()
                        ));
                    }
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(safeTxns));
    }
}