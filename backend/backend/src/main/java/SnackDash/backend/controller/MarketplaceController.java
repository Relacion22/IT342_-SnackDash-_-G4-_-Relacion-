package SnackDash.backend.controller;

import SnackDash.backend.service.MarketplaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class MarketplaceController {

    @Autowired
    private MarketplaceService marketplaceService;

    @GetMapping("/stalls")
    public ResponseEntity<?> getAllStalls() {
        return ResponseEntity.ok(marketplaceService.getAllStalls());
    }

    @GetMapping("/stalls/{stallId}")
    public ResponseEntity<?> getStall(@PathVariable Long stallId) {
        return ResponseEntity.ok(marketplaceService.getStallById(stallId));
    }

    @GetMapping("/stalls/{stallId}/menu")
    public ResponseEntity<?> getStallMenu(@PathVariable Long stallId) {
        return ResponseEntity.ok(marketplaceService.getMenuForStall(stallId));
    }
}
