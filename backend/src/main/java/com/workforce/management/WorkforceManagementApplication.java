package com.workforce.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Smart Workforce Management System backend.
 *
 * @SpringBootApplication is a convenience annotation that combines:
 * - @Configuration: Tags the class as a source of bean definitions
 * - @EnableAutoConfiguration: Tells Spring Boot to configure beans automatically
 * - @ComponentScan: Scans all sub-packages for Spring components
 */
@SpringBootApplication
public class WorkforceManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkforceManagementApplication.class, args);
    }
}
