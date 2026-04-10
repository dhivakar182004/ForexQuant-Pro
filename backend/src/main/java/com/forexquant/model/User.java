package com.forexquant.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String name;

    private String pictureUrl;

    @Column(unique = true)
    private String googleId;

    // Standard Authentication Field
    private String password;

    // Dual-Layer Auth Fields
    private String totpSecret;

    @Column(nullable = false)
    private boolean totpEnabled = false;
}
