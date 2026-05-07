package SnackDash.backend.dto;

import SnackDash.backend.entity.Enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    
    private Long id;
    private String orderNumber;
    private Long stallId;
    private String stallName;
    private String stallImageUrl;
    private OrderStatus status;
    private BigDecimal totalPrice;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemSummaryResponse> items;

    // ================= NEW FIELDS FOR STUDENT PROFILE =================
    private String studentName;
    private String studentCourse;
    private String studentYear;
    private String studentImage;
    // ================================================================

    // --- Original Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getStallId() { return stallId; }
    public void setStallId(Long stallId) { this.stallId = stallId; }

    public String getStallName() { return stallName; }
    public void setStallName(String stallName) { this.stallName = stallName; }

    public String getStallImageUrl() { return stallImageUrl; }
    public void setStallImageUrl(String stallImageUrl) { this.stallImageUrl = stallImageUrl; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<OrderItemSummaryResponse> getItems() { return items; }
    public void setItems(List<OrderItemSummaryResponse> items) { this.items = items; }

    // --- New Student Profile Getters and Setters ---
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentCourse() { return studentCourse; }
    public void setStudentCourse(String studentCourse) { this.studentCourse = studentCourse; }

    public String getStudentYear() { return studentYear; }
    public void setStudentYear(String studentYear) { this.studentYear = studentYear; }

    public String getStudentImage() { return studentImage; }
    public void setStudentImage(String studentImage) { this.studentImage = studentImage; }
}