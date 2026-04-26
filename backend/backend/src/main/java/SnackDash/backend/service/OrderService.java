package SnackDash.backend.service;

import SnackDash.backend.dto.OrderCreateRequest;
import SnackDash.backend.dto.OrderItemSummaryResponse;
import SnackDash.backend.dto.OrderResponse;
import SnackDash.backend.entity.Enums;
import SnackDash.backend.entity.MenuItem;
import SnackDash.backend.entity.Order;
import SnackDash.backend.entity.OrderItem;
import SnackDash.backend.entity.Stall;
import SnackDash.backend.entity.User;
import SnackDash.backend.factory.OrderFactory;
import SnackDash.backend.repository.MenuItemRepository;
import SnackDash.backend.repository.OrderItemRepository;
import SnackDash.backend.repository.OrderRepository;
import SnackDash.backend.repository.StallRepository;
import SnackDash.backend.repository.UserRepository;
import SnackDash.backend.service.state.OrderState;
import SnackDash.backend.service.state.OrderStateFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private StallRepository stallRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderFactory orderFactory;

    @Autowired
    private OrderStateFactory orderStateFactory;

    @Transactional
    public OrderResponse createOrder(User student, OrderCreateRequest request) {
        if (student.getRole() != Enums.Role.STUDENT) {
            throw new RuntimeException("Only students can place orders.");
        }
        if (request.getMenuItemId() == null || request.getQuantity() == null || request.getQuantity() < 1) {
            throw new RuntimeException("Invalid order request.");
        }

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found."));
        if (menuItem.isDeleted() || !menuItem.isAvailable()) {
            throw new RuntimeException("This menu item is not available.");
        }

        Stall stall = stallRepository.findById(menuItem.getStall().getId())
                .orElseThrow(() -> new RuntimeException("Stall not found."));
        if (!stall.isOpen()) {
            throw new RuntimeException("This stall is currently closed.");
        }

        BigDecimal unitPrice = menuItem.getPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

        // Extract payment method from special instructions
        String paymentMethod = "CASH"; // default to cash
        if (request.getSpecialInstructions() != null && request.getSpecialInstructions().contains("Payment:")) {
            String[] parts = request.getSpecialInstructions().split("Payment:");
            if (parts.length > 1) {
                paymentMethod = parts[1].trim();
            }
        }

        // Check wallet balance only for online payment
        if ("ONLINE".equalsIgnoreCase(paymentMethod)) {
            if (student.getWalletBalance().compareTo(subtotal) < 0) {
                throw new RuntimeException("Insufficient wallet balance.");
            }
            // Deduct from wallet for online payment only
            student.setWalletBalance(student.getWalletBalance().subtract(subtotal));
            userRepository.save(student);
        }
        // For CASH payment, no wallet deduction needed

        // Use OrderFactory
        Order order = orderFactory.createOrder(student, stall, subtotal, request.getSpecialInstructions());
        order.setOrderNumber(generateOrderNumber());

        Order savedOrder = orderRepository.save(order);

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(savedOrder);
        orderItem.setMenuItem(menuItem);
        orderItem.setQuantity(request.getQuantity());
        orderItem.setHistoricalUnitPrice(unitPrice);
        orderItem.setSubtotal(subtotal);
        orderItemRepository.save(orderItem);

        return toOrderResponse(savedOrder);
    }

    public List<OrderResponse> getStudentOrders(User student) {
        return orderRepository.findByUserOrderByCreatedAtDesc(student).stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOwnerOrders(User owner) {
        Stall stall = stallRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Stall not found for this owner."));

        return orderRepository.findByStallOrderByCreatedAtDesc(stall).stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse updateOrderStatus(User owner, Long orderId, Enums.OrderStatus newStatus) {
        if (owner.getRole() != Enums.Role.OWNER) {
            throw new RuntimeException("Only stall owners can update order status.");
        }

        Stall stall = stallRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Stall not found for this owner."));

        Order order = orderRepository.findByIdAndStall(orderId, stall)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        // Use State Pattern for status transition
        OrderState currentState = orderStateFactory.getState(order.getStatus());
        if (newStatus == Enums.OrderStatus.CANCELLED) {
            currentState.cancel(order);
        } else {
            // For next status, check if it's the allowed next
            OrderState nextState = orderStateFactory.getState(newStatus);
            if (currentState.getStatus() == Enums.OrderStatus.PENDING && nextState.getStatus() == Enums.OrderStatus.PREPARING) {
                currentState.next(order);
            } else if (currentState.getStatus() == Enums.OrderStatus.PREPARING && nextState.getStatus() == Enums.OrderStatus.READY) {
                currentState.next(order);
            } else if (currentState.getStatus() == Enums.OrderStatus.READY && nextState.getStatus() == Enums.OrderStatus.COMPLETED) {
                currentState.next(order);
            } else {
                throw new RuntimeException("Invalid status transition from " + order.getStatus() + " to " + newStatus);
            }
        }

        return toOrderResponse(orderRepository.save(order));
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemSummaryResponse> items = orderItemRepository.findByOrder(order).stream()
                .map(item -> new OrderItemSummaryResponse(
                        item.getMenuItem().getId(),
                        item.getMenuItem().getName(),
                        item.getMenuItem().getImageUrl(),
                        item.getQuantity(),
                        item.getHistoricalUnitPrice(),
                        item.getSubtotal()
                ))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStall().getId(),
                order.getStall().getName(),
                order.getStall().getImageUrl(),
                order.getStatus(),
                order.getTotalPrice(),
                order.getSpecialInstructions(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                items
        );
    }

    private String generateOrderNumber() {
        return "#ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}
