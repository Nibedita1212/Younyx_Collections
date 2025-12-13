// SignupRequest.java
package com.younyx.auth.dto;

public record SignupRequest(
    String name,
    String gender,
    String email,
    String password,
    String phone,
    String altPhone,
    AddressDto address   
) {}



