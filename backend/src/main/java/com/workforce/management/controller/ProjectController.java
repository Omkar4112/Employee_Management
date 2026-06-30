package com.workforce.management.controller;

import com.workforce.management.entity.Project;
import com.workforce.management.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public List<Map<String, Object>> getAllProjects() {
        return projectService.getAllProjects();
    }

    @PostMapping
    public Map<String, Object> createProject(@RequestBody Project project) {
        return projectService.createProject(project);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateProject(@PathVariable Long id, @RequestBody Project project) {
        return projectService.updateProject(id, project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{projectId}/assign")
    public Map<String, Object> assignEmployee(@PathVariable Long projectId, @RequestBody Map<String, Object> payload) {
        Long employeeId = Long.valueOf(payload.get("employeeId").toString());
        Integer allocation = Integer.valueOf(payload.get("allocation").toString());
        return projectService.assignEmployee(projectId, employeeId, allocation);
    }

    @DeleteMapping("/{projectId}/assign/{employeeId}")
    public Map<String, Object> removeAssignment(@PathVariable Long projectId, @PathVariable Long employeeId) {
        return projectService.removeAssignment(projectId, employeeId);
    }
}
