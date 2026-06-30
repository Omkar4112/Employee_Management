package com.workforce.management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS (Cross-Origin Resource Sharing) configuration.
 *
 * CORS is a browser security mechanism that blocks requests from one origin
 * (e.g., React on localhost:5173) to another origin (e.g., Spring Boot on localhost:8080).
 *
 * This configuration explicitly whitelists the React development server,
 * allowing it to communicate with the Spring Boot API.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Cache the CORS pre-flight response for 1 hour
    }
}
