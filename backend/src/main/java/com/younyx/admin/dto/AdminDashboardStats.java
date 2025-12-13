package com.younyx.admin.dto;

import java.math.BigDecimal;

public record AdminDashboardStats(
        long totalProducts,
        long ordersToday,
        long lowStockItems,
        BigDecimal revenueToday
) {}
