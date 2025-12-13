package com.younyx.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve files from <project-root>/uploads/ when URL is /uploads/**
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");

        // Also serve the same folder when URL is /api/uploads/** (because controllers may return /api/uploads/...)
        // This ensures both "/uploads/..." and "/api/uploads/..." work.
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
