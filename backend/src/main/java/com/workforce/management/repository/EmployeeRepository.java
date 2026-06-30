package com.workforce.management.repository;

import com.workforce.management.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Employee entity.
 *
 * By extending JpaRepository<Employee, Long>, Spring automatically generates:
 * - findAll(), findById(), save(), deleteById(), count(), existsById(), etc.
 *
 * We can also declare custom query methods using Spring Data's method naming
 * convention, or use @Query with JPQL for more complex queries.
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // --- Spring Data Method Naming Convention ---
    // Spring reads the method name and generates the SQL automatically.

    // SELECT * FROM employees WHERE department = ?
    List<Employee> findByDepartment(String department);

    // SELECT * FROM employees WHERE status = ?
    List<Employee> findByStatus(String status);

    // SELECT * FROM employees WHERE access_level = ?
    List<Employee> findByAccessLevel(String accessLevel);

    // SELECT * FROM employees WHERE email = ?
    Optional<Employee> findByEmail(String email);

    // SELECT * FROM employees WHERE name LIKE %keyword%
    List<Employee> findByNameContainingIgnoreCase(String keyword);

    // SELECT * FROM employees WHERE department = ? AND status = ?
    List<Employee> findByDepartmentAndStatus(String department, String status);

    // --- Custom JPQL Query Example ---
    // JPQL uses class name (Employee) not table name (employees)
    @Query("SELECT e FROM Employee e WHERE e.performanceScore >= :minScore")
    List<Employee> findHighPerformers(@Param("minScore") Double minScore);

    // Count employees by department (for dashboard analytics)
    Long countByDepartment(String department);

    // Check if an email already exists (for validation)
    boolean existsByEmail(String email);
}
