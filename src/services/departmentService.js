// ============================================================
// services/departmentService.js
// All department-related API calls to the Spring Boot backend.
// ============================================================

import api from './api';

const ENDPOINT = '/departments';

export async function getAllDepartments() {
  const response = await api.get(ENDPOINT);
  return response.data;
}

export async function getDepartmentById(id) {
  const response = await api.get(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function createDepartment(departmentData) {
  const response = await api.post(ENDPOINT, departmentData);
  return response.data;
}

export async function updateDepartment(id, departmentData) {
  const response = await api.put(`${ENDPOINT}/${id}`, departmentData);
  return response.data;
}

export async function deleteDepartment(id) {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
}
