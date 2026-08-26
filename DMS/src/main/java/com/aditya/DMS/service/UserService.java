package com.aditya.DMS.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.aditya.DMS.entity.User;
import com.aditya.DMS.entity.Role;
import com.aditya.DMS.repository.RoleRepo;
import com.aditya.DMS.repository.UserRepo;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepo userRepo,
            RoleRepo roleRepo,
            PasswordEncoder passwordEncoder) {

        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public User savedUser(User user) {

        if (user == null) {
            throw new RuntimeException("User data is required.");
        }

        if (user.getUsername() == null ||
                user.getUsername().isBlank()) {

            throw new RuntimeException(
                    "User ID / username is required.");
        }

        if (user.getRole() == null ||
                (user.getRole().getId() == null &&
                        (user.getRole().getName() == null ||
                                user.getRole().getName().isBlank()))) {
            throw new RuntimeException(
                    "Role is required.");
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required.");
        }

        user.setRole(resolveRole(user));
        if (user.getStatus() == null || user.getStatus().isBlank()) {
            user.setStatus("ACTIVE");
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword()));

        return userRepo.save(user);
    }

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public User getUserById(Long id) {
        return userRepo.findById(id).orElse(null);
    }

    public User updateUser(Long id, User user) {

        User existingUser =
                userRepo.findById(id).orElse(null);

        if (existingUser == null) {
            return null;
        }

        if (user.getName() != null &&
                !user.getName().isBlank()) {

            existingUser.setName(user.getName());
        }

        if (user.getUsername() != null &&
                !user.getUsername().isBlank()) {

            existingUser.setUsername(user.getUsername());
        }

        if (user.getPassword() != null &&
                !user.getPassword().isBlank()) {

            existingUser.setPassword(
                    passwordEncoder.encode(
                            user.getPassword()));
        }

        if (user.getRole() != null) {
            existingUser.setRole(resolveRole(user));
        }

        if (user.getStatus() != null &&
                !user.getStatus().isBlank()) {
            existingUser.setStatus(user.getStatus());
        }

        return userRepo.save(existingUser);
    }

    private Role resolveRole(User user) {
        Long roleId = user.getRole().getId();
        if (roleId != null) {
            return roleRepo.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Role not found."));
        }
        String roleName = user.getRole().getName();
        return roleRepo.findAll().stream()
                .filter(role -> role.getName().equalsIgnoreCase(roleName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Role not found."));
    }

    public void deleteUser(Long id) {

        if (!userRepo.existsById(id)) {
            throw new RuntimeException("User not found.");
        }

        userRepo.deleteById(id);
    }
}
