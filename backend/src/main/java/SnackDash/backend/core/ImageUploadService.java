package SnackDash.backend.core;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
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

    public String uploadImage(MultipartFile file, String folder) throws Exception {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }

        String uniqueFilename = UUID.randomUUID().toString() + extension;
        String objectPath = folder + "/" + uniqueFilename;
        
        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", 
            supabaseUrl, bucketName, URLEncoder.encode(objectPath, StandardCharsets.UTF_8.toString()));

        URL url = new URL(uploadUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + supabaseServiceKey);
        conn.setRequestProperty("Content-Type", file.getContentType());
        conn.setDoOutput(true);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(file.getBytes());
            os.flush();
        }

        int responseCode = conn.getResponseCode();
        if (responseCode >= 200 && responseCode < 300) {
            return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, objectPath);
        } else {
            InputStream errorStream = conn.getErrorStream();
            String errorResponse = errorStream != null ? 
                new String(errorStream.readAllBytes(), StandardCharsets.UTF_8) : "Unknown error";
            throw new RuntimeException("Supabase upload failed: " + errorResponse);
        }
    }
}