package SnackDash.backend.service.state;

import SnackDash.backend.entity.Enums;
import SnackDash.backend.entity.Order;

public class PendingState implements OrderState {
    @Override
    public void next(Order order) {
        order.setStatus(Enums.OrderStatus.PREPARING);
    }

    @Override
    public void cancel(Order order) {
        order.setStatus(Enums.OrderStatus.CANCELLED);
    }

    @Override
    public Enums.OrderStatus getStatus() {
        return Enums.OrderStatus.PENDING;
    }
}