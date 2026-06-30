package com.workforce.management.service;

import com.workforce.management.entity.Project;
import com.workforce.management.entity.ProjectAssignment;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.ProjectAssignmentRepository;
import com.workforce.management.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;

    public List<Map<String, Object>> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        return projects.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public Map<String, Object> createProject(Project project) {
        Project saved = projectRepository.save(project);
        return mapToDTO(saved);
    }

    public Map<String, Object> updateProject(Long id, Project projectDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        project.setName(projectDetails.getName());
        project.setStatus(projectDetails.getStatus());
        project.setDeadline(projectDetails.getDeadline());
        Project saved = projectRepository.save(project);
        return mapToDTO(saved);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        
        List<ProjectAssignment> assignments = assignmentRepository.findByProjectId(id);
        assignmentRepository.deleteAll(assignments);
        
        projectRepository.delete(project);
    }

    public Map<String, Object> assignEmployee(Long projectId, Long employeeId, Integer allocation) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        
        List<ProjectAssignment> existing = assignmentRepository.findByProjectId(projectId);
        ProjectAssignment assignment = existing.stream()
                .filter(a -> a.getEmployeeId().equals(employeeId))
                .findFirst()
                .orElse(ProjectAssignment.builder().projectId(projectId).employeeId(employeeId).build());
        
        assignment.setAllocation(allocation);
        assignmentRepository.save(assignment);
        
        return mapToDTO(project);
    }

    public Map<String, Object> removeAssignment(Long projectId, Long employeeId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
                
        List<ProjectAssignment> existing = assignmentRepository.findByProjectId(projectId);
        existing.stream()
                .filter(a -> a.getEmployeeId().equals(employeeId))
                .findFirst()
                .ifPresent(assignmentRepository::delete);
                
        return mapToDTO(project);
    }

    private Map<String, Object> mapToDTO(Project project) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", project.getId());
        dto.put("name", project.getName());
        dto.put("status", project.getStatus());
        dto.put("deadline", project.getDeadline());
        
        List<ProjectAssignment> assignments = assignmentRepository.findByProjectId(project.getId());
        dto.put("assignments", assignments.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("employeeId", a.getEmployeeId());
            map.put("allocation", a.getAllocation());
            return map;
        }).collect(Collectors.toList()));
        
        return dto;
    }
}
