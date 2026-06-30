package com.workforce.management;

import com.workforce.management.entity.Department;
import com.workforce.management.entity.Employee;
import com.workforce.management.repository.DepartmentRepository;
import com.workforce.management.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Data Seeder that runs once on application startup.
 *
 * Implements CommandLineRunner so Spring Boot executes the run() method
 * automatically after all beans are initialized.
 *
 * This seeds the database with sample departments and employees if they
 * don't already exist, making it easy to start testing without manual data entry.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if database is empty
        if (departmentRepository.count() == 0) {
            log.info("--- Seeding departments ---");
            departmentRepository.save(Department.builder().name("Engineering").description("Software Development Team").headOfDepartment("Alice Johnson").build());
            departmentRepository.save(Department.builder().name("HR").description("Human Resources Department").headOfDepartment("Bob Smith").build());
            departmentRepository.save(Department.builder().name("Finance").description("Finance and Accounting").headOfDepartment("Carol White").build());
            departmentRepository.save(Department.builder().name("Marketing").description("Marketing and Sales").headOfDepartment("David Brown").build());
            log.info("--- Departments seeded successfully ---");
        }

        if (employeeRepository.count() == 0) {
            log.info("--- Seeding employees ---");
            employeeRepository.save(Employee.builder()
                    .name("Alice Johnson").role("Engineering Lead").department("Engineering")
                    .accessLevel("Admin").email("alice@company.com")
                    .salary(120000.0).performanceScore(9.2).attendancePercentage(96.0)
                    .status("Active").manager("CEO").joinDate("2020-03-15").build());

            employeeRepository.save(Employee.builder()
                    .name("Bob Smith").role("HR Manager").department("HR")
                    .accessLevel("HR").email("bob@company.com")
                    .salary(85000.0).performanceScore(8.5).attendancePercentage(92.0)
                    .status("Active").manager("Alice Johnson").joinDate("2021-01-10").build());

            employeeRepository.save(Employee.builder()
                    .name("Carol White").role("Software Engineer").department("Engineering")
                    .accessLevel("Employee").email("carol@company.com")
                    .salary(95000.0).performanceScore(7.8).attendancePercentage(88.0)
                    .status("Active").manager("Alice Johnson").joinDate("2022-06-01").build());

            employeeRepository.save(Employee.builder()
                    .name("David Brown").role("Marketing Analyst").department("Marketing")
                    .accessLevel("Employee").email("david@company.com")
                    .salary(75000.0).performanceScore(8.1).attendancePercentage(90.0)
                    .status("Active").manager("Alice Johnson").joinDate("2021-09-20").build());

            log.info("--- Employees seeded successfully ---");
        }
    }
}
