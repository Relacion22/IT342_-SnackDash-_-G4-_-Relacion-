package SnackDash.backend.repository;

import SnackDash.backend.entity.Stall;
import SnackDash.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StallRepository extends JpaRepository<Stall, Long> {
    /**
     * Find a stall by its owner (user)
     */
    Optional<Stall> findByOwner(User owner);

    /**
     * Find a stall by id and owner
     */
    Optional<Stall> findByIdAndOwner(Long id, User owner);

    List<Stall> findAllByOrderByCreatedAtDesc();

    long countByIsOpenTrue();
}
