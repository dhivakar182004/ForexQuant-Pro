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

    private Key getSigningKey() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            // Default random key for simple local dev if env not set
            return Keys.secretKeyFor(SignatureAlgorithm.HS512);
        }
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
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
