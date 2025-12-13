package com.younyx.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

/**
 * Reads auth_token cookie OR Authorization: Bearer <token>,
 * validates JWT and sets SecurityContext. No authorities are set.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // allow preflight through
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = extractToken(request);

            if (token != null && !token.isBlank()) {
                Jws<Claims> jw = jwtUtil.validateToken(token);
                Claims claims = jw.getBody();

                // principal = subject (usually email), details = claims
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                claims.getSubject(),      // principal
                                null,                    // credentials
                                Collections.emptyList()  // NO AUTHORITIES but non-null
                        );

                auth.setDetails(claims);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception ex) {
            // invalid/expired token -> clear context and continue as anonymous
            log.debug("JWT validation failed: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Try cookie 'auth_token' first, then Authorization header 'Bearer ...'
     */
    private String extractToken(HttpServletRequest request) {
        // 1) cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            Optional<Cookie> opt = Arrays.stream(cookies)
                    .filter(c -> "auth_token".equals(c.getName()))
                    .findFirst();
            if (opt.isPresent()) {
                String v = opt.get().getValue();
                if (v != null && !v.isBlank()) return v;
            }
        }

        // 2) Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.toLowerCase().startsWith("bearer ")) {
            return authHeader.substring(7).trim();
        }

        return null;
    }
}
