package SnackDash.backend.service;

import SnackDash.backend.entity.Enums;
import SnackDash.backend.entity.Stall;
import SnackDash.backend.entity.User;
import SnackDash.backend.repository.OrderRepository;
import SnackDash.backend.repository.StallRepository;
import SnackDash.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StallRepository stallRepository;

    @Autowired
    private OrderRepository orderRepository;

    // Admin Analytics
    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalUsers", userRepository.count());
        analytics.put("totalStudents", userRepository.countByRole(Enums.Role.STUDENT));
        analytics.put("totalOwners", userRepository.countByRole(Enums.Role.OWNER));
        analytics.put("totalAdmins", userRepository.countByRole(Enums.Role.ADMIN));
        analytics.put("activeStalls", stallRepository.countByIsOpenTrue());
        analytics.put("totalRevenue", orderRepository.sumAllTotalPrice());
        analytics.put("totalOrders", orderRepository.count());
        return analytics;
    }

    // Stall Owner Analytics
    public Map<String, Object> getStallOwnerAnalytics(User owner) {
        Stall stall = stallRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Stall not found for this owner."));

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("dailySales", orderRepository.countTodayOrders());
        analytics.put("dailyRevenue", orderRepository.sumTodayRevenue());
        analytics.put("totalOrders", orderRepository.findByStallOrderByCreatedAtDesc(stall).size());
        analytics.put("pendingOrders", orderRepository.countByStatus(Enums.OrderStatus.PENDING));
        analytics.put("preparingOrders", orderRepository.countByStatus(Enums.OrderStatus.PREPARING));
        analytics.put("readyOrders", orderRepository.countByStatus(Enums.OrderStatus.READY));
        analytics.put("completedOrders", orderRepository.countByStatus(Enums.OrderStatus.COMPLETED));
        return analytics;
    }
}