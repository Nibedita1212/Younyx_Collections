package com.younyx.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret:}")
    private String secret;

    // expiry in milliseconds
    @Value("${app.jwt.expiration-ms:3600000}") // default 1 hour
    private long expirationMs;

    // ensure key ready
    private Key signingKey;

    @PostConstruct
    public void init() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("app.jwt.secret must be set (environment / application.properties)");
        }
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // HS256 requires 256-bit key (32 bytes) minimum — ensure length
        if (keyBytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret is too short for HS256 — provide at least 32 bytes (e.g. a 32+ char secret)");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    private Key getSigningKey() {
        return signingKey;
    }

    public String generateToken(Map<String, Object> claims, String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Parse and validate a token. Throws JwtException when invalid/expired.
     */
    public Jws<Claims> validateToken(String token) throws JwtException {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
    }
}
