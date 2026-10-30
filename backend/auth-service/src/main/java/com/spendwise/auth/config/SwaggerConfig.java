package com.spendwise.auth.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * SwaggerConfig - configures the Swagger/OpenAPI documentation UI.
 *
 * After starting the service, visit:
 * http://localhost:8081/swagger-ui.html
 *
 * You can test all endpoints directly from the browser.
 * 1. Call POST /api/auth/login to get your JWT token
 * 2. Click the green "Authorize" button (top right)
 * 3. Enter: Bearer <your-token>
 * 4. All protected endpoints will now send the token automatically
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "SpendWise Auth Service API",
        version = "1.0.0",
        description = "REST API Documentation — Authentication & User Management for SpendWise Corporate Expense System",
        contact = @Contact(name = "SpendWise Team", email = "admin@spendwise.com")
    ),
    // Apply JWT security globally — all endpoints show the lock icon
    security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER,
    description = "Paste your JWT token here. Get one from POST /api/auth/login"
)
public class SwaggerConfig {
    // Configuration is done through annotations above
}

