package com.workforce.management.controller;

import com.workforce.management.entity.Leave;
import com.workforce.management.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Leave management operations.
 */
@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    // =====================================================
    // GET /api/leaves
    // Get all leave requests (Admin/HR view)
    // =====================================================
    @GetMapping
    public ResponseEntity<List<Leave>> getAllLeaves(
            @RequestParam(required = false) String status
    ) {
        if ("Pending".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(leaveService.getPendingLeaves());
        }
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    // =====================================================
    // GET /api/leaves/{id}
    // Get a specific leave by ID
    // =====================================================
    @GetMapping("/{id}")
    public ResponseEntity<Leave> getLeaveById(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.getLeaveById(id));
    }

    // =====================================================
    // GET /api/leaves/employee/{employeeId}
    // Get all leaves for a specific employee (Employee's own dashboard)
    // =====================================================
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Leave>> getLeavesByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(employeeId));
    }

    // =====================================================
    // POST /api/leaves
    // Apply for a new leave (Employee action)
    // =====================================================
    @PostMapping
    public ResponseEntity<Leave> applyForLeave(@Valid @RequestBody Leave leaveRequest) {
        Leave created = leaveService.applyForLeave(leaveRequest);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // =====================================================
    // PUT /api/leaves/{id}/approve
    // Approve a leave request (HR/Admin action)
    // =====================================================
    @PutMapping("/{id}/approve")
    public ResponseEntity<Leave> approveLeave(
            @PathVariable Long id,
            @RequestParam(defaultValue = "HR") String reviewedBy
    ) {
        return ResponseEntity.ok(leaveService.approveLeave(id, reviewedBy));
    }

    // =====================================================
    // PUT /api/leaves/{id}/reject
    // Reject a leave request (HR/Admin action)
    // =====================================================
    @PutMapping("/{id}/reject")
    public ResponseEntity<Leave> rejectLeave(
            @PathVariable Long id,
            @RequestParam(defaultValue = "HR") String reviewedBy
    ) {
        return ResponseEntity.ok(leaveService.rejectLeave(id, reviewedBy));
    }

    // =====================================================
    // DELETE /api/leaves/{id}
    // Cancel a pending leave request (Employee action)
    // =====================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancelLeave(@PathVariable Long id) {
        leaveService.cancelLeave(id);
        return ResponseEntity.ok(Map.of("message", "Leave request cancelled successfully."));
    }

    // =====================================================
    // GET /api/leaves/stats
    // Leave analytics for dashboard
    // =====================================================
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLeaveStats() {
        Map<String, Object> stats = Map.of(
                "pending", leaveService.getPendingLeaveCount()
        );
        return ResponseEntity.ok(stats);
    }
}
