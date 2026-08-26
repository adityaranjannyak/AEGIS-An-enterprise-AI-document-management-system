package com.aditya.DMS.service;
import java.util.List;

import org.springframework.stereotype.Service;
import com.aditya.DMS.entity.Role;
import com.aditya.DMS.repository.RoleRepo;

@Service
public class RoleService {
private RoleRepo roleRepo;

    public RoleService(RoleRepo roleRepo) {
        this.roleRepo = roleRepo;
    }
    public Role savedRole (Role role) {
    Role savedRole = roleRepo.save(role);
    return savedRole;}
    public List<Role> getAllRoles() {
        return roleRepo.findAll();
    }
    public Role getRoleById(Long id) {
        return roleRepo.findById(id).orElse(null);
    }
    public Role updateRole(Long id, Role role) {
        Role existingRole = roleRepo.findById(id).orElse(null);
        if (existingRole != null) {
            existingRole.setName(role.getName());
            return roleRepo.save(existingRole);
        } else {
            return null; // or throw an exception indicating that the role was not found
        }
    }
    public void deleteRole(Long id) {
    roleRepo.deleteById(id);
}
}
