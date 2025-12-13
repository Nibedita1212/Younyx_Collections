package com.younyx.contact.dto;

import java.time.Instant;

public class ContactResponseDto {
    private Long id;
    private String name;
    private String email;
    private String subject;
    private String message;
    private Instant createdAt;
    private String status;
    private String adminReply;
    private Instant repliedAt;

    public ContactResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminReply() { return adminReply; }
    public void setAdminReply(String adminReply) { this.adminReply = adminReply; }

    public Instant getRepliedAt() { return repliedAt; }
    public void setRepliedAt(Instant repliedAt) { this.repliedAt = repliedAt; }
}
