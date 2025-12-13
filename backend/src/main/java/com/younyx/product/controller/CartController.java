package com.younyx.product.controller;

import com.younyx.product.dto.CartAddRequest;
import com.younyx.product.dto.SimpleResponse;
import com.younyx.product.dto.CartItemResponse;
import com.younyx.product.entity.Product;
import com.younyx.product.entity.CartItem;
import com.younyx.product.service.CartService;
import com.younyx.product.repo.ProductRepository;
import com.younyx.product.repo.CartItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Updated CartController:
 * - Treat incoming `qty` as the absolute desired quantity (not a delta).
 * - Enforce server MAX_PER_PRODUCT and stock checks via cartService.
 * - Keep endpoints /Add and /add for backward compatibility.
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {
  private final CartService cartService;
  private final ProductRepository productRepo;
  private final CartItemRepository cartItemRepo;

  private static final int MAX_PER_PRODUCT = 2;

  public CartController(CartService cs, ProductRepository pr, CartItemRepository cir){
    this.cartService = cs;
    this.productRepo = pr;
    this.cartItemRepo = cir;
  }

  // backward-compatible alias (keeps old route if used)
  @PostMapping("/Add")
  public ResponseEntity<?> addUpper(@RequestBody CartAddRequest r, @RequestHeader(value="X-User-Id", required=false) Long uid){
    return add(r, uid);
  }

  /**
   * Now interprets req.getQty() as the absolute desired quantity for the product.
   * Example: { productId: 123, qty: 1 } => set cart quantity for productId 123 to 1.
   */
  @PostMapping("/add")
  public ResponseEntity<?> add(@RequestBody CartAddRequest req, @RequestHeader(value="X-User-Id", required=false) Long uid){
    if(uid == null) {
      return ResponseEntity.status(401).body(new SimpleResponse(false,"Unauthorized"));
    }

    if (req == null || req.getProductId() == null) {
      return ResponseEntity.badRequest().body(new SimpleResponse(false, "Missing productId"));
    }

    Product p = productRepo.findById(req.getProductId()).orElse(null);
    if(p == null) {
      return ResponseEntity.status(404).body(new SimpleResponse(false,"Product not found"));
    }

    // Treat incoming qty as absolute desired quantity.
    int desiredQty = req.getQty() != null ? req.getQty() : 1;
    if (desiredQty < 1) desiredQty = 1;

    try {
      // clamp by server-side MAX
      if (desiredQty > MAX_PER_PRODUCT) desiredQty = MAX_PER_PRODUCT;

      // cartService.addToCart should accept absolute desired quantity and validate stock
      cartService.addToCart(uid, p, desiredQty);

      return ResponseEntity.ok(new SimpleResponse(true,"Added"));
    } catch (IllegalStateException ex) {
      String msg = ex.getMessage() == null ? "" : ex.getMessage();

      // Out of stock
      if ("OUT_OF_STOCK".equals(msg)) {
        return ResponseEntity.status(409).body(java.util.Map.of(
          "success", false,
          "message", "Out of stock",
          "availableQty", 0
        ));
      }

      // Insufficient stock -> message contains available qty (service should include it)
      if (msg.startsWith("INSUFFICIENT_STOCK:")) {
        String part = msg.substring("INSUFFICIENT_STOCK:".length());
        try {
          int available = Integer.parseInt(part);
          return ResponseEntity.status(409).body(java.util.Map.of(
            "success", false,
            "message", "Insufficient stock",
            "availableQty", available
          ));
        } catch (NumberFormatException nfe) {
          return ResponseEntity.status(409).body(java.util.Map.of(
            "success", false,
            "message", "Insufficient stock"
          ));
        }
      }

      // MAX per product enforced server-side
      if (msg.startsWith("MAX_PER_PRODUCT:")) {
        String part = msg.substring("MAX_PER_PRODUCT:".length());
        try {
          int max = Integer.parseInt(part);
          return ResponseEntity.status(409).body(java.util.Map.of(
            "success", false,
            "message", "Maximum per customer reached",
            "max", max
          ));
        } catch (NumberFormatException nfe) {
          return ResponseEntity.status(409).body(java.util.Map.of(
            "success", false,
            "message", "Maximum per customer reached"
          ));
        }
      }

      return ResponseEntity.status(400).body(new SimpleResponse(false, msg));
    } catch (Exception ex) {
      ex.printStackTrace();
      return ResponseEntity.status(500).body(new SimpleResponse(false, "Unexpected error: " + ex.getMessage()));
    }
  }

  @GetMapping
  public ResponseEntity<?> list(@RequestHeader(value="X-User-Id", required=false) Long uid){
    if(uid == null) return ResponseEntity.status(401).body(new SimpleResponse(false, "Unauthorized"));
    List<CartItem> items = cartService.listCart(uid);
    List<CartItemResponse> dto = items.stream().map(CartItemResponse::from).collect(Collectors.toList());
    return ResponseEntity.ok(dto);
  }

  @PostMapping("/remove")
  public ResponseEntity<?> remove(@RequestBody CartAddRequest req, @RequestHeader(value="X-User-Id", required=false) Long uid){
    if(uid==null) return ResponseEntity.status(401).body(new SimpleResponse(false,"Unauthorized"));
    cartService.removeFromCart(uid, req.getProductId());
    return ResponseEntity.ok(new SimpleResponse(true,"Removed"));
  }
}
