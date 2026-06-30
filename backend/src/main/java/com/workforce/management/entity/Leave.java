package com.workforce.management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA Entity representing the 'leaves' table in MySQL.
 * Tracks leave requests, their types, statuses, and the employee who filed them.
 */
@Entity
@Table(name = "leaves")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ManyToOne: Many leaves belong to one employee.
     * @JoinColumn creates a foreign key column `employee_id` in the leaves table.
     */
    @ManyToOne(fetch = FetchType.LAZY) // LAZY loading = don't load employee unless needed
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotBlank(message = "Leave type cannot be blank")
    @Column(name = "leave_type", nullable = false)
    private String leaveType; // "Annual", "Sick", "Maternity", "Emergency"

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(nullable = false)
    @Builder.Default
    private String status = "Pending"; // "Pending", "Approved", "Rejected"

    @Column(name = "reviewed_by")
    private String reviewedBy; // Name/ID of the HR/Admin who reviewed

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
