import { calcUtilization, utilizationStatus } from './ResourceEngine';
import { calcAttendancePct } from './AttendanceEngine';

// ── Insights Engine (Rule-Based System) ───────────────────────────────────────
const RULES = [
  {
    id: 'overload',
    priority: 'critical',
    icon: '🔴',
    check: (emp, state) => {
      const u = calcUtilization(emp.id, state.projects);
      return u > 80 ? { title: 'Overload Alert', msg: `${emp.name} is overloaded at ${u}% utilization. Reassign tasks immediately.`, value: u } : null;
    }
  },
  {
    id: 'underutil',
    priority: 'info',
    icon: '🟡',
    check: (emp, state) => {
      const u = calcUtilization(emp.id, state.projects);
      if (u === 0) return { title: 'Unassigned Resource', msg: `${emp.name} has no project assignments. Consider allocating tasks.`, value: u };
      if (u < 40) return { title: 'Underutilized', msg: `${emp.name} is only at ${u}% utilization. ${100 - u}% capacity available.`, value: u };
      return null;
    }
  },
  {
    id: 'attendance',
    priority: 'warning',
    icon: '🟠',
    check: (emp, state) => {
      const att = calcAttendancePct(emp.id, state.attendance);
      return att > 0 && att < 80 ? { title: 'Low Attendance', msg: `${emp.name}'s attendance is ${att}% this month. HR review recommended.`, value: att } : null;
    }
  },
  {
    id: 'promotion',
    priority: 'success',
    icon: '🟢',
    check: (emp, state) => {
      const u = calcUtilization(emp.id, state.projects);
      const att = calcAttendancePct(emp.id, state.attendance);
      const isPromo = emp.performance >= 9.0 && att >= 90 && u >= 40 && u <= 80;
      return isPromo ? { title: 'Promotion Candidate', msg: `${emp.name} scores ${emp.performance}/10 with ${att}% attendance and optimal utilization. Eligible for review.`, value: emp.performance } : null;
    }
  },
  {
    id: 'reliability',
    priority: 'warning',
    icon: '🟠',
    check: (emp, state) => {
      const leaveCount = state.leaves.filter(l => l.employeeId === emp.id && l.status === 'Approved').length;
      return leaveCount >= 3 ? { title: 'High Leave Frequency', msg: `${emp.name} has ${leaveCount} approved leaves this cycle. May impact team reliability.`, value: leaveCount } : null;
    }
  },
];

const PRIORITY_ORDER = { critical: 4, warning: 3, info: 2, success: 1 };

export function generateInsights(state) {
  const insights = [];
  state.employees.forEach(emp => {
    RULES.forEach(rule => {
      const result = rule.check(emp, state);
      if (result) {
        insights.push({
          id: `${rule.id}_${emp.id}`,
          priority: rule.priority,
          icon: rule.icon,
          employeeId: emp.id,
          employeeName: emp.name,
          ...result
        });
      }
    });
  });
  return insights.sort((a, b) => (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0));
}

// ── Hierarchy Builder ─────────────────────────────────────────────────────────
export function buildHierarchy(employees) {
  const map = {};
  employees.forEach(e => { map[e.id] = { ...e, children: [] }; });
  const roots = [];
  employees.forEach(e => {
    if (e.managerId && map[e.managerId]) {
      map[e.managerId].children.push(map[e.id]);
    } else {
      roots.push(map[e.id]);
    }
  });
  return roots;
}

// ── Filter Engine ─────────────────────────────────────────────────────────────
export function applyFilters(employees, filters, state) {
  return employees.filter(emp => {
    return filters.every(f => {
      const val = (() => {
        if (f.field === 'utilization') return calcUtilization(emp.id, state.projects);
        if (f.field === 'attendance') return calcAttendancePct(emp.id, state.attendance);
        return emp[f.field];
      })();
      switch (f.op) {
        case '=': case '==': return String(val).toLowerCase() === String(f.value).toLowerCase();
        case '!=': return String(val).toLowerCase() !== String(f.value).toLowerCase();
        case '>': return Number(val) > Number(f.value);
        case '>=': return Number(val) >= Number(f.value);
        case '<': return Number(val) < Number(f.value);
        case '<=': return Number(val) <= Number(f.value);
        case 'contains': return String(val).toLowerCase().includes(String(f.value).toLowerCase());
        default: return true;
      }
    });
  });
}
