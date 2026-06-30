package com.workforce.management.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security Configuration.
 *
 * In this initial setup, all API endpoints are publicly accessible so the
 * React frontend can connect without authentication. This is the standard
 * first integration step.
 *
 * For production, you would replace permitAll() with role-based rules like:
 *   .requestMatchers(HttpMethod.DELETE, "/api/employees/**").hasRole("ADMIN")
 *   .requestMatchers("/api/employees/**").hasAnyRole("ADMIN", "HR")
 *   .anyRequest().authenticated()
 * ...and add a JWT filter to the chain.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless REST APIs (standard practice)
            .csrf(AbstractHttpConfigurer::disable)
            // Allow all requests (open API for development / frontend integration)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );
        return http.build();
    }
}
