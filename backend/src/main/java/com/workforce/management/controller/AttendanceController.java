package com.workforce.management.controller;

import com.workforce.management.entity.Attendance;
import com.workforce.management.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/{employeeId}")
    public Attendance getAttendanceByEmployeeId(@PathVariable Long employeeId) {
        return attendanceService.getAttendanceByEmployeeId(employeeId);
    }

    @PutMapping("/{employeeId}")
    public Attendance updateAttendance(@PathVariable Long employeeId, @RequestBody Attendance attendance) {
        return attendanceService.updateAttendance(employeeId, attendance);
    }
}
