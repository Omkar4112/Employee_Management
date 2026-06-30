import api from './api';

const ENDPOINT = '/projects';

export async function getAllProjects() {
  const response = await api.get(ENDPOINT);
  return response.data;
}

export async function createProject(projectData) {
  const response = await api.post(ENDPOINT, projectData);
  return response.data;
}

export async function updateProject(id, projectData) {
  const response = await api.put(`${ENDPOINT}/${id}`, projectData);
  return response.data;
}

export async function deleteProject(id) {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function assignEmployeeToProject(projectId, employeeId, allocation) {
  const response = await api.post(`${ENDPOINT}/${projectId}/assign`, { employeeId, allocation });
  return response.data;
}

export async function removeEmployeeFromProject(projectId, employeeId) {
  const response = await api.delete(`${ENDPOINT}/${projectId}/assign/${employeeId}`);
  return response.data;
}
