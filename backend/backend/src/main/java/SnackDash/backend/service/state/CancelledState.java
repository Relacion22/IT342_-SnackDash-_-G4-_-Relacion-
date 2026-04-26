package SnackDash.backend.service.state;

import SnackDash.backend.entity.Enums;
import SnackDash.backend.entity.Order;

public class CancelledState implements OrderState {
    @Override
    public void next(Order order) {
        // No next state
        throw new RuntimeException("Cancelled order cannot proceed.");
    }

    @Override
    public void cancel(Order order) {
        // Already cancelled
    }

    @Override
    public Enums.OrderStatus getStatus() {
        return Enums.OrderStatus.CANCELLED;
    }
}