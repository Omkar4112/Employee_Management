import React, { createContext, useReducer, useEffect, useContext, useCallback } from 'react';
import { getAllEmployees } from '../services/employeeService';
import { getAllLeaves } from '../services/leaveService';
import { getAllProjects } from '../services/projectService';
import { getAllAttendance } from '../services/attendanceService';

const INITIAL_STATE = {
  auth: { user: null, isAuthenticated: false },
  employees: [],
  projects: [],
  attendance: [],
  leaves: [],
  activityLogs: []
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
      return INITIAL_STATE;

    case 'LOGIN': {
      const user = action.payload; // payload should now be the full user object from MySQL
      return { ...state, auth: { isAuthenticated: true, user }, activityLogs: log(state, 'User Login', `${user.name} logged in.`) };
    }

    case 'LOGOUT': {
      return { ...state, auth: { isAuthenticated: false, user: null }, activityLogs: log(state, 'User Logout', 'User signed out.') };
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
    
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };

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

    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };

    // ── Attendance ─────────────────────────────────
    case 'UPDATE_ATTENDANCE': {
      const rec = action.payload;
      const exists = state.attendance.find(a => a.employeeId === rec.employeeId);
      return { ...state, attendance: exists ? state.attendance.map(a => a.employeeId === rec.employeeId ? rec : a) : [...state.attendance, rec] };
    }
    case 'SET_ATTENDANCE':
      return { ...state, attendance: action.payload };

    // ── Leaves ─────────────────────────────────────
    case 'APPLY_LEAVE': {
      const leave = action.payload;
      const emp = state.employees.find(e => e.id === leave.employeeId);
      return { ...state, leaves: [...state.leaves, leave], activityLogs: log(state, 'Leave Applied', `${emp?.name || leave.employeeId} applied for ${leave.type} leave.`) };
    }
    
    case 'SET_LEAVES':
      return { ...state, leaves: action.payload };

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
    const raw = localStorage.getItem('wfm_state_v4');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return INITIAL_STATE;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Fetch from Spring Boot MySQL Backend on load
  const fetchInitialData = useCallback(async () => {
    if (state.auth.isAuthenticated) {
      try {
        const [empData, leaveData, projData, attData] = await Promise.all([
          getAllEmployees(),
          getAllLeaves(),
          getAllProjects(),
          getAllAttendance()
        ]);
        
        dispatch({ type: 'SET_EMPLOYEES', payload: empData });
        dispatch({ type: 'SET_LEAVES', payload: leaveData });
        dispatch({ type: 'SET_PROJECTS', payload: projData });
        dispatch({ type: 'SET_ATTENDANCE', payload: attData });
      } catch (error) {
        console.error("Failed to load backend data. Ensure Spring Boot and MySQL are running.", error);
      }
    }
  }, [state.auth.isAuthenticated]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    try { localStorage.setItem('wfm_state_v4', JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
