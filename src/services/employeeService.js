// ============================================================
// services/employeeService.js
// All employee-related API calls to the Spring Boot backend.
//
// Current state: calls are COMMENTED OUT (backend not yet live).
// When backend is running, uncomment the axios calls and remove
// the simulated data return.
// ============================================================

import api from './api';

const ENDPOINT = '/employees';

/**
 * Fetch all employees (supports query params for filtering).
 * @param {{ department?: string, keyword?: string, status?: string }} params
 */
export async function getAllEmployees(params = {}) {
  const response = await api.get(ENDPOINT, { params });
  return response.data;
}

/**
 * Fetch a single employee by their database ID.
 * @param {string|number} id
 */
export async function getEmployeeById(id) {
  const response = await api.get(`${ENDPOINT}/${id}`);
  return response.data;
}

/**
 * Create (hire) a new employee.
 * @param {Object} employeeData - Matches the Employee entity fields
 */
export async function createEmployee(employeeData) {
  const response = await api.post(ENDPOINT, employeeData);
  return response.data; // Returns the saved employee with a server-generated ID
}

/**
 * Update an existing employee's full profile.
 * @param {string|number} id
 * @param {Object} employeeData
 */
export async function updateEmployee(id, employeeData) {
  const response = await api.put(`${ENDPOINT}/${id}`, employeeData);
  return response.data;
}

/**
 * Delete (terminate) an employee.
 * @param {string|number} id
 */
export async function deleteEmployee(id) {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data; // Returns { message: "Employee ... terminated." }
}

/**
 * Fetch employees with a performance score above a threshold.
 * @param {number} minScore - Default 8.0
 */
export async function getHighPerformers(minScore = 8.0) {
  const response = await api.get(`${ENDPOINT}/high-performers`, {
    params: { minScore },
  });
  return response.data;
}

/**
 * Get dashboard analytics: total and active employee counts.
 * @returns {{ total: number, active: number }}
 */
export async function getEmployeeStats() {
  const response = await api.get(`${ENDPOINT}/stats`);
  return response.data;
}
