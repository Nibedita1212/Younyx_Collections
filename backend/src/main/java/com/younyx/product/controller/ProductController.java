package com.younyx.product.controller;

import com.younyx.product.dto.ProductDto;
import com.younyx.product.entity.Product;
import com.younyx.product.repo.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class ProductController {

    private final ProductRepository productRepo;

    public ProductController(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    // helper: map entity -> dto (keep order matching your ProductDto record)
    private ProductDto toDto(Product p) {
        String categoryName = null;
        if (p.getCategory() != null) {
            categoryName = p.getCategory().getName();
        }

        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getSku(),
                p.getPrice(),
                p.getStockQuantity(),   // uses stockQuantity as we aligned earlier
                p.getDescription(),
                p.getMainImageUrl(),    // will be like "/uploads/products/xxx.png"
                p.getImage2Url(),
                p.getImage3Url(),
                p.getImage4Url(),
                categoryName
        );
    }

    // GET /api/products
    @GetMapping
    public List<ProductDto> list() {
        return productRepo.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // GET /api/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        Optional<Product> opt = productRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Product not found"));
        }
        return ResponseEntity.ok(toDto(opt.get()));
    }
}
