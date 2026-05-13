package com.younyx.admin.service;

import com.younyx.admin.entity.Collection;
import com.younyx.admin.repository.CollectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class CollectionService {

    private final CollectionRepository repo;

    public CollectionService(CollectionRepository repo) {
        this.repo = repo;
    }

    /* ---------- GET ---------- */
    public List<Collection> findAll() {
        return repo.findAll();
    }

    /* ---------- CREATE ---------- */
    public Collection create(
            String name,
            String slug,
            String description,
            String status,
            MultipartFile image
    ) {
        Collection c = new Collection();
        c.setName(name);
        c.setSlug(generateSlug(name, slug));
        c.setDescription(description);
        c.setStatus(status != null ? status : "ACTIVE");

        if (image != null && !image.isEmpty()) {
            c.setImageUrl(storeImage(image));
        }

        return repo.save(c);
    }

    /* ---------- UPDATE ---------- */
    public Collection update(
            Long id,
            String name,
            String slug,
            String description,
            String status,
            MultipartFile image
    ) {
        Collection existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        existing.setName(name);
        existing.setSlug(generateSlug(name, slug));
        existing.setDescription(description);
        existing.setStatus(status);

        // image OPTIONAL (only replace if new one provided)
        if (image != null && !image.isEmpty()) {
            existing.setImageUrl(storeImage(image));
        }

        return repo.save(existing);
    }

    /* ---------- DELETE ---------- */
    public void delete(Long id) {
        repo.deleteById(id);
    }

    /* ---------- helpers ---------- */

    private String generateSlug(String name, String slug) {
        if (slug != null && !slug.isBlank()) return slug;
        return name.toLowerCase().trim().replaceAll("\\s+", "-");
    }

    private String storeImage(MultipartFile file) {
        try {
            String ext = Objects.requireNonNull(file.getOriginalFilename())
                    .substring(file.getOriginalFilename().lastIndexOf("."));

            String fileName = UUID.randomUUID() + ext;

            Path uploadDir = Paths.get("uploads/collections");
            Files.createDirectories(uploadDir);

            Path target = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // URL stored in DB
            return "/uploads/collections/" + fileName;

        } catch (Exception e) {
            throw new RuntimeException("Image upload failed", e);
        }
    }
}
