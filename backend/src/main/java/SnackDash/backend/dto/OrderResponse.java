package SnackDash.backend.dto;

import SnackDash.backend.entity.Enums;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long stallId;
    private String stallName;
    private String stallImageUrl;
    private Enums.OrderStatus status;
    private BigDecimal totalPrice;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemSummaryResponse> items;

    public OrderResponse() {
    }

    public OrderResponse(Long id, String orderNumber, Long stallId, String stallName, String stallImageUrl, Enums.OrderStatus status, BigDecimal totalPrice, String specialInstructions, LocalDateTime createdAt, LocalDateTime updatedAt, List<OrderItemSummaryResponse> items) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.stallId = stallId;
        this.stallName = stallName;
        this.stallImageUrl = stallImageUrl;
        this.status = status;
        this.totalPrice = totalPrice;
        this.specialInstructions = specialInstructions;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Long getStallId() {
        return stallId;
    }

    public void setStallId(Long stallId) {
        this.stallId = stallId;
    }

    public String getStallName() {
        return stallName;
    }

    public void setStallName(String stallName) {
        this.stallName = stallName;
    }

    public String getStallImageUrl() {
        return stallImageUrl;
    }

    public void setStallImageUrl(String stallImageUrl) {
        this.stallImageUrl = stallImageUrl;
    }

    public Enums.OrderStatus getStatus() {
        return status;
    }

    public void setStatus(Enums.OrderStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<OrderItemSummaryResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemSummaryResponse> items) {
        this.items = items;
    }
}
