// package com.younyx.contact.controller;

import com.younyx.contact.dto.ContactRequestDto;
import com.younyx.contact.dto.ContactResponseDto;
import com.younyx.contact.service.ContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;
    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    /**
     * Submit a contact message. User must be authenticated.
     * We will override the email with Principal.getName() to ensure messages are tied to the logged-in user.
     */
    @PostMapping
    public ResponseEntity<ContactResponseDto> submitContact(@RequestBody ContactRequestDto request,
                                                            Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        // override email with authenticated user's email (Principal name)
        String email = principal.getName();
        request.setEmail(email);
        ContactResponseDto saved = contactService.saveContact(request);
        return ResponseEntity.ok(saved);
    }
}
