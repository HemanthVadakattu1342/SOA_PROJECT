package com.spendwise.auth.security;

import com.spendwise.auth.entity.User;
import com.spendwise.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * CustomUserDetailsService - Spring Security uses this to load user data
 * during authentication.
 *
 * When a user logs in, Spring Security calls loadUserByUsername() with
 * the email, and we return the user info including their hashed password
 * and roles so Spring can validate them.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Find the user by email in our database
        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new UsernameNotFoundException(
                    "User not found with email: " + email
                ));

        // Check if account is active
        if (!user.isActive()) {
            throw new UsernameNotFoundException("User account is deactivated");
        }

        // Return Spring Security UserDetails with:
        // - email as username
        // - BCrypt hashed password
        // - User role as authority (Spring Security uses "ROLE_" prefix)
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isActive(),
                true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
