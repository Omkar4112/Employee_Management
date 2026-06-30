package com.workforce.management.service;

import com.workforce.management.entity.Employee;
import com.workforce.management.exception.ConflictException;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Employee business logic.
 *
 * @Service marks this as a Spring-managed service bean.
 * @RequiredArgsConstructor (Lombok) injects dependencies via constructor
 *   (this is the recommended Spring injection style over @Autowired).
 * @Transactional ensures database operations are wrapped in a transaction.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    // --- READ Operations ---

    /**
     * Fetch all employees from the database.
     * @Transactional(readOnly = true) is a performance optimization for reads.
     */
    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        // orElseThrow triggers our GlobalExceptionHandler automatically
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    @Transactional(readOnly = true)
    public List<Employee> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartment(department);
    }

    @Transactional(readOnly = true)
    public List<Employee> searchEmployeesByName(String keyword) {
        return employeeRepository.findByNameContainingIgnoreCase(keyword);
    }

    @Transactional(readOnly = true)
    public List<Employee> getHighPerformers(Double minScore) {
        return employeeRepository.findHighPerformers(minScore);
    }

    // --- CREATE Operation ---

    public Employee createEmployee(Employee employee) {
        // Business Validation: prevent duplicate email addresses
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new ConflictException("An employee with email '" + employee.getEmail() + "' already exists.");
        }
        return employeeRepository.save(employee);
    }

    // --- UPDATE Operation ---

    public Employee updateEmployee(Long id, Employee updatedData) {
        // First, verify the employee exists
        Employee existingEmployee = getEmployeeById(id);

        // Check if email is being changed to one that already belongs to another employee
        if (!existingEmployee.getEmail().equals(updatedData.getEmail())
                && employeeRepository.existsByEmail(updatedData.getEmail())) {
            throw new ConflictException("Email '" + updatedData.getEmail() + "' is already in use.");
        }

        // Update only the fields that are provided
        existingEmployee.setName(updatedData.getName());
        existingEmployee.setRole(updatedData.getRole());
        existingEmployee.setDepartment(updatedData.getDepartment());
        existingEmployee.setAccessLevel(updatedData.getAccessLevel());
        existingEmployee.setEmail(updatedData.getEmail());
        existingEmployee.setSalary(updatedData.getSalary());
        existingEmployee.setPerformanceScore(updatedData.getPerformanceScore());
        existingEmployee.setAttendancePercentage(updatedData.getAttendancePercentage());
        existingEmployee.setStatus(updatedData.getStatus());
        existingEmployee.setManager(updatedData.getManager());

        return employeeRepository.save(existingEmployee);
    }

    // --- DELETE Operation ---

    public void deleteEmployee(Long id) {
        // Verify employee exists before deleting
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }

    // --- Analytics / Dashboard Data ---

    @Transactional(readOnly = true)
    public long getTotalEmployeeCount() {
        return employeeRepository.count();
    }

    @Transactional(readOnly = true)
    public long getActiveEmployeeCount() {
        return employeeRepository.findByStatus("Active").size();
    }
}
