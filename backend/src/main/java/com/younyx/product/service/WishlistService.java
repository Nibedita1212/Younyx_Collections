package com.younyx.product.service;

import com.younyx.product.dto.ProductDto;
import com.younyx.product.entity.WishlistItem;
import com.younyx.auth.entity.Customer;
import com.younyx.product.entity.Product;
import com.younyx.product.repo.WishlistRepository;
import com.younyx.auth.repo.CustomerRepository;
import com.younyx.product.repo.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class WishlistService {
    private final WishlistRepository wishlistRepo;
    private final CustomerRepository customerRepo;
    private final ProductRepository productRepo;

    public WishlistService(WishlistRepository wishlistRepo,
                           CustomerRepository customerRepo,
                           ProductRepository productRepo) {
        this.wishlistRepo = wishlistRepo;
        this.customerRepo = customerRepo;
        this.productRepo = productRepo;
    }

    /**
     * Return DTOs (NOT entities) so Jackson never sees Hibernate proxies.
     * This method runs inside a read-only transaction so lazy-loading of
     * category.name (if needed) works safely.
     */
    @Transactional(readOnly = true)
    public List<ProductDto> getWishlistProducts(Long customerId) {
        Customer c = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return wishlistRepo.findByCustomer(c)
                .stream()
                .map(WishlistItem::getProduct)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ProductDto toDto(Product p) {
        String categoryName = null;
        if (p.getCategory() != null) {
            // inside @Transactional => safe to hit lazy proxy
            try {
                categoryName = p.getCategory().getName();
            } catch (Exception ex) {
                // defensive: if something odd happens, keep categoryName null
                categoryName = null;
            }
        }

        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getSku(),
                p.getPrice(),
                p.getStockQuantity(),    // ensure getter exists on Product
                p.getDescription(),
                p.getMainImageUrl(),
                p.getImage2Url(),
                p.getImage3Url(),
                p.getImage4Url(),
                categoryName
        );
    }

    /**
     * Toggle wishlist membership by productId. Service loads product entity here.
     */
    @Transactional
    public boolean toggle(Long customerId, Long productId) {
        // check if product exists
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        var existing = wishlistRepo.findByCustomerIdAndProductId(customerId, product.getId());
        if (existing.isPresent()) {
            wishlistRepo.delete(existing.get());
            return false;
        }

        Customer c = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        wishlistRepo.save(new WishlistItem(c, product));
        return true;
    }
}
