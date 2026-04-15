package SnackDash.backend.repository;

import SnackDash.backend.entity.MenuItem;
import SnackDash.backend.entity.Stall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    /**
     * Find all menu items for a specific stall, excluding deleted items
     */
    List<MenuItem> findByStallAndIsDeletedFalse(Stall stall);

    /**
     * Find a specific menu item by id and ensure it belongs to the stall
     */
    MenuItem findByIdAndStall(Long id, Stall stall);

    List<MenuItem> findByStallIdAndIsDeletedFalse(Long stallId);
}
