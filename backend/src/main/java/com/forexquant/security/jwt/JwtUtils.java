package com.forexquant.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @org.springframework.beans.factory.annotation.Value("${jwt.secret:}")
    private String jwtSecret;

    private int jwtExpirationMs = 86400000;

    private Key signingKey;

    private Key getSigningKey() {
        if (signingKey != null) {
            return signingKey;
        }
        try {
            if (jwtSecret == null || jwtSecret.isEmpty()) {
                // Default random key for simple local dev if env not set, cached to avoid regeneration mismatch
                signingKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
            } else {
                // Ensure key is exactly 512 bits (64 bytes) by hashing the configured secret with SHA-512
                java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-512");
                byte[] hashedBytes = digest.digest(jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                signingKey = Keys.hmacShaKeyFor(hashedBytes);
            }
        } catch (Exception e) {
            // Ultimate fallback to prevent crashes under any environment
            signingKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
        }
        return signingKey;
    }

    public String generateJwtTokenFromEmail(String email, boolean fullyAuthenticated) {
        return Jwts.builder()
                .setSubject(email)
                .claim("fullyAuthenticated", fullyAuthenticated)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean getFullyAuthenticatedFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().get("fullyAuthenticated", Boolean.class);
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
