package com.younyx.product.entity;

import com.younyx.auth.entity.Customer;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist_items", uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id","product_id"}))
public class WishlistItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public WishlistItem() {}
    public WishlistItem(Customer c, Product p) { this.customer = c; this.product = p; }

    // getters / setters...
    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
