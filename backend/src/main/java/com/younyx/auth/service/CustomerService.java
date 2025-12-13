package com.younyx.auth.service;

import com.younyx.auth.entity.Customer;
import com.younyx.auth.repo.CustomerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.younyx.auth.dto.SignupRequest;

import java.util.Optional;

@Service
public class CustomerService {
  private final CustomerRepository repo;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public CustomerService(CustomerRepository repo) {
    this.repo = repo;
  }

  public Customer createCustomer(SignupRequest req) {
    // optional: check duplicate email/phone
    if (req.email() != null && repo.findByEmail(req.email()).isPresent()) {
      throw new IllegalArgumentException("Email already registered");
    }
    if (req.phone() != null && repo.findByPhone(req.phone()).isPresent()) {
      throw new IllegalArgumentException("Phone already registered");
    }

    Customer c = new Customer();
    c.setName(req.name());
    c.setGender(req.gender());
    c.setEmail(req.email());
    c.setPhone(req.phone());
    c.setAltPhone(req.altPhone());
    c.setPasswordHash(encoder.encode(req.password()));

    if (req.address() != null) {
      c.setFlatBuildingArea(req.address().flatBuildingArea());
      c.setLandmark(req.address().landmark());
      c.setCity(req.address().city());
      c.setDistrict(req.address().district());
      c.setState(req.address().state());
      c.setPincode(req.address().pincode());
      c.setCountry(
          req.address().country() == null ? "India" : req.address().country()
      );
    }

    return repo.save(c);
  }

  // 🔹 NEW: /me ke liye email se customer dhoondhne ka helper
  public Optional<Customer> findByEmail(String email) {
    return repo.findByEmail(email);
  }
}
