package com.younyx.controller;

import com.younyx.auth.dto.LoginRequest;
import com.younyx.auth.dto.LoginResponse;
import com.younyx.auth.dto.SignupRequest;
import com.younyx.auth.dto.SignupResponse;
import com.younyx.auth.entity.Customer;
import com.younyx.auth.service.AuthService;
import com.younyx.auth.service.CustomerService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

/**
 * AuthController: adds customer login at POST /api/auth/login
 * and preserves admin login at /api/auth/admin/login.
 *
 * Expects AuthService.login(email,password) to return Optional<Map<String,Object>>
 * containing the token under a key like "token" (or "authToken"/"accessToken")
 * and optionally a user object under "user"/"customer".
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AuthController {

    private final AuthService authService;
    private final CustomerService customerService;

    public AuthController(AuthService authService, CustomerService customerService) {
        this.authService = authService;
        this.customerService = customerService;
    }

    // ---------------- CUSTOMER LOGIN ----------------
    @PostMapping("/login")
    public ResponseEntity<?> customerLogin(@RequestBody LoginRequest req, HttpServletResponse response) {
        Optional<Map<String, Object>> auth = authService.login(req.getEmail(), req.getPassword());
        if (auth.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        Map<String, Object> payload = auth.get();

        Object tokenObj = pickFirst(payload, "token", "authToken", "accessToken");
        if (tokenObj == null) {
            return ResponseEntity.status(500).body(Map.of("message", "Auth service did not return a token"));
        }
        String token = String.valueOf(tokenObj);

        Object userObj = pickFirst(payload, "user", "customer", "account");

        ResponseCookie cookie = ResponseCookie.from("auth_token", token)
                .httpOnly(true)
                .secure(false) // set true in production (HTTPS)
                .path("/")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        if (userObj instanceof LoginResponse) {
            // If LoginResponse DTO, return it directly (contains id/email/name/phone etc)
            return ResponseEntity.ok(userObj);
        } else {
            // return both token and user map for clients that rely on token + user pair
            Map<String, Object> out = new HashMap<>();
            out.put("token", token);
            out.put("user", userObj);
            return ResponseEntity.ok(out);
        }
    }

    // ---------------- ADMIN LOGIN (backwards compatible) ----------------
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest req, HttpServletResponse response) {
        Optional<Map<String, Object>> auth = authService.login(req.getEmail(), req.getPassword());
        if (auth.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        Map<String, Object> payload = auth.get();
        Object tokenObj = pickFirst(payload, "token", "authToken", "accessToken");
        if (tokenObj == null) {
            return ResponseEntity.status(500).body(Map.of("message", "Auth service did not return a token"));
        }
        String token = String.valueOf(tokenObj);

        Object adminObj = pickFirst(payload, "admin", "user", "account");

        ResponseCookie cookie = ResponseCookie.from("auth_token", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        if (adminObj instanceof LoginResponse) {
            return ResponseEntity.ok(adminObj);
        } else {
            Map<String, Object> out = new HashMap<>();
            out.put("token", token);
            out.put("admin", adminObj);
            return ResponseEntity.ok(out);
        }
    }

    // ---------------- SIGNUP ----------------
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req, HttpServletResponse response) {
        try {
            Customer saved = customerService.createCustomer(req);

            SignupResponse out = new SignupResponse(
                    saved.getId(),
                    saved.getEmail(),
                    saved.getName()
            );

            return ResponseEntity.ok(out);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(409).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Signup failed"));
        }
    }

    // ---------------- CURRENT USER (/me) ----------------
    @GetMapping("/me")
    public ResponseEntity<?> me(@CookieValue(name = "auth_token", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("message", "No auth token"));
        }

        Optional<LoginResponse> userOpt = authService.validateToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
        }

        LoginResponse lr = userOpt.get();
        // IMPORTANT: return id as well (frontend needs it to persist younyx_user_id)
        Map<String, Object> out = new HashMap<>();
        out.put("id", lr.getId());
        out.put("email", lr.getEmail());
        out.put("name", lr.getName());
        // include optional fields if present in LoginResponse (phone, address items)
        try {
            if (lr.getPhone() != null) out.put("phone", lr.getPhone());
            if (lr.getFlatBuildingArea() != null) out.put("flatBuildingArea", lr.getFlatBuildingArea());
            if (lr.getLandmark() != null) out.put("landmark", lr.getLandmark());
            if (lr.getCity() != null) out.put("city", lr.getCity());
            if (lr.getDistrict() != null) out.put("district", lr.getDistrict());
            if (lr.getState() != null) out.put("state", lr.getState());
            if (lr.getPincode() != null) out.put("pincode", lr.getPincode());
            if (lr.getCountry() != null) out.put("country", lr.getCountry());
        } catch (Exception ignored) {}

        return ResponseEntity.ok(out);
    }

    // ---------------- LOGOUT ----------------
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    // helper to pick first key present
    private static Object pickFirst(Map<String, Object> m, String... keys) {
        if (m == null) return null;
        for (String k : keys) {
            if (m.containsKey(k) && m.get(k) != null) return m.get(k);
        }
        return null;
    }
}
