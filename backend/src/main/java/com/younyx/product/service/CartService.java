package com.younyx.product.service;

import com.younyx.product.entity.CartItem;
import com.younyx.product.entity.Product;
import com.younyx.auth.entity.Customer;
import com.younyx.product.repo.CartItemRepository;
import com.younyx.auth.repo.CustomerRepository;
import com.younyx.product.repo.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartRepo;
    private final CustomerRepository customerRepo;
    private final ProductRepository productRepo;

    // MAX per product per customer
    private static final int MAX_PER_PRODUCT = 2;

    public CartService(CartItemRepository cartRepo,
                       CustomerRepository customerRepo,
                       ProductRepository productRepo) {
        this.cartRepo = cartRepo;
        this.customerRepo = customerRepo;
        this.productRepo = productRepo;
    }

    /**
     * qty = absolute desired quantity for this cart item (>=1).
     * Enforces:
     *  - MAX_PER_PRODUCT per product per customer
     *  - not more than available stock (if known via Product.stockQuantity)
     *
     * Throws IllegalStateException with messages:
     *  - "OUT_OF_STOCK"
     *  - "INSUFFICIENT_STOCK:<available>"
     *  - "MAX_PER_PRODUCT:<max>"  (should rarely be needed because controller clamps earlier)
     */
    @Transactional
    public void addToCart(Long customerId, Product product, int qty) {
        if (qty < 1) {
            // treat zero or negative as remove
            removeFromCart(customerId, product.getId());
            return;
        }

        // Enforce server-side MAX
        if (qty > MAX_PER_PRODUCT) {
            throw new IllegalStateException("MAX_PER_PRODUCT:" + MAX_PER_PRODUCT);
        }

        // Fetch customer
        Customer c = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Try to read product stock from DB (prefer repository fresh read to avoid stale object)
        Integer available = null;
        try {
            // If caller passed a product entity that's detached or stale, re-read from repo to be safe
            if (product != null && product.getId() != null) {
                Optional<Product> fresh = productRepo.findById(product.getId());
                if (fresh.isPresent()) {
                    available = fresh.get().getStockQuantity();
                } else {
                    available = tryGetProductStock(product); // fallback to reflection on passed entity
                }
            } else {
                available = tryGetProductStock(product);
            }
        } catch (Exception ignored) {
            // fallback to reflection-based attempt
            available = tryGetProductStock(product);
        }

        // if product has zero or negative stock -> out of stock
        if (available != null) {
            if (available <= 0) {
                throw new IllegalStateException("OUT_OF_STOCK");
            }
            if (qty > available) {
                // not enough stock
                throw new IllegalStateException("INSUFFICIENT_STOCK:" + available);
            }
        }

        // At this point inventory check passed (or unknown). Persist cart item (create or update).
        Optional<CartItem> existing = cartRepo.findByCustomerIdAndProductId(customerId, product.getId());
        if (existing.isPresent()) {
            CartItem it = existing.get();
            it.setQty(qty);
            cartRepo.save(it);
        } else {
            CartItem it = new CartItem(c, product, qty);
            cartRepo.save(it);
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<CartItem> listCart(Long customerId) {
        Customer c = customerRepo.findById(customerId).orElseThrow(() -> new RuntimeException("Customer not found"));
        return cartRepo.findByCustomer(c);
    }

    @Transactional
    public void removeFromCart(Long customerId, Long productId) {
        Optional<CartItem> it = cartRepo.findByCustomerIdAndProductId(customerId, productId);
        it.ifPresent(cartRepo::delete);
    }

    // ---------------- helper ----------------

    /**
     * Try to read a numeric stock/available quantity value from Product using common getters.
     * Returns Integer >= 0 or null if not available.
     */
    private Integer tryGetProductStock(Product product) {
        if (product == null) return null;

        String[] methodNames = new String[]{
                "getStockQuantity", "getStock_quantity", "getStockQty",
                "getAvailableQty", "getAvailableQuantity", "getAvailable",
                "getStock", "getQuantity", "getQty", "getInventory"
        };

        Class<?> cls = product.getClass();
        for (String name : methodNames) {
            try {
                Method m = cls.getMethod(name);
                if (m != null) {
                    Object val = m.invoke(product);
                    Integer parsed = numberToInteger(val);
                    if (parsed != null) return parsed;
                }
            } catch (NoSuchMethodException nsme) {
                // try next
            } catch (Exception ignored) {
                // try next
            }
        }
        return null;
    }

    private Integer numberToInteger(Object obj) {
        if (obj == null) return null;
        try {
            if (obj instanceof Number) {
                return ((Number) obj).intValue();
            }
            String s = obj.toString().trim();
            if (s.isEmpty()) return null;
            return Integer.parseInt(s);
        } catch (Exception e) {
            return null;
        }
    }
}
