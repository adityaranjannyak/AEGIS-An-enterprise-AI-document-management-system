package com.aditya.DMS.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aditya.DMS.entity.User;

public interface UserRepo extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
