package SnackDash.backend.core;

import SnackDash.backend.entity.User;
import SnackDash.backend.repository.UserRepository;
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

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "menu-items") String folder,
            Authentication authentication) {
        try {
            if (authentication != null && authentication.isAuthenticated()) {
                User user = userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                if (file.isEmpty()) {
                    return ResponseEntity.badRequest().body("❌ File is empty");
                } else {
                    String imageUrl = imageUploadService.uploadImage(file, folder);
                    return ResponseEntity.ok(new ImageUploadResponse("✅ Image uploaded successfully", imageUrl));
                }
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Authentication required");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ Upload failed: " + e.getMessage());
        }
    }

    // Inner class required for the response
    public static class ImageUploadResponse {
        private String message;
        private String imageUrl;

        public ImageUploadResponse(String message, String imageUrl) {
            this.message = message;
            this.imageUrl = imageUrl;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
}