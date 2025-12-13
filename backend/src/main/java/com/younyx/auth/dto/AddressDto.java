package com.younyx.auth.dto;

public record AddressDto(
    String flatBuildingArea,
    String landmark,
    String city,
    String district,
    String state,
    String pincode,
    String country
) {}