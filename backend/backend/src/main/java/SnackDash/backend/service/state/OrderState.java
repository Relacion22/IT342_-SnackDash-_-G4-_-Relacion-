package SnackDash.backend.service.state;

import SnackDash.backend.entity.Enums;
import SnackDash.backend.entity.Order;

public interface OrderState {
    void next(Order order);
    void cancel(Order order);
    Enums.OrderStatus getStatus();
}