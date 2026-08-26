package com.aditya.DMS;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.aditya.DMS.entity.Role;
import com.aditya.DMS.repository.RoleRepo;

@SpringBootApplication
public class DmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(DmsApplication.class, args);
    }

    @Bean
    CommandLineRunner seedDefaultRoles(RoleRepo roleRepo) {
        return args -> {
            for (String roleName : List.of("ADMIN", "MANAGER", "EMPLOYEE")) {
                if (!roleRepo.existsByNameIgnoreCase(roleName)) {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepo.save(role);
                }
            }
        };
    }
}