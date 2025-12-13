package com.younyx.product.repo;

import com.younyx.product.entity.CartItem;
import com.younyx.auth.entity.Customer;
import com.younyx.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
  Optional<CartItem> findByCustomerIdAndProductId(Long customerId, Long productId);
  List<CartItem> findByCustomer(Customer customer);
}
