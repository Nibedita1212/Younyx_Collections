package com.younyx.auth.controller;

import com.younyx.auth.entity.Customer;
import com.younyx.auth.repo.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customerRepo;

    public CustomerController(CustomerRepository customerRepo) {
        this.customerRepo = customerRepo;
    }

    /**
     * GET /api/customers/me
     * Header required: X-User-Id
     * Used by Edit Profile page
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(
            @RequestHeader(value = "X-User-Id", required = false) Long uid
    ) {
        if (uid == null) {
            return ResponseEntity.status(401)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized"
                    ));
        }

        Optional<Customer> opt = customerRepo.findById(uid);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of(
                            "success", false,
                            "message", "User not found"
                    ));
        }

        Customer c = opt.get();

        Map<String, Object> data = new HashMap<>();
        data.put("success", true);

        // -------- BASIC INFO --------
        data.put("id", c.getId());
        data.put("name", c.getName());
        data.put("gender", c.getGender());          // ✅ FIXED
        data.put("email", c.getEmail());

        // -------- PHONE --------
        data.put("phone", c.getPhone());
        data.put("altPhone", c.getAltPhone());      // ✅ FIXED

        // -------- ADDRESS --------
        data.put("flatBuildingArea", c.getFlatBuildingArea()); // ✅ FIXED
        data.put("landmark", c.getLandmark());
        data.put("city", c.getCity());
        data.put("district", c.getDistrict());
        data.put("state", c.getState());
        data.put("pincode", c.getPincode());
        data.put("country", c.getCountry());

        return ResponseEntity.ok(data);
    }
}
