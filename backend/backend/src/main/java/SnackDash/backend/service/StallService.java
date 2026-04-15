package SnackDash.backend.service;

import SnackDash.backend.dto.StallRequest;
import SnackDash.backend.dto.StallResponse;
import SnackDash.backend.entity.Stall;
import SnackDash.backend.entity.User;
import SnackDash.backend.repository.StallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class StallService {

    @Autowired
    private StallRepository stallRepository;

    /**
     * Create a new stall for a user (stall owner)
     */
    public StallResponse createStall(User owner, StallRequest request) {
        // Check if the owner already has a stall
        Optional<Stall> existingStall = stallRepository.findByOwner(owner);
        if (existingStall.isPresent()) {
            throw new RuntimeException("You already have a stall. Please update it instead.");
        }

        // Create new stall
        Stall stall = new Stall();
        stall.setName(request.getName());
        stall.setCategory(request.getCategory());
        stall.setDescription(request.getDescription());
        stall.setImageUrl(request.getImageUrl());
        stall.setOwner(owner);
        stall.setOpen(false); // New stalls are closed by default

        Stall savedStall = stallRepository.save(stall);

        return new StallResponse(
                savedStall.getId(),
                savedStall.getName(),
                savedStall.getCategory(),
                savedStall.getDescription(),
                savedStall.getImageUrl(),
                savedStall.isOpen(),
                savedStall.getCreatedAt()
        );
    }

    /**
     * Get stall for a specific owner
     */
    public StallResponse getStallByOwner(User owner) {
        Optional<Stall> stallOpt = stallRepository.findByOwner(owner);

        if (stallOpt.isEmpty()) {
            return null; // User doesn't have a stall yet
        }

        Stall stall = stallOpt.get();
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

    /**
     * Update an existing stall
     */
    public StallResponse updateStall(User owner, Long stallId, StallRequest request) {
        Optional<Stall> stallOpt = stallRepository.findByIdAndOwner(stallId, owner);

        if (stallOpt.isEmpty()) {
            throw new RuntimeException("Stall not found or you don't have permission to edit it.");
        }

        Stall stall = stallOpt.get();
        stall.setName(request.getName());
        stall.setCategory(request.getCategory());
        stall.setDescription(request.getDescription());
        stall.setImageUrl(request.getImageUrl());

        Stall updatedStall = stallRepository.save(stall);

        return new StallResponse(
                updatedStall.getId(),
                updatedStall.getName(),
                updatedStall.getCategory(),
                updatedStall.getDescription(),
                updatedStall.getImageUrl(),
                updatedStall.isOpen(),
                updatedStall.getCreatedAt()
        );
    }

    /**
     * Toggle stall open/close status
     */
    public StallResponse toggleStallStatus(User owner) {
        Optional<Stall> stallOpt = stallRepository.findByOwner(owner);

        if (stallOpt.isEmpty()) {
            throw new RuntimeException("Stall not found for this owner.");
        }

        Stall stall = stallOpt.get();
        stall.setOpen(!stall.isOpen());

        Stall updatedStall = stallRepository.save(stall);

        return new StallResponse(
                updatedStall.getId(),
                updatedStall.getName(),
                updatedStall.getCategory(),
                updatedStall.getDescription(),
                updatedStall.getImageUrl(),
                updatedStall.isOpen(),
                updatedStall.getCreatedAt()
        );
    }
}
