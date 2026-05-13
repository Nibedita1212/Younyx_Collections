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
     * Used by Account / Profile / Address View
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
        data.put("gender", c.getGender());
        data.put("email", c.getEmail());

        // -------- PHONE --------
        data.put("phone", c.getPhone());
        data.put("altPhone", c.getAltPhone());

        // -------- ADDRESS --------
        data.put("flatBuildingArea", c.getFlatBuildingArea());
        data.put("landmark", c.getLandmark());
        data.put("city", c.getCity());
        data.put("district", c.getDistrict());
        data.put("state", c.getState());
        data.put("pincode", c.getPincode());
        data.put("country", c.getCountry());

        return ResponseEntity.ok(data);
    }

    /**
     * ===========================
     *  ADD / UPDATE ADDRESS
     * ===========================
     * PUT /api/customers/address
     * Header: X-User-Id
     */
    @PutMapping("/address")
    public ResponseEntity<?> updateAddress(
            @RequestHeader(value = "X-User-Id", required = false) Long uid,
            @RequestBody Map<String, String> body
    ) {
        if (uid == null)
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Unauthorized"));

        Optional<Customer> opt = customerRepo.findById(uid);
        if (opt.isEmpty())
            return ResponseEntity.status(404)
                    .body(Map.of("success", false, "message", "User not found"));

        Customer c = opt.get();

        c.setFlatBuildingArea(body.get("flatBuildingArea"));
        c.setLandmark(body.get("landmark"));
        c.setCity(body.get("city"));
        c.setDistrict(body.get("district"));
        c.setState(body.get("state"));
        c.setPincode(body.get("pincode"));
        c.setCountry(body.get("country"));

        customerRepo.save(c);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Address updated successfully"
                )
        );
    }

    /**
     * ===========================
     *  DELETE ADDRESS
     * ===========================
     * DELETE /api/customers/address
     * Header: X-User-Id
     */
    @DeleteMapping("/address")
    public ResponseEntity<?> deleteAddress(
            @RequestHeader(value = "X-User-Id", required = false) Long uid
    ) {
        if (uid == null)
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Unauthorized"));

        Optional<Customer> opt = customerRepo.findById(uid);
        if (opt.isEmpty())
            return ResponseEntity.status(404)
                    .body(Map.of("success", false, "message", "User not found"));

        Customer c = opt.get();

        c.setFlatBuildingArea(null);
        c.setLandmark(null);
        c.setCity(null);
        c.setDistrict(null);
        c.setState(null);
        c.setPincode(null);
        c.setCountry(null);

        customerRepo.save(c);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Address deleted successfully"
                )
        );
    }
}
