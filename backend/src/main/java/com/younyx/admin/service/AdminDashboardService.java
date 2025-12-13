package com.younyx.admin.service;

import com.younyx.admin.dto.AdminDashboardStats;
import com.younyx.product.repo.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AdminDashboardService {

    private final ProductRepository productRepo;

    public AdminDashboardService(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    public AdminDashboardStats getTodayStats() {
        long totalProducts = 0;
        long lowStockItems = 0;

        try {
            totalProducts = productRepo.count();
        } catch (Exception e) {
            totalProducts = 0;
        }

        try {
            // agar field ka naam stockQuantity hai to yahi sahi hai
            lowStockItems = productRepo.countByStockQuantityLessThanEqual(5);
        } catch (Exception e) {
            lowStockItems = 0;
        }

        // orders system abhi nahi hai, isliye 0 hi rakhenge
        long ordersToday = 0;
        BigDecimal revenueToday = BigDecimal.ZERO;

        return new AdminDashboardStats(
                totalProducts,
                ordersToday,
                lowStockItems,
                revenueToday
        );
    }
}
