package com.younyx.product.dto;

import java.math.BigDecimal;

public record AdminProductDto(
        Long id,
        String name,
        String sku,
        BigDecimal price,
        Integer stockQuantity,
        String description,
        String mainImageUrl,
        String image2Url,
        String image3Url,
        String image4Url,
        Long categoryId,
        String categoryName
) {}
