package SnackDash.backend.service.state;

import SnackDash.backend.entity.Enums;
import SnackDash.backend.entity.Order;

public class ReadyState implements OrderState {
    @Override
    public void next(Order order) {
        order.setStatus(Enums.OrderStatus.COMPLETED);
    }

    @Override
    public void cancel(Order order) {
        // Cannot cancel once ready
        throw new RuntimeException("Cannot cancel order once it's ready.");
    }

    @Override
    public Enums.OrderStatus getStatus() {
        return Enums.OrderStatus.READY;
    }
}