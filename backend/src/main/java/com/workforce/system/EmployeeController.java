package com.workforce.system.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    // In-memory mock for demonstration
    private List<Map<String, Object>> employees = new ArrayList<>();

    @GetMapping
    public List<Map<String, Object>> getAllEmployees() {
        return employees;
    }

    @PostMapping
    public Map<String, Object> createEmployee(@RequestBody Map<String, Object> employee) {
        employee.put("id", "e" + System.currentTimeMillis());
        employees.add(employee);
        return employee;
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateEmployee(@PathVariable String id, @RequestBody Map<String, Object> updated) {
        for (int i = 0; i < employees.size(); i++) {
            if (employees.get(i).get("id").equals(id)) {
                employees.set(i, updated);
                return updated;
            }
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable String id) {
        employees.removeIf(e -> e.get("id").equals(id));
    }
}
