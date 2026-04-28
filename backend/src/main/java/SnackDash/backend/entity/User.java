package SnackDash.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "school_id", unique = true)
    private String schoolId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private Enums.AccountStatus accountStatus = Enums.AccountStatus.ACTIVE;

    @Column(name = "wallet_balance", precision = 10, scale = 2)
    private BigDecimal walletBalance = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ================= NEW FIELDS FOR STUDENT PROFILE =================
    @Column(name = "course")
    private String course;

    @Column(name = "year_level")
    private String yearLevel;

    @Column(name = "profile_image_url", length = 1000)
    private String profileImageUrl;
    // ================================================================

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getSchoolId() { return schoolId; }
    public void setSchoolId(String schoolId) { this.schoolId = schoolId; }

    public Enums.Role getRole() { return role; }
    public void setRole(Enums.Role role) { this.role = role; }

    public Enums.AccountStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(Enums.AccountStatus accountStatus) { this.accountStatus = accountStatus; }

    public BigDecimal getWalletBalance() { return walletBalance; }
    public void setWalletBalance(BigDecimal walletBalance) { this.walletBalance = walletBalance; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getYearLevel() { return yearLevel; }
    public void setYearLevel(String yearLevel) { this.yearLevel = yearLevel; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
}