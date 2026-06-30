package com.workforce.management.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false, unique = true)
    private Long employeeId;

    @Column(name = "present_days", nullable = false)
    @Builder.Default
    private Integer presentDays = 0;

    @Column(name = "total_days", nullable = false)
    @Builder.Default
    private Integer totalDays = 20;
}
