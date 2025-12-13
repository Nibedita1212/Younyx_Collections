package com.younyx.admin.controller;

import com.younyx.contact.dto.ContactResponseDto;
import com.younyx.contact.service.ContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/contacts")
public class AdminContactController {

    private final ContactService contactService;
    public AdminContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public List<ContactResponseDto> listAll() {
        return contactService.listAll();
    }

    @GetMapping("{id}")
    public ResponseEntity<ContactResponseDto> get(@PathVariable Long id) {
        ContactResponseDto dto = contactService.getById(id);
        return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    // admin replies — this saves the reply into DB (does not send email)
    @PostMapping("{id}/reply")
    public ResponseEntity<ContactResponseDto> reply(@PathVariable Long id, @RequestBody ReplyDto body) {
        ContactResponseDto updated = contactService.replyToMessage(id, body.reply);
        return ResponseEntity.ok(updated);
    }

    public static class ReplyDto { public String reply; }
}
