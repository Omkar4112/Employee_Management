import React, { createContext, useReducer, useEffect, useContext, useCallback } from 'react';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED = {
  auth: {
    user: null,
    isAuthenticated: false
  },
  employees: [
// ... existing employee data ...
    { id: 'e1', name: 'Sarah Connor', role: 'CTO', department: 'Executive', salary: 200000, performance: 9.5, managerId: null, joinDate: '2020-01-10', avatar: 'SC' },
    { id: 'e2', name: 'John Reese', role: 'Engineering Manager', department: 'Engineering', salary: 150000, performance: 8.8, managerId: 'e1', joinDate: '2020-03-15', avatar: 'JR' },
    { id: 'e3', name: 'Root Shaw', role: 'Design Manager', department: 'Design', salary: 140000, performance: 9.1, managerId: 'e1', joinDate: '2020-04-01', avatar: 'RS' },
    { id: 'e4', name: 'Harold Finch', role: 'Sr. Frontend Dev', department: 'Engineering', salary: 120000, performance: 9.2, managerId: 'e2', joinDate: '2021-01-20', avatar: 'HF' },
    { id: 'e5', name: 'Sameen Shaw', role: 'Backend Engineer', department: 'Engineering', salary: 115000, performance: 8.5, managerId: 'e2', joinDate: '2021-03-01', avatar: 'SS' },
    { id: 'e6', name: 'Omkar Patil', role: 'Full Stack Dev', department: 'Engineering', salary: 110000, performance: 9.0, managerId: 'e2', joinDate: '2021-06-15', avatar: 'OP' },
    { id: 'e7', name: 'Bear Grylls', role: 'UI/UX Designer', department: 'Design', salary: 100000, performance: 8.2, managerId: 'e3', joinDate: '2021-08-01', avatar: 'BG' },
    { id: 'e8', name: 'Zoe Morgan', role: 'Product Manager', department: 'Product', salary: 130000, performance: 8.9, managerId: 'e1', joinDate: '2020-09-10', avatar: 'ZM' },
    { id: 'e9', name: 'Carter James', role: 'QA Engineer', department: 'Engineering', salary: 95000, performance: 7.8, managerId: 'e2', joinDate: '2022-01-05', avatar: 'CJ' },
    { id: 'e10', name: 'Fusco Leon', role: 'DevOps Engineer', department: 'Engineering', salary: 108000, performance: 8.0, managerId: 'e2', joinDate: '2022-03-20', avatar: 'FL' },
  ],
  projects: [
    { id: 'p1', name: 'Phoenix Platform', status: 'Active', deadline: '2026-08-01', assignments: [
      { employeeId: 'e4', allocation: 60 }, { employeeId: 'e6', allocation: 50 }, { employeeId: 'e7', allocation: 80 }
    ]},
    { id: 'p2', name: 'Nexus API Migration', status: 'Active', deadline: '2026-06-15', assignments: [
      { employeeId: 'e5', allocation: 70 }, { employeeId: 'e6', allocation: 50 }, { employeeId: 'e10', allocation: 60 }
    ]},
    { id: 'p3', name: 'Mobile App V3', status: 'Active', deadline: '2026-09-30', assignments: [
      { employeeId: 'e4', allocation: 40 }, { employeeId: 'e7', allocation: 20 }, { employeeId: 'e9', allocation: 90 }
    ]},
    { id: 'p4', name: 'Analytics Dashboard', status: 'Planning', deadline: '2026-12-01', assignments: [
      { employeeId: 'e8', allocation: 30 }
    ]},
  ],
  attendance: [
    { employeeId: 'e1', presentDays: 20, totalDays: 20 },
    { employeeId: 'e2', presentDays: 19, totalDays: 20 },
    { employeeId: 'e3', presentDays: 18, totalDays: 20 },
    { employeeId: 'e4', presentDays: 20, totalDays: 20 },
    { employeeId: 'e5', presentDays: 15, totalDays: 20 },
    { employeeId: 'e6', presentDays: 20, totalDays: 20 },
    { employeeId: 'e7', presentDays: 17, totalDays: 20 },
    { employeeId: 'e8', presentDays: 19, totalDays: 20 },
    { employeeId: 'e9', presentDays: 14, totalDays: 20 },
    { employeeId: 'e10', presentDays: 18, totalDays: 20 },
  ],
  leaves: [
    { id: 'l1', employeeId: 'e5', type: 'Sick', startDate: '2026-04-20', endDate: '2026-04-22', status: 'Approved', reason: 'Flu' },
    { id: 'l2', employeeId: 'e9', type: 'Annual', startDate: '2026-05-01', endDate: '2026-05-05', status: 'Pending', reason: 'Vacation' },
    { id: 'l3', employeeId: 'e7', type: 'Sick', startDate: '2026-04-18', endDate: '2026-04-19', status: 'Approved', reason: 'Medical' },
  ],
  activityLogs: [
    { id: 'log0', action: 'System Boot', timestamp: new Date(Date.now() - 60000).toISOString(), actor: 'System', details: 'Workforce Management System initialized with seed data.' }
  ]
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function log(state, action, details) {
  const actor = state.auth?.user?.name || 'System';
  const entry = { id: `log_${Date.now()}_${Math.random()}`, action, timestamp: new Date().toISOString(), actor, details };
  return [entry, ...state.activityLogs];
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESET_TO_SEED':
      return { ...SEED, activityLogs: SEED.activityLogs };

    case 'LOGIN': {
      const { role, email } = action.payload;
      const user = { 
        ADMIN: { id: 'admin', name: 'Admin User', role: 'ADMIN', email },
        HR: { id: 'hr', name: 'HR Manager', role: 'HR', email },
        EMPLOYEE: { id: 'e6', name: 'Omkar Patil', role: 'EMPLOYEE', email }
      }[role] || state.auth.user;
      return { ...state, auth: { isAuthenticated: true, user }, activityLogs: log(state, 'User Login', `${user.name} logged in as ${user.role}.`) };
    }

    case 'LOGOUT': {
      return { ...state, auth: { isAuthenticated: false, user: null }, activityLogs: log(state, 'User Logout', 'User signed out.') };
    }

    case 'SET_ROLE': {
      const role = action.payload;
      const user = { 
        ADMIN: { id: 'admin', name: 'Admin User', role: 'ADMIN', email: state.auth.user.email },
        HR: { id: 'hr', name: 'HR Manager', role: 'HR', email: state.auth.user.email },
        EMPLOYEE: { id: 'e6', name: 'Omkar Patil', role: 'EMPLOYEE', email: state.auth.user.email }
      }[role] || state.auth.user;
      return { ...state, auth: { ...state.auth, user } };
    }

    // ── Employees ──────────────────────────────────
    case 'ADD_EMPLOYEE': {
      const emp = action.payload;
      return { ...state, employees: [...state.employees, emp], activityLogs: log(state, 'Hired Employee', `${emp.name} joined as ${emp.role} in ${emp.department}.`) };
    }
    case 'UPDATE_EMPLOYEE': {
      const updated = action.payload;
      return { ...state, employees: state.employees.map(e => e.id === updated.id ? updated : e), activityLogs: log(state, 'Updated Employee', `${updated.name}'s profile was updated.`) };
    }
    case 'DELETE_EMPLOYEE': {
      const id = action.payload;
      const emp = state.employees.find(e => e.id === id);
      return {
        ...state,
        employees: state.employees.filter(e => e.id !== id),
        projects: state.projects.map(p => ({ ...p, assignments: p.assignments.filter(a => a.employeeId !== id) })),
        attendance: state.attendance.filter(a => a.employeeId !== id),
        leaves: state.leaves.filter(l => l.employeeId !== id),
        activityLogs: log(state, 'Terminated Employee', `${emp?.name || id} was removed (cascade delete applied).`)
      };
    }

    // ── Projects ───────────────────────────────────
    case 'ADD_PROJECT': {
      const proj = action.payload;
      return { ...state, projects: [...state.projects, proj], activityLogs: log(state, 'Created Project', `Project "${proj.name}" was created.`) };
    }
    case 'UPDATE_PROJECT': {
      const proj = action.payload;
      return { ...state, projects: state.projects.map(p => p.id === proj.id ? proj : p), activityLogs: log(state, 'Updated Project', `Project "${proj.name}" was updated.`) };
    }
    case 'DELETE_PROJECT': {
      const id = action.payload;
      const proj = state.projects.find(p => p.id === id);
      return { ...state, projects: state.projects.filter(p => p.id !== id), activityLogs: log(state, 'Deleted Project', `Project "${proj?.name || id}" was removed.`) };
    }
    case 'ASSIGN_TO_PROJECT': {
      const { projectId, employeeId, allocation } = action.payload;
      const emp = state.employees.find(e => e.id === employeeId);
      const proj = state.projects.find(p => p.id === projectId);
      return {
        ...state,
        projects: state.projects.map(p => {
          if (p.id !== projectId) return p;
          const existing = p.assignments.find(a => a.employeeId === employeeId);
          const assignments = existing
            ? p.assignments.map(a => a.employeeId === employeeId ? { ...a, allocation } : a)
            : [...p.assignments, { employeeId, allocation }];
          return { ...p, assignments };
        }),
        activityLogs: log(state, 'Resource Assigned', `${emp?.name || employeeId} assigned to "${proj?.name || projectId}" at ${allocation}%.`)
      };
    }
    case 'REMOVE_FROM_PROJECT': {
      const { projectId, employeeId } = action.payload;
      return { ...state, projects: state.projects.map(p => p.id !== projectId ? p : { ...p, assignments: p.assignments.filter(a => a.employeeId !== employeeId) }) };
    }

    // ── Attendance ─────────────────────────────────
    case 'UPDATE_ATTENDANCE': {
      const rec = action.payload;
      const exists = state.attendance.find(a => a.employeeId === rec.employeeId);
      return { ...state, attendance: exists ? state.attendance.map(a => a.employeeId === rec.employeeId ? rec : a) : [...state.attendance, rec] };
    }

    // ── Leaves ─────────────────────────────────────
    case 'APPLY_LEAVE': {
      const leave = action.payload;
      const emp = state.employees.find(e => e.id === leave.employeeId);
      return { ...state, leaves: [...state.leaves, leave], activityLogs: log(state, 'Leave Applied', `${emp?.name || leave.employeeId} applied for ${leave.type} leave.`) };
    }
    case 'UPDATE_LEAVE_STATUS': {
      const { id, status } = action.payload;
      const leave = state.leaves.find(l => l.id === id);
      const emp = state.employees.find(e => e.id === leave?.employeeId);
      return { ...state, leaves: state.leaves.map(l => l.id === id ? { ...l, status } : l), activityLogs: log(state, `Leave ${status}`, `${emp?.name || ''}'s leave request was ${status.toLowerCase()}.`) };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
export const AppContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem('wfm_state_v3');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return SEED;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try { localStorage.setItem('wfm_state_v3', JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
