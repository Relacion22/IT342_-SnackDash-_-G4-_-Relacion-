package SnackDash.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class ImageUploadService {

    @Value("${supabase.url:https://qvhpfepyskjhvyvcbljb.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.service-key:}")
    private String supabaseServiceKey;

    @Value("${supabase.bucket:stall-image}")
    private String bucketName;

    /**
     * Upload image to Supabase Storage
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID() + "." + extension;
        String objectPath = folder + "/" + uniqueFilename;

        // Construct upload URL
        String uploadUrl = String.format(
                "%s/storage/v1/object/%s/%s",
                supabaseUrl,
                bucketName,
                URLEncoder.encode(objectPath, StandardCharsets.UTF_8.toString())
        );

        try {
            // Make HTTP POST request to Supabase
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) 
                    new java.net.URL(uploadUrl).openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + supabaseServiceKey);
            conn.setRequestProperty("Content-Type", file.getContentType());
            conn.setDoOutput(true);

            // Upload file data
            try (var os = conn.getOutputStream()) {
                os.write(file.getBytes());
                os.flush();
            }

            // Check response
            int responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                String errorResponse = new String(conn.getErrorStream().readAllBytes());
                throw new RuntimeException("Supabase upload failed: " + errorResponse);
            }

            // Return public URL
            return String.format(
                    "%s/storage/v1/object/public/%s/%s",
                    supabaseUrl,
                    bucketName,
                    URLEncoder.encode(objectPath, StandardCharsets.UTF_8.toString())
            );

        } catch (Exception e) {
            throw new IOException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    /**
     * Extract file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
