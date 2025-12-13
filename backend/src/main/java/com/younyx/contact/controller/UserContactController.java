package com.younyx.contact.controller;

import com.younyx.contact.dto.ContactRequestDto;
import com.younyx.contact.dto.ContactResponseDto;
import com.younyx.contact.service.ContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/contact")
public class UserContactController {

    private final ContactService contactService;

    public UserContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    /**
     * Returns messages for currently authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<?> myMessages(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        String email = principal.getName();
        List<ContactResponseDto> rows = contactService.findByEmail(email);
        return ResponseEntity.ok(rows);
    }

    /**
     * Create a new contact message.
     * We override the incoming email with the authenticated principal's email to prevent spoofing.
     */
    @PostMapping
    public ResponseEntity<?> createContact(@RequestBody ContactRequestDto dto, Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String authEmail = principal.getName();

        if (dto == null) dto = new ContactRequestDto();
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            dto.setName("Customer");
        }

        dto.setEmail(authEmail); // force using authenticated email

        try {
            ContactResponseDto saved = contactService.saveContact(dto);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Failed to save message");
        }
    }

    /**
     * Get single message detail (only owner can fetch).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Long id, Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        ContactResponseDto dto = contactService.getById(id);
        if (dto == null) {
            return ResponseEntity.status(404).body("Not found");
        }

        String authEmail = principal.getName();
        if (!authEmail.equals(dto.getEmail())) {
            // not owner — deny
            return ResponseEntity.status(403).body("Forbidden");
        }

        return ResponseEntity.ok(dto);
    }

    /**
     * Mark a message as read for the authenticated user.
     */
    @PostMapping("/{id}/mark-read")
    public ResponseEntity<?> markRead(@PathVariable("id") Long id, Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String authEmail = principal.getName();
        try {
            contactService.markRead(id, authEmail);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body("Not found");
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body("Forbidden");
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Failed to mark read");
        }
    }
}
