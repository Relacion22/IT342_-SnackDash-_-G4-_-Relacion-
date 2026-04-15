package SnackDash.backend.repository;

import SnackDash.backend.entity.Order;
import SnackDash.backend.entity.Stall;
import SnackDash.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    List<Order> findByStallOrderByCreatedAtDesc(Stall stall);

    Optional<Order> findByIdAndStall(Long id, Stall stall);
}
