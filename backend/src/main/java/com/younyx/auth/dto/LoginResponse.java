package com.younyx.auth.dto;

public class LoginResponse {

    private Long id;
    private String email;
    private String name;
    private String gender;          // ✅ ADDED

    // 🔹 extra fields for account page
    private String phone;
    private String flatBuildingArea;
    private String landmark;
    private String city;
    private String district;
    private String state;
    private String pincode;
    private String country;

    public LoginResponse() {}

    // 🔹 old constructor (admin / existing code ke liye safe)
    public LoginResponse(Long id, String email, String name) {
        this.id = id;
        this.email = email;
        this.name = name;
    }

    // 🔹 new full constructor (customer + profile + address)
    public LoginResponse(
            Long id,
            String email,
            String name,
            String gender,               // ✅ ADDED
            String phone,
            String flatBuildingArea,
            String landmark,
            String city,
            String district,
            String state,
            String pincode,
            String country
    ) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.gender = gender;
        this.phone = phone;
        this.flatBuildingArea = flatBuildingArea;
        this.landmark = landmark;
        this.city = city;
        this.district = district;
        this.state = state;
        this.pincode = pincode;
        this.country = country;
    }

    // ---------------- getters & setters ----------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGender() { return gender; }          // ✅ ADDED
    public void setGender(String gender) { this.gender = gender; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getFlatBuildingArea() { return flatBuildingArea; }
    public void setFlatBuildingArea(String flatBuildingArea) {
        this.flatBuildingArea = flatBuildingArea;
    }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
}
