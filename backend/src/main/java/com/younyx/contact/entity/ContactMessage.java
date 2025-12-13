package com.younyx.contact.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "contact_messages")
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(columnDefinition = "TEXT")
    private String adminReply;

    private Instant repliedAt;

    @Column(nullable = false)
    private String status; // NEW, REPLIED, ARCHIVED ...

    public ContactMessage() {}

    // Getters and setters
    public Long getId() { return id; }

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

    public String getAdminReply() { return adminReply; }
    public void setAdminReply(String adminReply) { this.adminReply = adminReply; }

    public Instant getRepliedAt() { return repliedAt; }
    public void setRepliedAt(Instant repliedAt) { this.repliedAt = repliedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
