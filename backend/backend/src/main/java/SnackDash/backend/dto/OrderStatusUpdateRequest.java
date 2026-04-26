package SnackDash.backend.dto;

import SnackDash.backend.entity.Enums;

public class OrderStatusUpdateRequest {
    private Enums.OrderStatus status;

    public Enums.OrderStatus getStatus() {
        return status;
    }

    public void setStatus(Enums.OrderStatus status) {
        this.status = status;
    }
}
