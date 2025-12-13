package com.younyx.admin.controller;

import com.younyx.admin.dto.AdminDashboardStats;
import com.younyx.admin.service.AdminDashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3001", allowCredentials = "true")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardStats getDashboardStats() {
        return dashboardService.getTodayStats();
    }
}
