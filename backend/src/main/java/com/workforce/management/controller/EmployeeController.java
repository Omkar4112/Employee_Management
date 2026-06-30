package com.workforce.management.controller;

import com.workforce.management.entity.Employee;
import com.workforce.management.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Employee operations.
 *
 * @RestController = @Controller + @ResponseBody (auto-serializes return values to JSON)
 * @RequestMapping sets the base URL prefix for all endpoints in this class.
 * @CrossOrigin allows the React frontend (on a different port) to call this API.
 */
@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    // =====================================================
    // GET /api/employees
    // Fetch all employees (supports filtering via query params)
    // =====================================================
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        if (department != null && !department.isEmpty()) {
            return ResponseEntity.ok(employeeService.getEmployeesByDepartment(department));
        }
        if (keyword != null && !keyword.isEmpty()) {
            return ResponseEntity.ok(employeeService.searchEmployeesByName(keyword));
        }
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // =====================================================
    // GET /api/employees/{id}
    // Fetch a single employee by ID
    // =====================================================
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    // =====================================================
    // GET /api/employees/email/{email}
    // Fetch a single employee by email (used for login)
    // =====================================================
    @GetMapping("/email/{email}")
    public ResponseEntity<Employee> getEmployeeByEmail(@PathVariable String email) {
        return ResponseEntity.ok(employeeService.getEmployeeByEmail(email));
    }

    // =====================================================
    // POST /api/employees
    // Create (hire) a new employee
    // @Valid triggers bean validation annotations on Employee
    // =====================================================
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody Employee employee) {
        Employee created = employeeService.createEmployee(employee);
        return new ResponseEntity<>(created, HttpStatus.CREATED); // 201 Created
    }

    // =====================================================
    // PUT /api/employees/{id}
    // Update (full replace) an existing employee's details
    // =====================================================
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody Employee employee
    ) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employee));
    }

    // =====================================================
    // DELETE /api/employees/{id}
    // Terminate (delete) an employee
    // =====================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(Map.of("message", "Employee with ID " + id + " has been terminated."));
    }

    // =====================================================
    // GET /api/employees/high-performers?minScore=8
    // Fetch employees above a performance threshold
    // =====================================================
    @GetMapping("/high-performers")
    public ResponseEntity<List<Employee>> getHighPerformers(
            @RequestParam(defaultValue = "8.0") Double minScore) {
        return ResponseEntity.ok(employeeService.getHighPerformers(minScore));
    }

    // =====================================================
    // GET /api/employees/stats
    // Quick analytics summary for the dashboard
    // =====================================================
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getEmployeeStats() {
        Map<String, Object> stats = Map.of(
                "total", employeeService.getTotalEmployeeCount(),
                "active", employeeService.getActiveEmployeeCount()
        );
        return ResponseEntity.ok(stats);
    }
}
