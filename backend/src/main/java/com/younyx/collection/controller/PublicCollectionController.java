package com.younyx.collection.controller;

import com.younyx.admin.entity.Collection;
import com.younyx.admin.repository.CollectionRepository; // ✅ USE ADMIN REPO
import com.younyx.collection.dto.CollectionDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class PublicCollectionController {

    private final CollectionRepository repo;

    public PublicCollectionController(CollectionRepository repo) {
        this.repo = repo;
    }

    /* ---------- LIST ALL ACTIVE COLLECTIONS ---------- */
    @GetMapping("/collections")
    public ResponseEntity<List<CollectionDto>> list() {

        List<Collection> cols = repo.findAll();
        List<CollectionDto> dtos = new ArrayList<>();

        for (Collection c : cols) {
            if (!"ACTIVE".equalsIgnoreCase(c.getStatus())) continue;

            dtos.add(new CollectionDto(
                    c.getId(),
                    c.getName(),
                    c.getSlug(),
                    c.getImageUrl(),
                    c.getDescription(),
                    0L
            ));
        }

        return ResponseEntity.ok(dtos);
    }

    /* ---------- GET BY ID ---------- */
    @GetMapping("/collections/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {

        Optional<Collection> opt = repo.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Collection not found"));

        Collection c = opt.get();
        if (!"ACTIVE".equalsIgnoreCase(c.getStatus()))
            return ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Collection not active"));

        return ResponseEntity.ok(new CollectionDto(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getImageUrl(),
                c.getDescription(),
                0L
        ));
    }

    /* ---------- GET BY SLUG ---------- */
    @GetMapping("/collections/slug/{slug}")
    public ResponseEntity<?> bySlug(@PathVariable String slug) {

        Optional<Collection> opt = repo.findBySlug(slug);
        if (opt.isEmpty())
            return ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Collection not found"));

        Collection c = opt.get();
        if (!"ACTIVE".equalsIgnoreCase(c.getStatus()))
            return ResponseEntity.status(404)
                    .body(java.util.Map.of("message", "Collection not active"));

        return ResponseEntity.ok(new CollectionDto(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getImageUrl(),
                c.getDescription(),
                0L
        ));
    }
}
