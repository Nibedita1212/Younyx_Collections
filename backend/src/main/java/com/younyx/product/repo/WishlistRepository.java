package com.younyx.product.repo;

import com.younyx.product.entity.WishlistItem;
import com.younyx.auth.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByCustomer(Customer customer);
    Optional<WishlistItem> findByCustomerIdAndProductId(Long customerId, Long productId);
    void deleteByCustomerIdAndProductId(Long customerId, Long productId);
}
