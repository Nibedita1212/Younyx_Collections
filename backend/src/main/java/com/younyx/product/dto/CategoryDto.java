package com.younyx.product.dto;

public record CategoryDto(
        Long id,
        String name,
        String slug,
        String imageUrl,
        long productCount
) {}
