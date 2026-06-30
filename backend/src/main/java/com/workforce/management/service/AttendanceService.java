package com.workforce.management.service;

import com.workforce.management.entity.Attendance;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Attendance getAttendanceByEmployeeId(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId).orElse(null);
    }

    public Attendance updateAttendance(Long employeeId, Attendance attendanceDetails) {
        Attendance attendance = attendanceRepository.findByEmployeeId(employeeId)
                .orElse(Attendance.builder().employeeId(employeeId).build());
        
        attendance.setPresentDays(attendanceDetails.getPresentDays());
        attendance.setTotalDays(attendanceDetails.getTotalDays());
        
        return attendanceRepository.save(attendance);
    }
}
