package com.younyx.admin.repository;

import com.younyx.admin.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CollectionRepository extends JpaRepository<Collection, Long> {
    boolean existsBySlug(String slug);

     Optional<Collection> findBySlug(String slug);
}
