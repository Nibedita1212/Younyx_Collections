package com.younyx.collection.dto;

public class CollectionDto {

    private Long id;
    private String name;
    private String slug;
    private String imageUrl;
    private String description;
    private long productCount;

    public CollectionDto(
            Long id,
            String name,
            String slug,
            String imageUrl,
            String description,
            long productCount
    ) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.imageUrl = imageUrl;
        this.description = description;
        this.productCount = productCount;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getImageUrl() { return imageUrl; }
    public String getDescription() { return description; }
    public long getProductCount() { return productCount; }
}
