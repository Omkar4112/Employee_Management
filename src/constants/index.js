// ============================================================
// constants/index.js
// App-wide constants — roles, leave types, departments, routes
// Centralizing constants prevents magic strings scattered across files
// ============================================================

// ─── User Roles ───────────────────────────────────────────────
export const ROLES = {
  ADMIN:    'ADMIN',
  HR:       'HR',
  EMPLOYEE: 'EMPLOYEE',
};

// ─── Navigation Routes ────────────────────────────────────────
export const ROUTES = {
  OVERVIEW:   'overview',
  DASHBOARD:  'dashboard',
  ANALYTICS:  'analytics',
  EMPLOYEES:  'employees',
  ORG:        'org',
  PROJECTS:   'projects',
  LEAVE:      'leave',
};

// ─── Which roles can access which routes ──────────────────────
export const ROUTE_PERMISSIONS = {
  [ROUTES.OVERVIEW]:  [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE],
  [ROUTES.DASHBOARD]: [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE],
  [ROUTES.ANALYTICS]: [ROLES.ADMIN, ROLES.HR],
  [ROUTES.EMPLOYEES]: [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE],
  [ROUTES.ORG]:       [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE],
  [ROUTES.PROJECTS]:  [ROLES.ADMIN, ROLES.HR],
  [ROUTES.LEAVE]:     [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE],
};

// ─── Navigation Config ────────────────────────────────────────
export const NAV_ITEMS = [
  { id: ROUTES.OVERVIEW,   label: 'Welcome',         icon: '🏠', section: 'System'     },
  { id: ROUTES.DASHBOARD,  label: 'Dashboard',       icon: '⚡', section: 'Overview'   },
  { id: ROUTES.ANALYTICS,  label: 'Analytics',       icon: '📊', section: 'Overview'   },
  { id: ROUTES.EMPLOYEES,  label: 'Employees',       icon: '👥', section: 'Workforce'  },
  { id: ROUTES.ORG,        label: 'Org Hierarchy',   icon: '🌳', section: 'Workforce'  },
  { id: ROUTES.PROJECTS,   label: 'Projects',        icon: '🚀', section: 'Operations' },
  { id: ROUTES.LEAVE,      label: 'Leave & Attend.', icon: '📅', section: 'Operations' },
];

// ─── Leave Types ──────────────────────────────────────────────
export const LEAVE_TYPES = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency'];

// ─── Leave Status ─────────────────────────────────────────────
export const LEAVE_STATUS = {
  PENDING:  'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

// ─── Employee Status ──────────────────────────────────────────
export const EMPLOYEE_STATUS = {
  ACTIVE:   'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On Leave',
};

// ─── Departments ──────────────────────────────────────────────
export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'HR',
  'Finance',
  'Marketing',
  'Executive',
  'Operations',
];

// ─── Performance Thresholds ───────────────────────────────────
export const PERFORMANCE = {
  EXCELLENT:  { min: 9.0, label: 'Excellent', color: 'var(--success)' },
  GOOD:       { min: 7.5, label: 'Good',      color: 'var(--primary)' },
  AVERAGE:    { min: 6.0, label: 'Average',   color: 'var(--warning)' },
  POOR:       { min: 0,   label: 'Needs Work',color: 'var(--danger)'  },
};

// ─── Attendance Thresholds ────────────────────────────────────
export const ATTENDANCE = {
  EXCELLENT: { min: 90, label: 'Excellent', badge: 'badge-success' },
  FAIR:      { min: 75, label: 'Fair',      badge: 'badge-warning' },
  LOW:       { min: 0,  label: 'Low',       badge: 'badge-danger'  },
};

// ─── Project Status ───────────────────────────────────────────
export const PROJECT_STATUS = ['Active', 'Planning', 'On Hold', 'Completed'];

// ─── Pagination ───────────────────────────────────────────────
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
export const DEFAULT_PAGE_SIZE = 10;

// ─── API Base URL (for future backend integration) ────────────
export const API_BASE_URL = 'http://localhost:8080/api';

// ─── Local Storage Key ────────────────────────────────────────
export const STORAGE_KEY = 'wfm_state_v3';
