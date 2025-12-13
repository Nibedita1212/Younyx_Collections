package com.younyx.product.dto;

import java.math.BigDecimal;

public record ProductDto(
        Long id,
        String name,
        String sku,
        BigDecimal price,
        Integer stockQuantity,   // renamed
        String description,
        String mainImageUrl,
        String image2Url,
        String image3Url,
        String image4Url,
        String category // optional
) {}
