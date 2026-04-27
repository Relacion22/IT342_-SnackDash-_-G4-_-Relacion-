package SnackDash.backend.service.state;

import SnackDash.backend.entity.Enums;
import org.springframework.stereotype.Component;

@Component
public class OrderStateFactory {
    public OrderState getState(Enums.OrderStatus status) {
        switch (status) {
            case PENDING:
                return new PendingState();
            case PREPARING:
                return new PreparingState();
            case READY:
                return new ReadyState();
            case COMPLETED:
                return new CompletedState();
            case CANCELLED:
                return new CancelledState();
            default:
                throw new IllegalArgumentException("Unknown order status: " + status);
        }
    }
}