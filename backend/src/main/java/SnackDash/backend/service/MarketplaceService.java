package SnackDash.backend.service;

import SnackDash.backend.dto.MenuItemResponse;
import SnackDash.backend.dto.StallResponse;
import SnackDash.backend.entity.MenuItem;
import SnackDash.backend.entity.Stall;
import SnackDash.backend.repository.MenuItemRepository;
import SnackDash.backend.repository.StallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceService {

    @Autowired
    private StallRepository stallRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<StallResponse> getAllStalls() {
        return stallRepository.findAll().stream()
                .map(this::toStallResponse)
                .collect(Collectors.toList());
    }

    public StallResponse getStallById(Long stallId) {
        Stall stall = stallRepository.findById(stallId)
                .orElseThrow(() -> new RuntimeException("Stall not found"));
        return toStallResponse(stall);
    }

    public List<MenuItemResponse> getMenuForStall(Long stallId) {
        Stall stall = stallRepository.findById(stallId)
                .orElseThrow(() -> new RuntimeException("Stall not found"));

        return menuItemRepository.findByStallAndIsDeletedFalse(stall).stream()
                .filter(MenuItem::isAvailable)
                .map(this::toMenuItemResponse)
                .collect(Collectors.toList());
    }

    private StallResponse toStallResponse(Stall stall) {
        return new StallResponse(
                stall.getId(),
                stall.getName(),
                stall.getCategory(),
                stall.getDescription(),
                stall.getImageUrl(),
                stall.isOpen(),
                stall.getCreatedAt()
        );
    }

    private MenuItemResponse toMenuItemResponse(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getName(),
                item.getPrice(),
                item.getDescription(),
                item.getCategory(),
                item.getCookingTimeMinutes(),
                item.getImageUrl(),
                item.isAvailable()
        );
    }
}
