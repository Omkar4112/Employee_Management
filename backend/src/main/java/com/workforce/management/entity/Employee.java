package com.workforce.management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA Entity representing the 'employees' table in MySQL.
 *
 * @Entity marks this class as a JPA entity (maps to a DB table)
 * @Table(name = "employees") specifies the table name
 * Lombok annotations (@Data, @Builder, etc.) auto-generate boilerplate
 */
@Entity
@Table(name = "employees")
@Data                    // Generates getters, setters, equals, hashCode, toString
@NoArgsConstructor       // Generates no-args constructor (required by JPA)
@AllArgsConstructor      // Generates all-args constructor
@Builder                 // Enables builder pattern: Employee.builder().name("John").build()
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT in MySQL
    private Long id;

    @NotBlank(message = "Employee name cannot be blank")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Role cannot be blank")
    @Column(nullable = false)
    private String role; // e.g., "Software Engineer", "HR Manager"

    @NotBlank(message = "Department cannot be blank")
    @Column(nullable = false)
    private String department; // e.g., "Engineering", "HR", "Finance"

    @NotBlank(message = "Access level cannot be blank")
    @Column(nullable = false)
    private String accessLevel; // "Admin", "HR", "Employee"

    @Email(message = "Must be a valid email address")
    @NotBlank(message = "Email cannot be blank")
    @Column(nullable = false, unique = true)
    private String email;

    @Min(value = 0, message = "Salary cannot be negative")
    private Double salary;

    @Min(value = 0) @Max(value = 10)
    @Column(name = "performance_score")
    private Double performanceScore;

    @Column(name = "attendance_percentage")
    private Double attendancePercentage;

    @Column(nullable = false)
    @Builder.Default
    private String status = "Active"; // "Active", "Inactive", "On Leave"

    private String manager; // Name of the employee's direct manager

    @Column(name = "join_date")
    private String joinDate; // e.g., "2023-01-15"

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Automatically set timestamps before persisting to DB.
     * @PrePersist fires before INSERT; @PreUpdate fires before UPDATE.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
