package com.workforce.management.service;

import com.workforce.management.entity.Employee;
import com.workforce.management.entity.Leave;
import com.workforce.management.exception.ConflictException;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Leave management business logic.
 * Handles conflict detection and approval workflows.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeService employeeService;

    // --- READ Operations ---

    @Transactional(readOnly = true)
    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Leave getLeaveById(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave", "id", id));
    }

    @Transactional(readOnly = true)
    public List<Leave> getLeavesByEmployee(Long employeeId) {
        return leaveRepository.findByEmployeeId(employeeId);
    }

    @Transactional(readOnly = true)
    public List<Leave> getPendingLeaves() {
        return leaveRepository.findByStatus("Pending");
    }

    // --- CREATE Operation ---

    public Leave applyForLeave(Leave leaveRequest) {
        // Validate employee exists
        Employee employee = employeeService.getEmployeeById(leaveRequest.getEmployee().getId());
        leaveRequest.setEmployee(employee);

        // Business Rule: Check for conflicting leave dates
        List<Leave> conflicts = leaveRepository.findConflictingLeaves(
                employee.getId(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate()
        );

        if (!conflicts.isEmpty()) {
            throw new ConflictException(
                "Leave conflict detected. Employee already has an approved/pending leave in the date range: "
                + leaveRequest.getStartDate() + " to " + leaveRequest.getEndDate()
            );
        }

        leaveRequest.setStatus("Pending");
        return leaveRepository.save(leaveRequest);
    }

    // --- APPROVE / REJECT Operations ---

    public Leave approveLeave(Long leaveId, String reviewedBy) {
        Leave leave = getLeaveById(leaveId);

        if (!leave.getStatus().equals("Pending")) {
            throw new ConflictException("Leave request has already been " + leave.getStatus() + ".");
        }

        leave.setStatus("Approved");
        leave.setReviewedBy(reviewedBy);

        // Update employee status to "On Leave" when the leave is approved
        Employee employee = leave.getEmployee();
        employee.setStatus("On Leave");
        employeeService.updateEmployee(employee.getId(), employee);

        return leaveRepository.save(leave);
    }

    public Leave rejectLeave(Long leaveId, String reviewedBy) {
        Leave leave = getLeaveById(leaveId);

        if (!leave.getStatus().equals("Pending")) {
            throw new ConflictException("Leave request has already been " + leave.getStatus() + ".");
        }

        leave.setStatus("Rejected");
        leave.setReviewedBy(reviewedBy);
        return leaveRepository.save(leave);
    }

    // --- DELETE ---

    public void cancelLeave(Long leaveId) {
        Leave leave = getLeaveById(leaveId);
        if (leave.getStatus().equals("Approved")) {
            throw new ConflictException("Cannot cancel an already approved leave. Contact HR.");
        }
        leaveRepository.delete(leave);
    }

    // --- Analytics ---

    @Transactional(readOnly = true)
    public long getPendingLeaveCount() {
        return leaveRepository.countByStatus("Pending");
    }
}
