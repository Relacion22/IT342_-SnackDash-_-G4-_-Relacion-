package SnackDash.backend.factory;

import SnackDash.backend.entity.Order;
import SnackDash.backend.entity.Stall;
import SnackDash.backend.entity.User;
import SnackDash.backend.dto.OrderResponse; 
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderFactory {

    public Order createOrder(User user, Stall stall, BigDecimal totalPrice, String specialInstructions) {
        Order order = new Order();
        order.setUser(user);
        order.setStall(stall);
        order.setTotalPrice(totalPrice);
        order.setSpecialInstructions(specialInstructions);
        return order;
    }

    public OrderResponse toOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        
        // FIXED: Pass the enum directly
        response.setStatus(order.getStatus()); 
        
        response.setTotalPrice(order.getTotalPrice());
        
        if (order.getStall() != null) {
            response.setStallName(order.getStall().getName());
        }

        // Attach the student's profile to the order for the UI
        if (order.getUser() != null) {
            response.setStudentName(order.getUser().getName());
            response.setStudentCourse(order.getUser().getCourse()); 
            response.setStudentYear(order.getUser().getYearLevel());
            response.setStudentImage(order.getUser().getProfileImageUrl());
        }

        return response;
    }
}