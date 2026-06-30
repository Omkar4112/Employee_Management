import api from './api';

const ENDPOINT = '/attendance';

export async function getAllAttendance() {
  const response = await api.get(ENDPOINT);
  return response.data;
}

export async function getAttendanceByEmployee(employeeId) {
  const response = await api.get(`${ENDPOINT}/${employeeId}`);
  return response.data;
}

export async function updateAttendance(employeeId, presentDays, totalDays) {
  const response = await api.put(`${ENDPOINT}/${employeeId}`, { employeeId, presentDays, totalDays });
  return response.data;
}
