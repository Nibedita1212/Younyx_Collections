package com.younyx.product.controller;

import com.younyx.product.dto.WishlistToggleRequest;
import com.younyx.product.dto.SimpleResponse;
import com.younyx.product.dto.ProductDto;
import com.younyx.product.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<?> get(@RequestHeader(value = "X-User-Id", required = false) Long uid) {
        if (uid == null)
            return ResponseEntity.status(401).body(new SimpleResponse(false, "Unauthorized"));

        List<ProductDto> items = wishlistService.getWishlistProducts(uid);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggle(@RequestBody WishlistToggleRequest req,
                                    @RequestHeader(value = "X-User-Id", required = false) Long uid) {
        if (uid == null)
            return ResponseEntity.status(401).body(new SimpleResponse(false, "Unauthorized"));

        if (req == null || req.getProductId() == null)
            return ResponseEntity.badRequest().body(new SimpleResponse(false, "productId required"));

        boolean added;
        try {
            added = wishlistService.toggle(uid, req.getProductId());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(new SimpleResponse(false, ex.getMessage()));
        }

        return ResponseEntity.ok(java.util.Map.of("ok", true, "added", added));
    }
}
