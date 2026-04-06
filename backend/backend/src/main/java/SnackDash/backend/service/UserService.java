package SnackDash.backend.service;

import SnackDash.backend.entity.Enums.Role;
import SnackDash.backend.entity.User;
import SnackDash.backend.factory.UserFactory;
import SnackDash.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFactory userFactory; // 1. Inject the new Factory

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 1. User Registration Logic
    public User registerUser(String name, String email, String rawPassword, Role role) throws Exception {
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new Exception("Email is already registered!");
        }

        // Hash the password using BCrypt
        String hashedPassword = passwordEncoder.encode(rawPassword);

        // 2. REFACTORED: Use the factory to create the user object
        User newUser = userFactory.createUser(name, email, hashedPassword, role);

        // Save to database
        return userRepository.save(newUser);
    }

    // 2. User Login Logic
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