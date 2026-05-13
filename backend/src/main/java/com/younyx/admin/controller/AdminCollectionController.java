package com.younyx.admin.controller;

import com.younyx.admin.entity.Collection;
import com.younyx.admin.service.CollectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/collections")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://localhost:3001"},
        allowCredentials = "true"
)
public class AdminCollectionController {

    private final CollectionService service;

    public AdminCollectionController(CollectionService service) {
        this.service = service;
    }

    /* ---------- GET ---------- */
    @GetMapping
    public List<Collection> getAll() {
        return service.findAll();
    }

    /* ---------- CREATE ---------- */
    @PostMapping(consumes = "multipart/form-data")
    public Collection create(
            @RequestParam String name,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String status,
            @RequestPart(required = false) MultipartFile image
    ) {
        return service.create(name, slug, description, status, image);
    }

    /* ---------- UPDATE ---------- */
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public Collection update(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String status,
            @RequestPart(required = false) MultipartFile image
    ) {
        return service.update(id, name, slug, description, status, image);
    }

    /* ---------- DELETE ---------- */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
