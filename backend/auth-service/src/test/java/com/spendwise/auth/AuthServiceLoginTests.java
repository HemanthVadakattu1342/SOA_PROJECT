package com.spendwise.auth;

import com.spendwise.auth.dto.LoginRequest;
import com.spendwise.auth.entity.Role;
import com.spendwise.auth.entity.User;
import com.spendwise.auth.repository.AuditLogRepository;
import com.spendwise.auth.repository.UserRepository;
import com.spendwise.auth.security.CustomUserDetailsService;
import com.spendwise.auth.service.AuthService;
import com.spendwise.auth.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceLoginTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginTrimsEmailAndPreservesPassword() {
        User user = User.builder()
                .id(1L)
                .employeeId("EMP001")
                .firstName("Alice")
                .lastName("Example")
                .email("alice@example.com")
                .department("Finance")
                .role(Role.EMPLOYEE)
                .active(true)
                .build();
        when(userRepository.findByEmailIgnoreCase("Alice@Example.com"))
                .thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setEmail("  Alice@Example.com  ");
        request.setPassword("  keep password spacing  ");

        authService.login(request);

        ArgumentCaptor<UsernamePasswordAuthenticationToken> captor =
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(authenticationManager).authenticate(captor.capture());
        assertEquals("Alice@Example.com", captor.getValue().getPrincipal());
        assertEquals("  keep password spacing  ", captor.getValue().getCredentials());
        verify(userRepository).findByEmailIgnoreCase("Alice@Example.com");
    }

    @Test
    void userDetailsLookupTrimsEmail() {
        User user = User.builder()
                .employeeId("EMP001")
                .firstName("Alice")
                .lastName("Example")
                .email("alice@example.com")
                .password("$2a$12$hash")
                .department("Finance")
                .role(Role.EMPLOYEE)
                .active(true)
                .build();
        when(userRepository.findByEmailIgnoreCase("Alice@Example.com"))
                .thenReturn(Optional.of(user));

        CustomUserDetailsService userDetailsService =
                new CustomUserDetailsService(userRepository);
        UserDetails userDetails = userDetailsService.loadUserByUsername(" Alice@Example.com ");

        assertEquals("alice@example.com", userDetails.getUsername());
        verify(userRepository).findByEmailIgnoreCase("Alice@Example.com");
    }
}
