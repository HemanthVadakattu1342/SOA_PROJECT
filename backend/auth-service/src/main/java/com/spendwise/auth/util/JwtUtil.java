package com.spendwise.auth.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JwtUtil - handles all JWT operations.
 *
 * What is a JWT?
 * A JWT (JSON Web Token) is a string like: xxxxx.yyyyy.zzzzz
 * - xxxxx = Header (algorithm used)
 * - yyyyy = Payload (user data like email, role)
 * - zzzzz = Signature (proves the token is real and not tampered with)
 *
 * We create a JWT when a user logs in.
 * The user sends this token with every request.
 * We verify the token to know who is making the request.
 */
@Component
@Slf4j  // Lombok: gives us a "log" variable for logging
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;  // Default: 86400000 = 24 hours

    /**
     * Creates the signing key from our secret string.
     * We use HMAC-SHA256 algorithm.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
            java.util.Base64.getEncoder().encodeToString(secret.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates a JWT token for a logged-in user.
     * The token contains: userId, email, role, department
     */
    public String generateToken(Long userId, String email, String role, String department) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("department", department);

        return Jwts.builder()
                .claims(claims)
                .subject(email)                 // "sub" field = email
                .issuedAt(new Date())           // "iat" field = when token was created
                .expiration(new Date(System.currentTimeMillis() + expirationMs))  // "exp" field
                .signWith(getSigningKey())       // Sign with our secret key
                .compact();                     // Build the final token string
    }

    /**
     * Extracts the email (subject) from the token.
     */
    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Extracts the role from the token.
     */
    public String getRoleFromToken(String token) {
        return (String) parseClaims(token).get("role");
    }

    /**
     * Extracts the userId from the token.
     */
    public Long getUserIdFromToken(String token) {
        Object userId = parseClaims(token).get("userId");
        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        }
        return (Long) userId;
    }

    /**
     * Extracts the department from the token.
     */
    public String getDepartmentFromToken(String token) {
        return (String) parseClaims(token).get("department");
    }

    /**
     * Validates a JWT token.
     * Returns true if token is valid, false if expired or tampered.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired");
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token is unsupported");
        } catch (MalformedJwtException e) {
            log.warn("JWT token is malformed");
        } catch (SecurityException e) {
            log.warn("JWT signature validation failed");
        } catch (IllegalArgumentException e) {
            log.warn("JWT token is empty");
        }
        return false;
    }

    /**
     * Parses and returns all claims from the token.
     * Throws an exception if token is invalid or expired.
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
