package com.younyx.product.controller;

import com.younyx.product.dto.AdminProductDto;
import com.younyx.product.entity.Category;
import com.younyx.admin.entity.Collection;
import com.younyx.product.entity.Product;
import com.younyx.product.repo.CategoryRepository;
import com.younyx.admin.repository.CollectionRepository;
import com.younyx.product.repo.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "http://localhost:3001", allowCredentials = "true")
public class AdminProductController {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final CollectionRepository collectionRepo;

    private static final String UPLOAD_ROOT = "uploads/products/";

    public AdminProductController(ProductRepository productRepo,
                                  CategoryRepository categoryRepo,
                                  CollectionRepository collectionRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.collectionRepo = collectionRepo;
    }

    /* ================= IMAGE HELPER ================= */

    private String saveImage(MultipartFile file) throws IOException {
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

        return "/uploads/products/" + fileName;
    }

    /* ================= DTO ================= */

    private AdminProductDto toDto(Product p) {
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
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getCollection() != null ? p.getCollection().getId() : null,
                p.getCollection() != null ? p.getCollection().getName() : null,
                p.getActive()
        );
    }

    /* ================= LIST ================= */

    @GetMapping
    public List<AdminProductDto> list() {
        List<AdminProductDto> result = new ArrayList<>();
        for (Product p : productRepo.findAll()) {
            result.add(toDto(p));
        }
        return result;
    }

    /* ================= GET ONE ================= */

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOne(@PathVariable Long id) {
        return productRepo.findById(id)
                .<ResponseEntity<Object>>map(p -> ResponseEntity.ok(toDto(p)))
                .orElseGet(() ->
                        ResponseEntity.status(404).body(Map.of("message", "Product not found"))
                );
    }

    /* ================= CREATE ================= */

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Object> create(
            @RequestParam String name,
            @RequestParam String sku,
            @RequestParam BigDecimal price,
            @RequestParam Integer stock,
            @RequestParam Long categoryId,
            @RequestParam(required = false) Long collectionId,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) List<MultipartFile> images,
            @RequestParam(required = false) Boolean active
    ) throws IOException {

        Product p = new Product();
        p.setName(name.trim());
        p.setSku(sku.trim());
        p.setPrice(price);
        p.setStockQuantity(stock);
        p.setDescription(description);
        p.setActive(active != null ? active : false);

        p.setCategory(categoryRepo.findById(categoryId).orElse(null));

        if (collectionId != null) {
            p.setCollection(collectionRepo.findById(collectionId).orElse(null));
        }

        if (images != null && !images.isEmpty()) {
            List<String> urls = new ArrayList<>();
            for (MultipartFile file : images) {
                if (urls.size() == 4) break;
                String url = saveImage(file);
                if (url != null) urls.add(url);
            }
            if (urls.size() > 0) p.setMainImageUrl(urls.get(0));
            if (urls.size() > 1) p.setImage2Url(urls.get(1));
            if (urls.size() > 2) p.setImage3Url(urls.get(2));
            if (urls.size() > 3) p.setImage4Url(urls.get(3));
        }

        try {
            productRepo.save(p);
            return ResponseEntity.ok(toDto(p));
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "SKU already exists"));
        }
    }

    /* ================= UPDATE ================= */

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<Object> update(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String sku,
            @RequestParam BigDecimal price,
            @RequestParam Integer stock,
            @RequestParam Long categoryId,
            @RequestParam(required = false) Long collectionId,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Boolean active,

            @RequestParam(required = false) MultipartFile image1,
            @RequestParam(required = false) MultipartFile image2,
            @RequestParam(required = false) MultipartFile image3,
            @RequestParam(required = false) MultipartFile image4,

            @RequestParam(defaultValue = "false") boolean deleteImage1,
            @RequestParam(defaultValue = "false") boolean deleteImage2,
            @RequestParam(defaultValue = "false") boolean deleteImage3,
            @RequestParam(defaultValue = "false") boolean deleteImage4
    ) throws IOException {

        Optional<Product> opt = productRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Product not found"));
        }

        Product p = opt.get();

        p.setName(name.trim());
        p.setSku(sku.trim());
        p.setPrice(price);
        p.setStockQuantity(stock);
        p.setDescription(description);
        p.setCategory(categoryRepo.findById(categoryId).orElse(null));

        if (collectionId != null) {
            p.setCollection(collectionRepo.findById(collectionId).orElse(null));
        }

        if (active != null) p.setActive(active);

        if (deleteImage1) p.setMainImageUrl(null);
        else if (image1 != null && !image1.isEmpty())
            p.setMainImageUrl(saveImage(image1));

        if (deleteImage2) p.setImage2Url(null);
        else if (image2 != null && !image2.isEmpty())
            p.setImage2Url(saveImage(image2));

        if (deleteImage3) p.setImage3Url(null);
        else if (image3 != null && !image3.isEmpty())
            p.setImage3Url(saveImage(image3));

        if (deleteImage4) p.setImage4Url(null);
        else if (image4 != null && !image4.isEmpty())
            p.setImage4Url(saveImage(image4));

        try {
            productRepo.save(p);
            return ResponseEntity.ok(toDto(p));
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "SKU already exists"));
        }
    }

    /* ================= DELETE ================= */

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        if (!productRepo.existsById(id)) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Product not found"));
        }
        productRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
