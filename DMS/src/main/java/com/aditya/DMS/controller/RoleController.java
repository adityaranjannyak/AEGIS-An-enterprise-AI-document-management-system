package com.aditya.DMS.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.aditya.DMS.entity.Role;
import com.aditya.DMS.service.RoleService;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
public class RoleController {
    private RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }
    @PostMapping("/roles")
    public Role getSavedRole(@RequestBody Role role) {
        return roleService.savedRole(role);
    }
    @GetMapping("/roles")
        public List<Role> getAllRoles() {
            return roleService.getAllRoles();
        }
    @GetMapping("/roles/{id}")
    public Role getRoleById(@PathVariable Long id) {
        return roleService.getRoleById(id);
    }
    @PutMapping("/roles/{id}")
    public Role updateRole(@PathVariable Long id, @RequestBody Role role) {
    return roleService.updateRole(id, role);
    }
    @DeleteMapping("/roles/{id}")
    public void deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
    }
}
