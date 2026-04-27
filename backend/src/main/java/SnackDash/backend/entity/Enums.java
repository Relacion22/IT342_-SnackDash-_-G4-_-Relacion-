package SnackDash.backend.entity;

public class Enums {
    public enum Role { STUDENT, OWNER, ADMIN }
    public enum AccountStatus { ACTIVE, SUSPENDED }
    public enum OrderStatus { PENDING, PREPARING, READY, COMPLETED, CANCELLED }
    public enum PaymentStatus { PAID, REFUNDED, FAILED }
    public enum TransactionType { PAYMENT, TOP_UP, REFUND }
}