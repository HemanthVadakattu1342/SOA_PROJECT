package com.spendwise.auth.security;

import com.spendwise.auth.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtAuthenticationFilter - runs on EVERY incoming HTTP request.
 *
 * It checks:
 * 1. Is there an Authorization header?
 * 2. Does it start with "Bearer "?
 * 3. Is the JWT token valid?
 * 4. If yes, set the user as authenticated in Spring Security.
 *
 * This filter extends OncePerRequestFilter - meaning it runs exactly
 * once per request (Spring guarantees this).
 */
@Component
@RequiredArgsConstructor  // Lombok: generates constructor for all final fields
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Step 1: Extract the token from the "Authorization" header
        String token = extractTokenFromRequest(request);

        // Step 2: If token exists and is valid, authenticate the user
        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
            try {
                String email = jwtUtil.getEmailFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);

                // Step 3: Create an authentication object with the user role
                // "ROLE_" prefix is required by Spring Security
                List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + role)
                );

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, null, authorities);

                // Step 4: Tell Spring Security this request is authenticated
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                log.error("Could not set user authentication: {}", e.getMessage());
            }
        }

        // Step 5: Continue to the next filter / controller
        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT from the Authorization header.
     * Header format: "Authorization: Bearer <token>"
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);  // Remove "Bearer " prefix (7 characters)
        }
        return null;
    }
}
