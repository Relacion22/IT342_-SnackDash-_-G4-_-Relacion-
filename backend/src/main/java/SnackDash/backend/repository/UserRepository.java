package SnackDash.backend.repository;

import SnackDash.backend.entity.User;
import SnackDash.backend.entity.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // We will need this for Login
    Optional<User> findByEmail(String email);

    // We will need this for Registration to prevent duplicate accounts
    boolean existsByEmail(String email);

    long countByRole(Enums.Role role);
}