package com.spendwise.expense.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * SwaggerConfig — http://localhost:8082/swagger-ui.html
 * Use POST /api/auth/login (auth-service) to get a JWT, then click "Authorize".
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "SpendWise Expense Service API",
        version = "1.0.0",
        description = "REST API Documentation — Expense Management, Approval Workflow, and Receipt Upload",
        contact = @Contact(name = "SpendWise Team", email = "admin@spendwise.com")
    ),
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
public class SwaggerConfig {}

