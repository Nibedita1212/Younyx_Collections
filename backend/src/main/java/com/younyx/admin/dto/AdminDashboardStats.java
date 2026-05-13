package com.younyx.admin.dto;

import java.math.BigDecimal;

public record AdminDashboardStats(
        long totalOrders,
        long ordersToday,
        BigDecimal revenueToday
) {}
