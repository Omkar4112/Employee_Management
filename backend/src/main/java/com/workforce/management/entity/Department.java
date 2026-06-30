package com.workforce.management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA Entity representing the 'departments' table in MySQL.
 */
@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Department name cannot be blank")
    @Column(nullable = false, unique = true)
    private String name; // "Engineering", "HR", "Finance", etc.

    @Column(length = 500)
    private String description;

    @Column(name = "head_of_department")
    private String headOfDepartment;

    @Min(value = 0)
    @Column(name = "budget_allocated")
    private Double budgetAllocated;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
