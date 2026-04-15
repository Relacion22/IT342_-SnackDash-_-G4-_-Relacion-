package SnackDash.backend.factory;

import SnackDash.backend.entity.Enums.Role;
import SnackDash.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserFactory {

    /**
     * Factory method responsible for constructing and initializing the User object.
     * This separates object creation logic from business logic.
     */
    public User createUser(String name, String email, String hashedPassword, Role role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(hashedPassword);
        user.setRole(role);

        // In the future, if you need specific initialization for different roles
        // (like setting up an empty stall profile for an OWNER or a zero balance for a STUDENT),
        // you add it here instead of cluttering your UserService!
        /*
        if (role == Role.STUDENT) {
            // setup student specifics
        }
        */

        return user;
    }
}