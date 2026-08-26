package com.aditya.DMS.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.aditya.DMS.entity.User;
import com.aditya.DMS.repository.UserRepo;
import com.aditya.DMS.service.UserService;

@RestController
public class UserController {

    private final UserService userService;
    private final UserRepo userRepo;

    public UserController(UserService userService, UserRepo userRepo) {
        this.userService = userService;
        this.userRepo = userRepo;
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public User savedUser(@RequestBody User user) {
        return userService.savedUser(user);
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/users/me")
    @PreAuthorize("isAuthenticated()")
    public User getCurrentUser(Authentication authentication) {
        User user = userRepo.findByUsername(authentication.getName());
        if (user == null) {
            throw new RuntimeException("User not found.");
        }
        return user;
    }

    @PutMapping("/users/me")
    @PreAuthorize("isAuthenticated()")
    public User updateCurrentUser(
            @RequestBody User user,
            Authentication authentication) {
        User current = userRepo.findByUsername(authentication.getName());
        if (current == null) {
            throw new RuntimeException("User not found.");
        }
        user.setRole(current.getRole());
        user.setStatus(current.getStatus());
        return userService.updateUser(current.getId(), user);
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        return userService.updateUser(id, user);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
