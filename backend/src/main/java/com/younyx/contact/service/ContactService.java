package com.younyx.contact.service;

import com.younyx.contact.dto.ContactRequestDto;
import com.younyx.contact.dto.ContactResponseDto;
import com.younyx.contact.entity.ContactMessage;
import com.younyx.contact.repo.ContactMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {

    private final ContactMessageRepository repo;

    public ContactService(ContactMessageRepository repo) {
        this.repo = repo;
    }

    /**
     * Save a new contact message (called by public contact controller).
     */
    @Transactional
    public ContactResponseDto saveContact(ContactRequestDto dto) {
        ContactMessage msg = new ContactMessage();
        msg.setName(dto.getName());
        msg.setEmail(dto.getEmail());
        msg.setSubject(dto.getSubject());
        msg.setMessage(dto.getMessage());
        msg.setCreatedAt(Instant.now());
        msg.setStatus("NEW");
        ContactMessage saved = repo.save(msg);
        return toDto(saved);
    }

    /**
     * Get single message by id (for admin/controllers).
     */
    public ContactResponseDto getById(Long id) {
        return repo.findById(id).map(this::toDto).orElse(null);
    }

    /**
     * List all messages (admin)
     */
    public List<ContactResponseDto> listAll() {
        return repo.findAllByOrderByCreatedAtDesc()
                   .stream()
                   .map(this::toDto)
                   .collect(Collectors.toList());
    }

    /**
     * Find messages for a user's email (used by /api/contact/my)
     */
    public List<ContactResponseDto> findByEmail(String email) {
        return repo.findByEmailOrderByCreatedAtDesc(email)
                   .stream()
                   .map(this::toDto)
                   .collect(Collectors.toList());
    }

    /**
     * Admin reply - set adminReply/repliedAt/status and save
     */
    @Transactional
    public ContactResponseDto replyToMessage(Long id, String adminReply) {
        ContactMessage msg = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        msg.setAdminReply(adminReply);
        msg.setRepliedAt(Instant.now());
        msg.setStatus("REPLIED");
        ContactMessage saved = repo.save(msg);
        return toDto(saved);
    }

    /**
     * Mark message as READ by the user (only owner allowed).
     */
    @Transactional
    public void markRead(Long id, String principalEmail) {
        ContactMessage msg = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (principalEmail == null || !principalEmail.equals(msg.getEmail())) {
            // owner-only operation; throw SecurityException for controller to map to 403
            throw new SecurityException("Forbidden");
        }
        msg.setStatus("READ");
        repo.save(msg);
    }

    /* ===== helper: entity -> dto ===== */
    private ContactResponseDto toDto(ContactMessage m) {
        ContactResponseDto dto = new ContactResponseDto();
        dto.setId(m.getId());
        dto.setName(m.getName());
        dto.setEmail(m.getEmail());
        dto.setSubject(m.getSubject());
        dto.setMessage(m.getMessage());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setStatus(m.getStatus());
        dto.setAdminReply(m.getAdminReply());
        dto.setRepliedAt(m.getRepliedAt());
        return dto;
    }
}
