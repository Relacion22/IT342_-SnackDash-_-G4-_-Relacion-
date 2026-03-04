package SnackDash.backend.service;

import SnackDash.backend.entity.User;
import SnackDash.backend.entity.Role;
import SnackDash.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 1. User Registration Logic
    public User registerUser(String name, String email, String rawPassword, Role role) throws Exception {
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new Exception("Email is already registered!");
        }

        // Create new user
        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);

        // Hash the password using BCrypt
        String hashedPassword = passwordEncoder.encode(rawPassword);
        newUser.setPassword(hashedPassword);

        newUser.setRole(role);

        // Save to database
        return userRepository.save(newUser);
    }

    // 2. User Login Logic (We'll use this later in the controller)
    public Optional<User> authenticateUser(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Check if the raw password matches the hashed password in the DB
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }
}