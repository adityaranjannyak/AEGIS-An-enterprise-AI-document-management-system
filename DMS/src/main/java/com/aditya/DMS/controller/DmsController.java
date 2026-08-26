package com.aditya.DMS.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aditya.DMS.service.DmsService;

@RestController
public class DmsController {

    private DmsService dmsService;

    public DmsController(DmsService dmsService) {
        this.dmsService = dmsService;
    }

    @GetMapping("/status")
    public String getControllerStatus() {
        return dmsService.getServiceStatus();
    }
}