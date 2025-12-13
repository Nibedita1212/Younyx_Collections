package com.younyx.order.controller;

import com.younyx.product.entity.Product;
import com.younyx.product.repo.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final ProductRepository productRepo;

    public OrderController(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    public static class OrderItem {
        public Long productId;
        public Integer qty;
    }

    public static class Address {
        public String name;
        public String phone;
        public String addressLine;
        public String city;
        public String pincode;
    }

    public static class Payment {
        public String method; // "cod" | "upi" | "card"
        // UPI
        public String upiId;
        // Card (note: this is only placeholder validation. Don't store raw card data in production)
        public String cardNumber;
        public String cardName;
        public String expiry; // MM/YY or MM/YYYY
        public String cvv;
    }

    public static class OrderRequest {
        public List<OrderItem> items;
        public Address address;
        public Payment payment;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest req, @RequestHeader(value="X-User-Id", required=false) Long uid) {
        if (req == null || req.items == null || req.items.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No items"));
        }

        // Basic payment validation
        if (req.payment == null || req.payment.method == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing payment method"));
        }
        String m = req.payment.method.toLowerCase();
        if ("upi".equals(m)) {
            if (req.payment.upiId == null || req.payment.upiId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing UPI id"));
            }
        } else if ("card".equals(m)) {
            // Basic checks only; do NOT treat this as PCI-compliant
            String cn = req.payment.cardNumber == null ? "" : req.payment.cardNumber.replaceAll("\\s+", "");
            String cvv = req.payment.cvv == null ? "" : req.payment.cvv.trim();
            if (cn.length() < 12 || cn.length() > 19) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid card number"));
            }
            if (cvv.length() < 3 || cvv.length() > 4) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid CVV"));
            }
            if (req.payment.cardName == null || req.payment.cardName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing cardholder name"));
            }
            if (req.payment.expiry == null || req.payment.expiry.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing expiry"));
            }
        } else if ("cod".equals(m)) {
            // no extra validation
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Unknown payment method"));
        }

        // Validate stock for each item
        for (OrderItem it : req.items) {
            if (it == null || it.productId == null) continue;
            Product p = productRepo.findById(it.productId).orElse(null);
            if (p == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Product not found", "productId", it.productId));
            }
            int available = p.getStockQuantity() == null ? 0 : p.getStockQuantity();
            if (it.qty == null || it.qty < 1) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid qty for product", "productId", it.productId));
            }
            if (it.qty > available) {
                return ResponseEntity.status(409).body(Map.of(
                        "success", false,
                        "message", "Insufficient stock",
                        "productId", it.productId,
                        "availableQty", available
                ));
            }
        }

        // At this point basic validation passed.
        // NOTE: This code does NOT create persistent Orders or decrement stock.
        // Implement transactional persistence and payment gateway integration here.

        return ResponseEntity.ok(Map.of("success", true, "message", "Order accepted (stub)"));
    }
}
