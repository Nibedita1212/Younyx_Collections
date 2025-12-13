package com.younyx.order.controller;

import com.younyx.order.dto.AdminOrderSummaryDto;
import com.younyx.order.entity.Order;
import com.younyx.order.entity.OrderStatus;
import com.younyx.order.repo.OrderRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "http://localhost:3001", allowCredentials = "true")
public class AdminOrderController {

    private final OrderRepository orderRepo;

    public AdminOrderController(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    private AdminOrderSummaryDto toSummaryDto(Order o) {
        return new AdminOrderSummaryDto(
                o.getId(),
                o.getOrderNumber(),
                o.getCustomerName(),
                o.getCustomerEmail(),
                o.getCustomerPhone(),
                o.getItemsCount() != null ? o.getItemsCount() : 0,
                o.getTotalAmount(),
                o.getStatus().name(),
                o.getPaymentMethod(),
                o.isPaid(),
                o.getCreatedAt()
        );
    }

    // ---------- LIST (latest first) ----------
    @GetMapping
    public List<AdminOrderSummaryDto> list() {
        return orderRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toSummaryDto)
                .toList();
    }

    // ---------- GET ONE (summary for now) ----------
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        Optional<Order> opt = orderRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Order not found"));
        }
        return ResponseEntity.ok(toSummaryDto(opt.get()));
    }

    // ---------- UPDATE STATUS ----------
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status
    ) {
        Optional<Order> opt = orderRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Order not found"));
        }

        Order order = opt.get();

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "Invalid status value"));
        }

        // simple rules:
        // DELIVERED / CANCELLED ke baad status change nahi
        if (order.getStatus() == OrderStatus.DELIVERED
                || order.getStatus() == OrderStatus.CANCELLED) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "This order is already final"));
        }

        order.setStatus(newStatus);

        // paid flag manage
        if (newStatus == OrderStatus.PAID || newStatus == OrderStatus.DELIVERED) {
            order.setPaid(true);
        }
        if (newStatus == OrderStatus.CANCELLED) {
            order.setPaid(false);
        }

        Order saved = orderRepo.save(order);
        return ResponseEntity.ok(toSummaryDto(saved));
    }
}
