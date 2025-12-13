package com.younyx.auth.dto;

/**
 * Response returned after successful signup.
 * profileImage may be null if user didn't provide one.
 */
public record SignupResponse(
    Long id,
    String email,
    String name
) {}
