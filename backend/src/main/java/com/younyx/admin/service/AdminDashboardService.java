package com.younyx.admin.service;

import com.younyx.admin.dto.AdminDashboardStats;
import com.younyx.order.repo.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;

    public AdminDashboardService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public AdminDashboardStats getTodayStats() {

        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        long totalOrders = orderRepository.count();

        long ordersToday =
                orderRepository.countByCreatedAtBetween(startOfDay, endOfDay);

        BigDecimal revenueToday =
                orderRepository.sumRevenueBetween(startOfDay, endOfDay);

        if (revenueToday == null) {
            revenueToday = BigDecimal.ZERO;
        }

        return new AdminDashboardStats(
                totalOrders,
                ordersToday,
                revenueToday
        );
    }
}
