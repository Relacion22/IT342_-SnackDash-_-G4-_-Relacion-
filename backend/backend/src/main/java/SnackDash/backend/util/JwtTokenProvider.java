package SnackDash.backend.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String secretKeyString;

    private SecretKey SECRET_KEY;
    private static final long JWT_EXPIRATION_MS = 86400000; // 24 hours

    // Initialize the SECRET_KEY from the property after construction
    @jakarta.annotation.PostConstruct
    private void init() {
        SECRET_KEY = Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }

    /**
     * Generate JWT token for a user
     */
    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION_MS);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(SECRET_KEY, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Get email from token
     */
    public String getEmailFromToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(SECRET_KEY)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Get role from token
     */
    public String getRoleFromToken(String token) {
        try {
            return (String) Jwts.parser()
                    .verifyWith(SECRET_KEY)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("role");
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(SECRET_KEY)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
