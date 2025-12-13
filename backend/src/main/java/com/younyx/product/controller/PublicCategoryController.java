package com.younyx.product.controller;

import com.younyx.product.dto.CategoryDto;
import com.younyx.product.entity.Category;
import com.younyx.product.repo.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class PublicCategoryController {

    private final CategoryRepository repo;

    public PublicCategoryController(CategoryRepository repo) {
        this.repo = repo;
    }

    // public list
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> listPublic() {
        List<Category> cats = repo.findAll();
        List<CategoryDto> dtos = new ArrayList<>(cats.size());
        for (Category c : cats) {
            long count = 0L;
            try {
                count = repo.countProductsByCategoryId(c.getId());
            } catch (Exception ignored) {
            }
            dtos.add(new CategoryDto(
                    c.getId(),
                    c.getName(),
                    c.getSlug(),
                    c.getImageUrl(),
                    count
            ));
        }
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        Optional<Category> opt = repo.findById(id);
        if (opt.isPresent()) {
            Category c = opt.get();
            long count = 0L;
            try {
                count = repo.countProductsByCategoryId(c.getId());
            } catch (Exception ignored) {}
            CategoryDto dto = new CategoryDto(
                    c.getId(),
                    c.getName(),
                    c.getSlug(),
                    c.getImageUrl(),
                    count
            );
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.status(404).body(java.util.Map.of("message", "Category not found"));
        }
    }

    // find by slug
    @GetMapping("/categories/slug/{slug}")
    public ResponseEntity<?> bySlug(@PathVariable String slug) {
        Optional<Category> opt = repo.findBySlug(slug);
        if (opt.isPresent()) {
            Category c = opt.get();
            long count = 0L;
            try {
                count = repo.countProductsByCategoryId(c.getId());
            } catch (Exception ignored) {}
            CategoryDto dto = new CategoryDto(
                    c.getId(),
                    c.getName(),
                    c.getSlug(),
                    c.getImageUrl(),
                    count
            );
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.status(404).body(java.util.Map.of("message", "Category not found"));
        }
    }
}
