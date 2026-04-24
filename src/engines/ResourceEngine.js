// ── Resource Allocation Engine ─────────────────────────────────────────────
export function calcUtilization(employeeId, projects) {
  return projects
    .flatMap(p => p.assignments)
    .filter(a => a.employeeId === employeeId)
    .reduce((sum, a) => sum + (a.allocation || 0), 0);
}

export function utilizationStatus(pct) {
  if (pct > 80) return { label: 'Overloaded', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', cls: 'badge-danger' };
  if (pct >= 40) return { label: 'Optimal', color: '#10b981', bg: 'rgba(16,185,129,0.12)', cls: 'badge-success' };
  return { label: 'Underutilized', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', cls: 'badge-warning' };
}

export function getEmployeeProjects(employeeId, projects) {
  return projects.filter(p => p.assignments.some(a => a.employeeId === employeeId));
}

export function calcTeamUtilizationDistribution(employees, projects) {
  const dist = { Underutilized: 0, Optimal: 0, Overloaded: 0 };
  employees.forEach(emp => {
    const u = calcUtilization(emp.id, projects);
    const s = utilizationStatus(u);
    dist[s.label] = (dist[s.label] || 0) + 1;
  });
  return dist;
}
