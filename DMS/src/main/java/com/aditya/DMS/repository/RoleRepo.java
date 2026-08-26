package com.aditya.DMS.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aditya.DMS.entity.Role;

public interface RoleRepo extends JpaRepository<Role, Long> {
    
}