import React, { useState, useMemo } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { generateInsights } from './engines/InsightsEngine';
import Dashboard from './modules/dashboard/Dashboard';
import EmployeeList from './modules/employees/EmployeeList';
import ProjectList from './modules/projects/ProjectList';
import OrgChart from './modules/org/OrgChart';
import LeaveAttendance from './modules/leave/LeaveAttendance';
import Analytics from './modules/analytics/Analytics';
import Overview from './modules/overview/Overview';
import Login from './modules/auth/Login';
import './index.css';

const NAV = [
  { id: 'overview', label: 'Welcome', icon: '🏠', section: 'System', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { id: 'dashboard', label: 'Dashboard', icon: '⚡', section: 'Overview', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { id: 'analytics', label: 'Analytics', icon: '📊', section: 'Overview', roles: ['ADMIN', 'HR'] },
  { id: 'employees', label: 'Employees', icon: '👥', section: 'Workforce', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { id: 'org', label: 'Org Hierarchy', icon: '🌳', section: 'Workforce', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { id: 'projects', label: 'Projects', icon: '🚀', section: 'Operations', roles: ['ADMIN', 'HR'] },
  { id: 'leave', label: 'Leave & Attendance', icon: '📅', section: 'Operations', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
];

function Sidebar({ active, setActive }) {
  const { state, dispatch } = useApp();
  const insights = useMemo(() => generateInsights(state), [state]);
  const criticalCount = insights.filter(i => i.priority === 'critical').length;

  const user = state.auth.user;
  const filteredNav = NAV.filter(n => n.roles.includes(user.role));
  const sections = [...new Set(filteredNav.map(n => n.section))];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <div className="sidebar-logo-text">
          <h2>WorkforceAI</h2>
          <p>Enterprise System v2.0</p>
        </div>
      </div>

      <div className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {filteredNav.filter(n => n.section === section).map(item => (
              <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => setActive(item.id)}>
                <span className="nav-item-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'dashboard' && criticalCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: '#fff', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem' }}>{criticalCount}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <div className="text-xs text-muted mb-1" style={{ paddingLeft: '0.5rem', fontWeight: 600 }}>DEMO: SWITCH ROLE</div>
        <div className="flex gap-sm" style={{ padding: '0 0.5rem' }}>
          {['ADMIN', 'HR', 'EMPLOYEE'].map(r => (
            <button key={r} 
              className={`btn btn-xs ${user.role === r ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, fontSize: '0.65rem', padding: '0.25rem 0' }}
              onClick={() => dispatch({ type: 'SET_ROLE', payload: r })}>
              {r[0]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0.75rem' }}>
        <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.78rem', justifyContent: 'center' }}
          onClick={() => {
            if (window.confirm('Reset all data to seed? This cannot be undone.')) dispatch({ type: 'RESET_TO_SEED' });
          }}>
          🔄 Reset Demo Data
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: '#fff' }}>{user.name[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>{user.role} Role</div>
        </div>
        <button className="btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={() => dispatch({ type: 'LOGOUT' })} title="Logout">
          ⏻
        </button>
      </div>
    </aside>
  );
}

function AppShell() {
  const { state } = useApp();
  const [active, setActive] = useState('overview');
  
  if (!state.auth.isAuthenticated) {
    return <Login />;
  }

  const pages = { overview: Overview, dashboard: Dashboard, analytics: Analytics, employees: EmployeeList, org: OrgChart, projects: ProjectList, leave: LeaveAttendance };
  const Page = pages[active] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive} />
      <main className="main">
        <Page />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
