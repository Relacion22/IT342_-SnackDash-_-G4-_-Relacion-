package SnackDash.backend.controller;

import SnackDash.backend.entity.User;
import SnackDash.backend.repository.UserRepository;
import SnackDash.backend.service.ImageUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ImageUploadController {

    @Autowired
    private ImageUploadService imageUploadService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Upload image to Supabase storage
     * POST /api/upload/image
     */
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "menu-items") String folder,
            Authentication authentication) {
        try {
            // Validate user is authenticated
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Authentication required");
            }

            // Get authenticated user
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("❌ File is empty");
            }

            // Upload to Supabase
            String imageUrl = imageUploadService.uploadImage(file, folder);

            return ResponseEntity.ok(new ImageUploadResponse(
                    "✅ Image uploaded successfully",
                    imageUrl
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Upload failed: " + e.getMessage());
        }
    }

    /**
     * Response DTO for image upload
     */
    public static class ImageUploadResponse {
        public String message;
        public String imageUrl;

        public ImageUploadResponse(String message, String imageUrl) {
            this.message = message;
            this.imageUrl = imageUrl;
        }

        public String getMessage() {
            return message;
        }

        public String getImageUrl() {
            return imageUrl;
        }
    }
}
