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
import SnackDash.backend.repository.MenuItemRepository;
import SnackDash.backend.repository.OrderItemRepository;
import SnackDash.backend.repository.OrderRepository;
import SnackDash.backend.repository.StallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

        Order order = new Order();
        order.setUser(student);
        order.setStall(stall);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(Enums.OrderStatus.PENDING);
        order.setPaymentStatus(Enums.PaymentStatus.PAID);
        order.setSpecialInstructions(request.getSpecialInstructions());
        order.setTotalPrice(subtotal);

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

        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        return toOrderResponse(orderRepository.save(order));
    }

    private void validateStatusTransition(Enums.OrderStatus current, Enums.OrderStatus next) {
        if (next == null) {
            throw new RuntimeException("Status is required.");
        }
        if (current == Enums.OrderStatus.PENDING && next == Enums.OrderStatus.PREPARING) {
            return;
        }
        if (current == Enums.OrderStatus.PREPARING && next == Enums.OrderStatus.READY) {
            return;
        }
        if (current == Enums.OrderStatus.READY && next == Enums.OrderStatus.COMPLETED) {
            return;
        }
        if (next == Enums.OrderStatus.CANCELLED) {
            return;
        }
        throw new RuntimeException("Invalid order status transition.");
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
