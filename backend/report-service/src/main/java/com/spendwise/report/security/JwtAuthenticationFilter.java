package com.spendwise.report.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Component @Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Value("${jwt.secret}") private String secret;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        try {
            String role  = req.getHeader("X-User-Role");
            String email = req.getHeader("X-User-Email");
            if (StringUtils.hasText(role) && StringUtils.hasText(email)) {
                SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(email, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
            } else {
                String h = req.getHeader("Authorization");
                if (StringUtils.hasText(h) && h.startsWith("Bearer ")) {
                    byte[] keyBytes = Decoders.BASE64.decode(
                        Base64.getEncoder().encodeToString(secret.getBytes()));
                    Claims c = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(keyBytes))
                            .build().parseSignedClaims(h.substring(7)).getPayload();
                    SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(c.getSubject(), null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + c.get("role", String.class)))));
                }
            }
        } catch (Exception e) { log.warn("JWT error: {}", e.getMessage()); }
        chain.doFilter(req, res);
    }
}