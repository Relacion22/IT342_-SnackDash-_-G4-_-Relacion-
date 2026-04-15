package SnackDash.backend.dto;

public class StallRequest {
    private String name;
    private String category;
    private String description;
    private String imageUrl;

    // Constructor
    public StallRequest() {
    }

    public StallRequest(String name, String category, String description, String imageUrl) {
        this.name = name;
        this.category = category;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
