package com.younyx.product.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.younyx.admin.entity.Collection;


@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // basic info
    @Column(name = "name", nullable = false)
    private String name;

    // SKU
    @Column(name = "sku", length = 100, unique = true)
    private String sku;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // up to 4 image URLs (DB columns use these exact names)
    @Column(name = "main_image_url")
    private String mainImageUrl;

    @Column(name = "image2url")
    private String image2Url;

    @Column(name = "image3url")
    private String image3Url;

    @Column(name = "image4url")
    private String image4Url;

    // stock & status
    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "active")
    private Boolean active = true;

    // category relation (assumes categories table and Category entity exist)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "collection_id")
private Collection collection;


    // timestamps
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Product() {}

    // ---------- lifecycle ----------
    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (stockQuantity == null) stockQuantity = 0;
        if (active == null) active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ---------- getters ----------
    public Long getId() { return id; }

    public String getName() { return name; }

    public String getSku() { return sku; }

    public String getDescription() { return description; }

    public BigDecimal getPrice() { return price; }

    public String getMainImageUrl() { return mainImageUrl; }

    public String getImage2Url() { return image2Url; }

    public String getImage3Url() { return image3Url; }

    public String getImage4Url() { return image4Url; }

    public Integer getStockQuantity() { return stockQuantity; }

    public Boolean getActive() { return active; }

    public Category getCategory() { return category; }

public Collection getCollection() {
    return collection;
}

  
    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ---------- setters ----------
    public void setId(Long id) { this.id = id; }

    public void setName(String name) { this.name = name; }

    public void setSku(String sku) { this.sku = sku; }

    public void setDescription(String description) { this.description = description; }

    public void setPrice(BigDecimal price) { this.price = price; }

    public void setMainImageUrl(String mainImageUrl) { this.mainImageUrl = mainImageUrl; }

    public void setImage2Url(String image2Url) { this.image2Url = image2Url; }

    public void setImage3Url(String image3Url) { this.image3Url = image3Url; }

    public void setImage4Url(String image4Url) { this.image4Url = image4Url; }

    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public void setActive(Boolean active) { this.active = active; }

    public void setCategory(Category category) { this.category = category; }

    
public void setCollection(Collection collection) {
    this.collection = collection;
}

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ---------- toString ----------
    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", sku='" + sku + '\'' +
                ", price=" + price +
                ", stockQuantity=" + stockQuantity +
                ", mainImageUrl='" + mainImageUrl + '\'' +
                ", category=" + (category != null ? category.getId() : null) +
                '}';
    }
}
