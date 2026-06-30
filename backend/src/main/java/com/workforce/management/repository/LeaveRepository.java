package com.workforce.management.repository;

import com.workforce.management.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Leave entity.
 */
@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {

    // Get all leaves for a specific employee
    List<Leave> findByEmployeeId(Long employeeId);

    // Get all pending leaves (for HR/Admin dashboard)
    List<Leave> findByStatus(String status);

    // Get all leaves for an employee filtered by status
    List<Leave> findByEmployeeIdAndStatus(Long employeeId, String status);

    // Get leaves by type
    List<Leave> findByLeaveType(String leaveType);

    /**
     * Conflict detection: checks if an employee already has a leave that
     * overlaps with the requested date range.
     * A conflict exists if:
     *   - existing leave starts before new end date AND
     *   - existing leave ends after new start date
     */
    @Query("SELECT l FROM Leave l WHERE l.employee.id = :employeeId " +
           "AND l.status != 'Rejected' " +
           "AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<Leave> findConflictingLeaves(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Count pending leaves (for analytics)
    Long countByStatus(String status);
}
