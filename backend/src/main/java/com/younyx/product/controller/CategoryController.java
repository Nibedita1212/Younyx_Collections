package com.younyx.product.controller;

import com.younyx.product.dto.CategoryDto;
import com.younyx.product.entity.Category;
import com.younyx.product.repo.CategoryRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class CategoryController {

    private final CategoryRepository repo;

    public CategoryController(CategoryRepository repo) {
        this.repo = repo;
    }

    // files stored on disk under uploads/categories/
    private static final String UPLOAD_ROOT = "uploads/categories/";

    private String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        Files.createDirectories(Paths.get(UPLOAD_ROOT));

        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + ext;

        Path target = Paths.get(UPLOAD_ROOT + fileName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // IMPORTANT: return a relative URL that the frontend will request:
        // e.g. "/api/uploads/categories/<fileName>"
        return "/api/uploads/categories/" + fileName;
    }

    private CategoryDto toDto(Category c) {
        return new CategoryDto(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getImageUrl(),
                0L // productCount placeholder for now
        );
    }

    // GET all (admin)
    @GetMapping
    public List<CategoryDto> list() {
        return repo.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(c -> ResponseEntity.ok(toDto(c)))
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(java.util.Map.of("message", "Category not found")));
    }

    // CREATE
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> create(
            @RequestParam("name") String name,
            @RequestParam("slug") String slug,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("message", "Name is required"));
            }
            if (slug == null || slug.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("message", "Slug is required"));
            }

            String cleanName = name.trim();
            String cleanSlug = slug.trim();

            if (repo.findByName(cleanName).isPresent()) {
                return ResponseEntity.status(409)
                        .body(java.util.Map.of("message", "Category name already exists"));
            }
            if (repo.findBySlug(cleanSlug).isPresent()) {
                return ResponseEntity.status(409)
                        .body(java.util.Map.of("message", "Category slug already exists"));
            }

            Category c = new Category();
            c.setName(cleanName);
            c.setSlug(cleanSlug);

            if (image != null && !image.isEmpty()) {
                String imageUrl = saveFile(image);
                c.setImageUrl(imageUrl);
            }

            Category saved = repo.save(c);
            return ResponseEntity.ok(toDto(saved));

        } catch (DataIntegrityViolationException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(409)
                    .body(java.util.Map.of("message", "Category already exists (DB constraint)"));
        } catch (IOException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("message", "Failed to save image"));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("message", "Unexpected error: " + ex.getMessage()));
        }
    }

    // UPDATE
    @PutMapping(path = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("slug") String slug,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {

        return repo.findById(id)
                .map(existing -> {
                    try {
                        String cleanName = name.trim();
                        String cleanSlug = slug.trim();

                        repo.findByName(cleanName).ifPresent(other -> {
                            if (!other.getId().equals(id)) {
                                throw new IllegalStateException("NAME_DUPLICATE");
                            }
                        });

                        repo.findBySlug(cleanSlug).ifPresent(other -> {
                            if (!other.getId().equals(id)) {
                                throw new IllegalStateException("SLUG_DUPLICATE");
                            }
                        });

                        existing.setName(cleanName);
                        existing.setSlug(cleanSlug);

                        if (image != null && !image.isEmpty()) {
                            String imageUrl = saveFile(image);
                            existing.setImageUrl(imageUrl);
                        }

                        Category updated = repo.save(existing);
                        return ResponseEntity.ok(toDto(updated));
                    } catch (IllegalStateException ex) {
                        if ("NAME_DUPLICATE".equals(ex.getMessage())) {
                            return ResponseEntity.status(409)
                                    .body(java.util.Map.of("message", "Category name already exists"));
                        }
                        if ("SLUG_DUPLICATE".equals(ex.getMessage())) {
                            return ResponseEntity.status(409)
                                    .body(java.util.Map.of("message", "Category slug already exists"));
                        }
                        return ResponseEntity.status(500)
                                .body(java.util.Map.of("message", "Validation error"));
                    } catch (IOException ex) {
                        ex.printStackTrace();
                        return ResponseEntity.status(500)
                                .body(java.util.Map.of("message", "Failed to save image"));
                    } catch (Exception ex) {
                        ex.printStackTrace();
                        return ResponseEntity.status(500)
                                .body(java.util.Map.of("message", "Unexpected error: " + ex.getMessage()));
                    }
                })
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(java.util.Map.of("message", "Category not found")));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return repo.findById(id)
                .map(existing -> {
                    repo.delete(existing);
                    return ResponseEntity.ok(
                            java.util.Map.of("message", "Category deleted")
                    );
                })
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(java.util.Map.of("message", "Category not found")));
    }
}
