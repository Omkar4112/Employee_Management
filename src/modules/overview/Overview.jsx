import React from 'react';
import { useApp } from '../../store/AppContext';

export default function Overview() {
  const { state } = useApp();
  
  return (
    <div className="page animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>👨💼 Smart Workforce Management System</h1>
          <p>Enterprise-grade platform for modern organizational excellence.</p>
        </div>
      </div>

      <div className="section-grid mb-2">
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-3), var(--bg-2))', border: '1px solid var(--primary-dim)' }}>
          <div className="card-title">🚀 Platform Overview</div>
          <p className="text-muted mb-2" style={{ lineHeight: 1.6 }}>
            A full-featured employee management platform designed to streamline workforce operations, 
            including employee data management, role-based access, and organizational insights.
          </p>
          <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
            <div className="stat-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
              <span className="stat-card-label">Employees</span>
              <span className="stat-card-value" style={{ fontSize: '1.5rem' }}>{state.employees.length}</span>
            </div>
            <div className="stat-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
              <span className="stat-card-label">Projects</span>
              <span className="stat-card-value" style={{ fontSize: '1.5rem' }}>{state.projects.length}</span>
            </div>
            <div className="stat-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
              <span className="stat-card-label">Depts</span>
              <span className="stat-card-value" style={{ fontSize: '1.5rem' }}>5</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">🎯 Key Features</div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: '🔐', text: 'Role-based access control (Admin / HR / Employee)' },
              { icon: '👥', text: 'Employee lifecycle management' },
              { icon: '🔍', text: 'Advanced search, filtering, and pagination' },
              { icon: '📊', text: 'Dashboard with workforce analytics' },
              { icon: '🗂️', text: 'Department-wise organization' },
              { icon: '📈', text: 'Scalable architecture for enterprise use' },
            ].map((f, i) => (
              <li key={i} className="flex gap-sm flex-center">
                <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
                <span className="text-sm fw-6">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="section-grid-equal mb-2">
        <div className="card">
          <div className="card-title">🧠 Problem It Solves</div>
          <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
            Organizations often struggle with managing large employee datasets, tracking workforce distribution, 
            and maintaining structured employee records. This system simplifies workforce management with 
            a clean and scalable interface.
          </p>
          <div className="mt-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="badge badge-info" style={{ padding: '0.5rem' }}>✓ Scalability</div>
            <div className="badge badge-success" style={{ padding: '0.5rem' }}>✓ Efficiency</div>
            <div className="badge badge-primary" style={{ padding: '0.5rem' }}>✓ Visibility</div>
            <div className="badge badge-warning" style={{ padding: '0.5rem' }}>✓ Security</div>
          </div>
        </div>

        <div className="card" style={{ border: '1px dashed var(--border)' }}>
          <div className="card-title">⚙️ Tech Stack</div>
          <div className="flex-column gap-sm">
            <div className="flex-between">
              <span className="text-xs text-muted">Frontend</span>
              <span className="badge badge-primary">React.js / Vite</span>
            </div>
            <div className="flex-between">
              <span className="text-xs text-muted">Backend</span>
              <span className="badge badge-success">Spring Boot</span>
            </div>
            <div className="flex-between">
              <span className="text-xs text-muted">Database</span>
              <span className="badge badge-info">MySQL</span>
            </div>
            <div className="flex-between">
              <span className="text-xs text-muted">Styling</span>
              <span className="badge badge-neutral">Vanilla CSS (Premium)</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted" style={{ fontStyle: 'italic' }}>
            Architecture: Frontend → Backend → Database
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary-hover)' }}>
        <div className="card-title">🚧 Future Roadmap</div>
        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          {['Leave & attendance management', 'Role-based dashboards', 'API integration', 'Performance optimization'].map(item => (
            <div key={item} className="flex gap-sm flex-center">
              <span style={{ color: 'var(--primary)' }}>●</span>
              <span className="text-sm fw-7">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
