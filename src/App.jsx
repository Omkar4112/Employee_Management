import React, { useState, useMemo } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { generateInsights } from './engines/InsightsEngine';
import Dashboard from './modules/dashboard/Dashboard';
import EmployeeList from './modules/employees/EmployeeList';
import ProjectList from './modules/projects/ProjectList';
import OrgChart from './modules/org/OrgChart';
import LeaveAttendance from './modules/leave/LeaveAttendance';
import Analytics from './modules/analytics/Analytics';
import './index.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⚡', section: 'Overview' },
  { id: 'analytics', label: 'Analytics', icon: '📊', section: 'Overview' },
  { id: 'employees', label: 'Employees', icon: '👥', section: 'Workforce' },
  { id: 'org', label: 'Org Hierarchy', icon: '🌳', section: 'Workforce' },
  { id: 'projects', label: 'Projects', icon: '🚀', section: 'Operations' },
  { id: 'leave', label: 'Leave & Attendance', icon: '📅', section: 'Operations' },
];

function Sidebar({ active, setActive }) {
  const { state, dispatch } = useApp();
  const insights = useMemo(() => generateInsights(state), [state]);
  const criticalCount = insights.filter(i => i.priority === 'critical').length;

  const sections = [...new Set(NAV.map(n => n.section))];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <div className="sidebar-logo-text">
          <h2>WorkforceAI</h2>
          <p>Enterprise System v2.0</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {NAV.filter(n => n.section === section).map(item => (
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
      </nav>

      <div style={{ padding: '0.75rem' }}>
        <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.78rem', justifyContent: 'center' }}
          onClick={() => {
            if (window.confirm('Reset all data to seed? This cannot be undone.')) dispatch({ type: 'RESET_TO_SEED' });
          }}>
          🔄 Reset Demo Data
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: '#fff' }}>A</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Admin User</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>admin@workforce.ai</div>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--success)', background: 'var(--success-dim)', padding: '0.15rem 0.4rem', borderRadius: '9999px', fontWeight: 600 }}>● Online</span>
      </div>
    </aside>
  );
}

function AppShell() {
  const [active, setActive] = useState('dashboard');
  const pages = { dashboard: Dashboard, analytics: Analytics, employees: EmployeeList, org: OrgChart, projects: ProjectList, leave: LeaveAttendance };
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
