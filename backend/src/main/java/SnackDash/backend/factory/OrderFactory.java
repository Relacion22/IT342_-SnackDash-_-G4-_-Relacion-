package SnackDash.backend.factory;

import SnackDash.backend.entity.Order;
import SnackDash.backend.entity.Stall;
import SnackDash.backend.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderFactory {

    /**
     * Factory method for creating Order objects.
     * Separates object creation logic from business logic.
     */
    public Order createOrder(User user, Stall stall, BigDecimal totalPrice, String specialInstructions) {
        Order order = new Order();
        order.setUser(user);
        order.setStall(stall);
        order.setTotalPrice(totalPrice);
        order.setSpecialInstructions(specialInstructions);
        // Status defaults to PENDING in entity
        // PaymentStatus defaults to PAID in entity
        return order;
    }
}