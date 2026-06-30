// ============================================================
// services/leaveService.js
// All leave management API calls to the Spring Boot backend.
// ============================================================

import api from './api';

const ENDPOINT = '/leaves';

/**
 * Fetch all leave requests.
 * @param {{ status?: string }} params - Optional filter (e.g. status=Pending)
 */
export async function getAllLeaves(params = {}) {
  const response = await api.get(ENDPOINT, { params });
  return response.data;
}

/**
 * Fetch all leave requests for a specific employee.
 * @param {string|number} employeeId
 */
export async function getLeavesByEmployee(employeeId) {
  const response = await api.get(`${ENDPOINT}/employee/${employeeId}`);
  return response.data;
}

/**
 * Get only pending leave requests (for HR/Admin approval queue).
 */
export async function getPendingLeaves() {
  const response = await api.get(ENDPOINT, { params: { status: 'Pending' } });
  return response.data;
}

/**
 * Apply for a new leave (Employee action).
 * Backend will run conflict detection before saving.
 * @param {Object} leaveData - { employee: { id }, leaveType, startDate, endDate, reason }
 */
export async function applyForLeave(leaveData) {
  const response = await api.post(ENDPOINT, leaveData);
  return response.data;
}

/**
 * Approve a pending leave (HR/Admin action).
 * @param {string|number} leaveId
 * @param {string} reviewedBy - Name of the reviewer
 */
export async function approveLeave(leaveId, reviewedBy = 'HR') {
  const response = await api.put(`${ENDPOINT}/${leaveId}/approve`, null, {
    params: { reviewedBy },
  });
  return response.data;
}

/**
 * Reject a pending leave (HR/Admin action).
 * @param {string|number} leaveId
 * @param {string} reviewedBy
 */
export async function rejectLeave(leaveId, reviewedBy = 'HR') {
  const response = await api.put(`${ENDPOINT}/${leaveId}/reject`, null, {
    params: { reviewedBy },
  });
  return response.data;
}

/**
 * Cancel a pending leave request (Employee action).
 * @param {string|number} leaveId
 */
export async function cancelLeave(leaveId) {
  const response = await api.delete(`${ENDPOINT}/${leaveId}`);
  return response.data;
}

/**
 * Get leave analytics for the dashboard.
 * @returns {{ pending: number }}
 */
export async function getLeaveStats() {
  const response = await api.get(`${ENDPOINT}/stats`);
  return response.data;
}
