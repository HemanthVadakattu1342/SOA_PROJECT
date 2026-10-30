package com.spendwise.gateway.filter;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;

/**
 * JwtAuthenticationFilter - Gateway filter that validates JWT tokens.
 *
 * How it works:
 * 1. Every request arrives at the gateway
 * 2. This filter runs BEFORE the request is forwarded to any microservice
 * 3. If the endpoint is public (login/register), it passes through
 * 4. If protected, it checks the Authorization header for a valid JWT
 * 5. If JWT is invalid or missing, it returns 401 Unauthorized
 * 6. If JWT is valid, it adds user info to headers and forwards the request
 *
 * This way, individual microservices can trust the headers added by the gateway.
 */
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret}")
    private String secret;

    // These endpoints do NOT require a JWT token
    private static final List<String> PUBLIC_ENDPOINTS = List.of(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/health",
        "/actuator",
        "/swagger-ui",
        "/swagger-ui.html",
        "/v3/api-docs",
        "/api-docs",
        "/webjars",
        "/auth-service/v3/api-docs",
        "/expense-service/v3/api-docs",
        "/category-service/v3/api-docs",
        "/budget-service/v3/api-docs",
        "/report-service/v3/api-docs",
        "/notification-service/v3/api-docs"
    );

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // Allow public endpoints to pass through without JWT
            if (isPublicEndpoint(path)) {
                return chain.filter(exchange);
            }

            // Check Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return sendUnauthorized(exchange, "Authorization header is missing");
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return sendUnauthorized(exchange, "Invalid Authorization header format");
            }

            String token = authHeader.substring(7);  // Remove "Bearer " prefix

            try {
                // Parse and validate the JWT
                Claims claims = parseToken(token);

                // Safely extract userId (JWT stores numbers as Integer or Long)
                Object userIdObj = claims.get("userId");
                String userId = userIdObj != null ? userIdObj.toString() : "0";

                // Add user info as request headers so microservices can read them
                ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Email", claims.getSubject())
                    .header("X-User-Role", claims.get("role", String.class))
                    .header("X-User-Department", String.valueOf(claims.get("department")))
                    .build();

                log.debug("JWT validated for user: {}, role: {}",
                    claims.getSubject(), claims.get("role"));

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (ExpiredJwtException e) {
                return sendUnauthorized(exchange, "JWT token has expired");
            } catch (Exception e) {
                return sendUnauthorized(exchange, "Invalid JWT token");
            }
        };
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private Claims parseToken(String token) {
        byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(
            java.util.Base64.getEncoder().encodeToString(secret.getBytes())
        );
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Mono<Void> sendUnauthorized(ServerWebExchange exchange, String message) {
        log.warn("Unauthorized request: {}", message);
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        var buffer = response.bufferFactory().wrap(
            ("{\"success\":false,\"message\":\"" + message + "\"}").getBytes()
        );
        return response.writeWith(Mono.just(buffer));
    }

    // Config class required by AbstractGatewayFilterFactory
    public static class Config {
        // Can add config properties here if needed in future
    }
}
