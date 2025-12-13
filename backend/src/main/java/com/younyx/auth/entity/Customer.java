package com.younyx.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String gender;
    @Column(unique=true)
    private String email;
    @Column(unique=true)
    private String phone;
    private String altPhone;
    private String passwordHash;

    private String flatBuildingArea;
    private String landmark;
    private String city;
    private String district;
    private String state;
    private String pincode;
    private String country;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    // add these inside the Customer class

public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public String getName() { return name; }
public void setName(String name) { this.name = name; }

public String getGender() { return gender; }
public void setGender(String gender) { this.gender = gender; }

public String getEmail() { return email; }
public void setEmail(String email) { this.email = email; }

public String getPhone() { return phone; }
public void setPhone(String phone) { this.phone = phone; }

public String getAltPhone() { return altPhone; }
public void setAltPhone(String altPhone) { this.altPhone = altPhone; }

public String getPasswordHash() { return passwordHash; }
public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

public String getFlatBuildingArea() { return flatBuildingArea; }
public void setFlatBuildingArea(String flatBuildingArea) { this.flatBuildingArea = flatBuildingArea; }

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
