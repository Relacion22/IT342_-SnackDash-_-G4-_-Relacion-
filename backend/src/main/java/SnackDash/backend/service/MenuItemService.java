package SnackDash.backend.service;

import SnackDash.backend.dto.MenuItemRequest;
import SnackDash.backend.dto.MenuItemResponse;
import SnackDash.backend.entity.MenuItem;
import SnackDash.backend.entity.Stall;
import SnackDash.backend.entity.User;
import SnackDash.backend.repository.MenuItemRepository;
import SnackDash.backend.repository.StallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private StallRepository stallRepository;

    /**
     * Add a new menu item to a stall
     */
    public MenuItemResponse addMenuItem(User owner, MenuItemRequest request) {
        Stall stall = stallRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Stall not found for this owner"));

        MenuItem menuItem = new MenuItem();
        menuItem.setStall(stall);
        menuItem.setName(request.getName());
        menuItem.setPrice(request.getPrice());
        menuItem.setDescription(request.getDescription());
        menuItem.setCategory(request.getCategory());
        menuItem.setCookingTimeMinutes(request.getCookingTimeMinutes());
        menuItem.setImageUrl(request.getImageUrl());
        menuItem.setAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);
        menuItem.setDeleted(false);

        MenuItem savedItem = menuItemRepository.save(menuItem);
        return convertToResponse(savedItem);
    }

    /**
     * Get all menu items for a stall owner
     */
    public List<MenuItemResponse> getMenuItemsForOwner(User owner) {
        Stall stall = stallRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Stall not found for this owner"));

        List<MenuItem> items = menuItemRepository.findByStallAndIsDeletedFalse(stall);
        return items.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update a menu item
     */
    public MenuItemResponse updateMenuItem(User owner, Long menuItemId, MenuItemRequest request) {
        Stall stall = stallRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Stall not found for this owner"));

        MenuItem menuItem = menuItemRepository.findByIdAndStall(menuItemId, stall);
        if (menuItem == null) {
            throw new RuntimeException("Menu item not found");
        }

        menuItem.setName(request.getName());
        menuItem.setPrice(request.getPrice());
        menuItem.setDescription(request.getDescription());
        menuItem.setCategory(request.getCategory());
        menuItem.setCookingTimeMinutes(request.getCookingTimeMinutes());
        menuItem.setImageUrl(request.getImageUrl());
        if (request.getIsAvailable() != null) {
            menuItem.setAvailable(request.getIsAvailable());
        }

        MenuItem updatedItem = menuItemRepository.save(menuItem);
        return convertToResponse(updatedItem);
    }

    /**
     * Delete a menu item (soft delete)
     */
    public void deleteMenuItem(User owner, Long menuItemId) {
        Stall stall = stallRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Stall not found for this owner"));

        MenuItem menuItem = menuItemRepository.findByIdAndStall(menuItemId, stall);
        if (menuItem == null) {
            throw new RuntimeException("Menu item not found");
        }

        menuItem.setDeleted(true);
        menuItemRepository.save(menuItem);
    }

    /**
     * Get a single menu item
     */
    public MenuItemResponse getMenuItem(User owner, Long menuItemId) {
        Stall stall = stallRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Stall not found for this owner"));

        MenuItem menuItem = menuItemRepository.findByIdAndStall(menuItemId, stall);
        if (menuItem == null || menuItem.isDeleted()) {
            throw new RuntimeException("Menu item not found");
        }

        return convertToResponse(menuItem);
    }

    /**
     * Convert MenuItem entity to response DTO
     */
    private MenuItemResponse convertToResponse(MenuItem menuItem) {
        return new MenuItemResponse(
                menuItem.getId(),
                menuItem.getName(),
                menuItem.getPrice(),
                menuItem.getDescription(),
                menuItem.getCategory(),
                menuItem.getCookingTimeMinutes(),
                menuItem.getImageUrl(),
                menuItem.isAvailable()
        );
    }
}
