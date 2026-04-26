package SnackDash.backend.service.state;

import SnackDash.backend.entity.Enums;
import SnackDash.backend.entity.Order;

public class CompletedState implements OrderState {
    @Override
    public void next(Order order) {
        // No next state
        throw new RuntimeException("Order is already completed.");
    }

    @Override
    public void cancel(Order order) {
        // Cannot cancel once completed
        throw new RuntimeException("Cannot cancel completed order.");
    }

    @Override
    public Enums.OrderStatus getStatus() {
        return Enums.OrderStatus.COMPLETED;
    }
}