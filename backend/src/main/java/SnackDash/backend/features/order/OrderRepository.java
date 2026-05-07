package SnackDash.backend.repository;

import SnackDash.backend.entity.Order;
import SnackDash.backend.entity.Stall;
import SnackDash.backend.entity.User;
import SnackDash.backend.entity.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    List<Order> findByStallOrderByCreatedAtDesc(Stall stall);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user LEFT JOIN FETCH o.stall WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT o FROM Order o WHERE o.user = :user ORDER BY o.createdAt DESC")
    List<Order> findByUserWithDetails(@Param("user") User user);

    @Query("SELECT o FROM Order o WHERE o.stall = :stall ORDER BY o.createdAt DESC")
    List<Order> findByStallWithDetails(@Param("stall") Stall stall);

    Optional<Order> findByIdAndStall(Long id, Stall stall);

    long countByStatus(Enums.OrderStatus status);

    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.status = :status")
    BigDecimal sumTotalPriceByStatus(@Param("status") Enums.OrderStatus status);

    @Query("SELECT SUM(o.totalPrice) FROM Order o")
    BigDecimal sumAllTotalPrice();

    @Query(value = "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE", nativeQuery = true)
    long countTodayOrders();

    @Query(value = "SELECT SUM(total_price) FROM orders WHERE DATE(created_at) = CURRENT_DATE", nativeQuery = true)
    BigDecimal sumTodayRevenue();
}
