package com.younyx.product.controller;

import com.younyx.product.dto.AdminProductDto;
import com.younyx.product.entity.Category;
import com.younyx.product.entity.Product;
import com.younyx.product.repo.CategoryRepository;
import com.younyx.product.repo.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = {"http://localhost:3001"}, allowCredentials = "true")
public class AdminProductController {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;

    private static final String UPLOAD_ROOT = "uploads/products/";

    public AdminProductController(ProductRepository productRepo,
                                  CategoryRepository categoryRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
    }

    // ---------- helpers ----------

    private String saveImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        Files.createDirectories(Paths.get(UPLOAD_ROOT));

        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + ext;

        Path target = Paths.get(UPLOAD_ROOT + fileName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // frontend: http://localhost:8080 + returnedPath
        return "/uploads/products/" + fileName;
    }

    private AdminProductDto toDto(Product p) {
        Long catId = null;
        String catName = null;

        if (p.getCategory() != null) {
            catId = p.getCategory().getId();
            catName = p.getCategory().getName();
        }

        return new AdminProductDto(
                p.getId(),
                p.getName(),
                p.getSku(),
                p.getPrice(),
                p.getStockQuantity(),
                p.getDescription(),
                p.getMainImageUrl(),
                p.getImage2Url(),
                p.getImage3Url(),
                p.getImage4Url(),
                catId,
                catName
        );
    }

    // ---------- LIST ----------

    @GetMapping
    public List<AdminProductDto> list() {
        return productRepo.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ---------- GET ONE ----------

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        Optional<Product> opt = productRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Product not found"));
        }
        return ResponseEntity.ok(toDto(opt.get()));
    }

    // ---------- CREATE ----------

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> create(
            @RequestParam("name") String name,
            @RequestParam("sku") String sku,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) throws IOException {

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "Name is required"));
        }
        if (sku == null || sku.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "SKU is required"));
        }

        if (productRepo.existsBySku(sku.trim())) {
            return ResponseEntity.status(409)
                    .body(java.util.Map.of("message", "SKU already exists"));
        }

        Category category = categoryRepo.findById(categoryId)
                .orElse(null);

        Product p = new Product();
        p.setName(name.trim());
        p.setSku(sku.trim());
        p.setPrice(price);
        p.setStockQuantity(stock);
        p.setDescription(description);
        p.setCategory(category);

        // images (max 4) - same as pehle
        if (images != null && !images.isEmpty()) {
            List<String> urls = new ArrayList<>();
            for (MultipartFile file : images) {
                if (file != null && !file.isEmpty()) {
                    String url = saveImage(file);
                    if (url != null) {
                        urls.add(url);
                    }
                    if (urls.size() == 4) {
                        break;
                    }
                }
            }
            if (!urls.isEmpty()) p.setMainImageUrl(urls.get(0));
            if (urls.size() > 1) p.setImage2Url(urls.get(1));
            if (urls.size() > 2) p.setImage3Url(urls.get(2));
            if (urls.size() > 3) p.setImage4Url(urls.get(3));
        }

        Product saved = productRepo.save(p);
        return ResponseEntity.ok(toDto(saved));
    }

    // ---------- UPDATE (per image slot) ----------

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("sku") String sku,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "image1", required = false) MultipartFile image1,
            @RequestParam(value = "image2", required = false) MultipartFile image2,
            @RequestParam(value = "image3", required = false) MultipartFile image3,
            @RequestParam(value = "image4", required = false) MultipartFile image4,
            @RequestParam(value = "deleteImage1", defaultValue = "false") boolean deleteImage1,
            @RequestParam(value = "deleteImage2", defaultValue = "false") boolean deleteImage2,
            @RequestParam(value = "deleteImage3", defaultValue = "false") boolean deleteImage3,
            @RequestParam(value = "deleteImage4", defaultValue = "false") boolean deleteImage4
    ) throws IOException {

        Optional<Product> opt = productRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Product not found"));
        }

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "Name is required"));
        }
        if (sku == null || sku.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "SKU is required"));
        }

        // same SKU kisi aur product ka na ho
        if (productRepo.existsBySkuAndIdNot(sku.trim(), id)) {
            return ResponseEntity.status(409)
                    .body(java.util.Map.of("message", "SKU already exists"));
        }

        Product p = opt.get();

        Category category = categoryRepo.findById(categoryId)
                .orElse(null);

        p.setName(name.trim());
        p.setSku(sku.trim());
        p.setPrice(price);
        p.setStockQuantity(stock);
        p.setDescription(description);
        p.setCategory(category);

        // ----- image1 / mainImageUrl -----
        if (deleteImage1) {
            p.setMainImageUrl(null);
        } else if (image1 != null && !image1.isEmpty()) {
            String url = saveImage(image1);
            if (url != null) {
                p.setMainImageUrl(url);
            }
        }

        // ----- image2 -----
        if (deleteImage2) {
            p.setImage2Url(null);
        } else if (image2 != null && !image2.isEmpty()) {
            String url = saveImage(image2);
            if (url != null) {
                p.setImage2Url(url);
            }
        }

        // ----- image3 -----
        if (deleteImage3) {
            p.setImage3Url(null);
        } else if (image3 != null && !image3.isEmpty()) {
            String url = saveImage(image3);
            if (url != null) {
                p.setImage3Url(url);
            }
        }

        // ----- image4 -----
        if (deleteImage4) {
            p.setImage4Url(null);
        } else if (image4 != null && !image4.isEmpty()) {
            String url = saveImage(image4);
            if (url != null) {
                p.setImage4Url(url);
            }
        }

        Product saved = productRepo.save(p);
        return ResponseEntity.ok(toDto(saved));
    }

    // ---------- DELETE ----------

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!productRepo.existsById(id)) {
            return ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Product not found"));
        }
        productRepo.deleteById(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Deleted"));
    }
}
