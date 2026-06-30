package com.workforce.management.service;

import com.workforce.management.entity.Department;
import com.workforce.management.exception.ConflictException;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Department management.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
    }

    public Department createDepartment(Department department) {
        if (departmentRepository.existsByName(department.getName())) {
            throw new ConflictException("Department with name '" + department.getName() + "' already exists.");
        }
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, Department updatedData) {
        Department existing = getDepartmentById(id);
        existing.setName(updatedData.getName());
        existing.setDescription(updatedData.getDescription());
        existing.setHeadOfDepartment(updatedData.getHeadOfDepartment());
        existing.setBudgetAllocated(updatedData.getBudgetAllocated());
        return departmentRepository.save(existing);
    }

    public void deleteDepartment(Long id) {
        Department department = getDepartmentById(id);
        departmentRepository.delete(department);
    }
}
