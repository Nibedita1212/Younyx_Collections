package com.younyx.auth.service;

import com.younyx.auth.dto.LoginResponse;
import com.younyx.auth.entity.Admin;
import com.younyx.auth.entity.Customer;
import com.younyx.auth.repo.AdminRepository;
import com.younyx.auth.repo.CustomerRepository;
import com.younyx.backend.security.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final CustomerRepository customerRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(
            AdminRepository adminRepository,
            CustomerRepository customerRepository,
            JwtUtil jwtUtil
    ) {
        this.adminRepository = adminRepository;
        this.customerRepository = customerRepository;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Login: admin first, then customer
     */
    public Optional<Map<String, Object>> login(String email, String rawPassword) {

        /* ---------- ADMIN LOGIN ---------- */
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (admin.getPassword() != null &&
                passwordEncoder.matches(rawPassword, admin.getPassword())) {

                Map<String, Object> claims = new HashMap<>();
                claims.put("id", admin.getId());
                claims.put("email", admin.getEmail());

                String token = jwtUtil.generateToken(claims, admin.getEmail());

                Map<String, Object> out = new HashMap<>();
                out.put("token", token);
                out.put("admin", new LoginResponse(
                        admin.getId(),
                        admin.getEmail(),
                        admin.getName()
                ));
                return Optional.of(out);
            }
        }

        /* ---------- CUSTOMER LOGIN ---------- */
        Optional<Customer> custOpt = customerRepository.findByEmail(email);
        if (custOpt.isPresent()) {
            Customer customer = custOpt.get();

            if (customer.getPasswordHash() != null &&
                passwordEncoder.matches(rawPassword, customer.getPasswordHash())) {

                Map<String, Object> claims = new HashMap<>();
                claims.put("id", customer.getId());
                claims.put("email", customer.getEmail());

                String token = jwtUtil.generateToken(claims, customer.getEmail());

                LoginResponse lr = new LoginResponse(
                        customer.getId(),
                        customer.getEmail(),
                        customer.getName(),
                        customer.getGender(),               // ✅ ADDED
                        customer.getPhone(),
                        customer.getFlatBuildingArea(),
                        customer.getLandmark(),
                        customer.getCity(),
                        customer.getDistrict(),
                        customer.getState(),
                        customer.getPincode(),
                        customer.getCountry()
                );

                Map<String, Object> out = new HashMap<>();
                out.put("token", token);
                out.put("customer", lr);
                return Optional.of(out);
            }
        }

        return Optional.empty();
    }

    /**
     * Validate JWT token
     */
    public Optional<LoginResponse> validateToken(String token) {
        try {
            Jws<Claims> jws = jwtUtil.validateToken(token);
            Claims claims = jws.getBody();

            Object idObj = claims.get("id");
            Long id = null;

            if (idObj instanceof Number) {
                id = ((Number) idObj).longValue();
            } else if (idObj != null) {
                try {
                    id = Long.parseLong(idObj.toString());
                } catch (NumberFormatException ignored) {}
            }

            /* ---------- TRY ADMIN ---------- */
            if (id != null) {
                Optional<Admin> adminOpt = adminRepository.findById(id);
                if (adminOpt.isPresent()) {
                    Admin a = adminOpt.get();
                    return Optional.of(new LoginResponse(
                            a.getId(),
                            a.getEmail(),
                            a.getName()
                    ));
                }

                /* ---------- TRY CUSTOMER ---------- */
                Optional<Customer> custOpt = customerRepository.findById(id);
                if (custOpt.isPresent()) {
                    Customer c = custOpt.get();
                    return Optional.of(new LoginResponse(
                            c.getId(),
                            c.getEmail(),
                            c.getName(),
                            c.getGender(),                   // ✅ ADDED
                            c.getPhone(),
                            c.getFlatBuildingArea(),
                            c.getLandmark(),
                            c.getCity(),
                            c.getDistrict(),
                            c.getState(),
                            c.getPincode(),
                            c.getCountry()
                    ));
                }
            }

            /* ---------- FALLBACK BY EMAIL ---------- */
            String subject = claims.getSubject();
            if (subject != null) {

                Optional<Admin> byAdminEmail = adminRepository.findByEmail(subject);
                if (byAdminEmail.isPresent()) {
                    Admin a = byAdminEmail.get();
                    return Optional.of(new LoginResponse(
                            a.getId(),
                            a.getEmail(),
                            a.getName()
                    ));
                }

                Optional<Customer> byCustEmail = customerRepository.findByEmail(subject);
                if (byCustEmail.isPresent()) {
                    Customer c = byCustEmail.get();
                    return Optional.of(new LoginResponse(
                            c.getId(),
                            c.getEmail(),
                            c.getName(),
                            c.getGender(),                   // ✅ ADDED
                            c.getPhone(),
                            c.getFlatBuildingArea(),
                            c.getLandmark(),
                            c.getCity(),
                            c.getDistrict(),
                            c.getState(),
                            c.getPincode(),
                            c.getCountry()
                    ));
                }
            }

            return Optional.empty();
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
