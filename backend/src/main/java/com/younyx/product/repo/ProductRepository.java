package com.younyx.product.repo;

import com.younyx.product.entity.Product;
import com.younyx.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// IMPORTANT: use jakarta.persistence for newer Spring Boot / Jakarta EE
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    long countByStockQuantityLessThanEqual(int threshold);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    long countByCategory(Category category);

    // Use PESSIMISTIC_WRITE lock to avoid oversell in concurrent requests
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}
