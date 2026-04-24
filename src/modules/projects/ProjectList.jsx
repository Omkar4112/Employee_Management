import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { calcUtilization, utilizationStatus } from '../../engines/ResourceEngine';

function ProjectModal({ project, employees, onClose }) {
  const { dispatch } = useApp();
  const isEdit = !!project;
  const [form, setForm] = useState(project || { id: `p${Date.now()}`, name: '', status: 'Active', deadline: '', assignments: [] });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = ev => {
    ev.preventDefault();
    dispatch({ type: isEdit ? 'UPDATE_PROJECT' : 'ADD_PROJECT', payload: form });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Project' : 'Create Project'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input required className="form-control" value={form.name} onChange={set('name')} placeholder="Project Phoenix" />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={set('status')}>
                {['Active', 'Planning', 'On Hold', 'Completed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" className="form-control" value={form.deadline} onChange={set('deadline')} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignModal({ project, employees, onClose }) {
  const { state, dispatch } = useApp();
  const [employeeId, setEmployeeId] = useState('');
  const [allocation, setAllocation] = useState(50);

  const unassigned = employees.filter(e => !project.assignments.some(a => a.employeeId === e.id));

  const submit = ev => {
    ev.preventDefault();
    if (!employeeId) return;
    dispatch({ type: 'ASSIGN_TO_PROJECT', payload: { projectId: project.id, employeeId, allocation: Number(allocation) } });
    setEmployeeId(''); setAllocation(50);
  };

  const removeAssignment = empId => dispatch({ type: 'REMOVE_FROM_PROJECT', payload: { projectId: project.id, employeeId: empId } });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Manage Resources — {project.name}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="card" style={{ background: 'var(--bg-4)', border: '1px solid var(--border)', padding: '1rem' }}>
            <div className="card-title" style={{ marginBottom: '1rem' }}>Current Team ({project.assignments.length})</div>
            {project.assignments.length === 0 ? <p className="text-muted text-sm">No one assigned yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {project.assignments.map(a => {
                  const emp = employees.find(e => e.id === a.employeeId);
                  const totalUtil = calcUtilization(emp?.id, state.projects);
                  const s = utilizationStatus(totalUtil);
                  return emp ? (
                    <div key={a.employeeId} className="flex-between" style={{ background: 'var(--bg-3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <span className="fw-6 text-sm">{emp.name}</span>
                        <span className="text-muted text-xs" style={{ marginLeft: '0.5rem' }}>{emp.role}</span>
                      </div>
                      <div className="flex gap-sm flex-center">
                        <span className="badge badge-primary">{a.allocation}% this project</span>
                        <span className="badge" style={{ background: s.bg, color: s.color, fontSize: '0.7rem' }}>{totalUtil}% total</span>
                        <button className="btn btn-danger btn-sm" onClick={() => removeAssignment(a.employeeId)}>Remove</button>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <form onSubmit={submit}>
            <div className="card-title">Assign New Resource</div>
            <div className="flex gap-sm" style={{ alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Employee</label>
                <select required className="form-control" value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
                  <option value="">— Select Employee —</option>
                  {unassigned.map(e => {
                    const util = calcUtilization(e.id, state.projects);
                    const s = utilizationStatus(util);
                    return <option key={e.id} value={e.id}>{e.name} — {util}% ({s.label})</option>;
                  })}
                </select>
              </div>
              <div className="form-group" style={{ width: 140 }}>
                <label className="form-label">Allocation %</label>
                <input type="number" min="1" max="100" className="form-control" value={allocation} onChange={e => setAllocation(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">Assign</button>
            </div>
          </form>

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectList() {
  const { state, dispatch } = useApp();
  const [modal, setModal] = useState(null); // null | 'add' | project
  const [assignModal, setAssignModal] = useState(null);

  const handleDelete = proj => {
    if (window.confirm(`Delete "${proj.name}"?`)) dispatch({ type: 'DELETE_PROJECT', payload: proj.id });
  };

  const statusColor = { Active: 'badge-success', Planning: 'badge-info', 'On Hold': 'badge-warning', Completed: 'badge-neutral' };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Projects & Allocation</h1>
          <p>Manage projects and control resource allocation across your teams.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ New Project</button>
      </div>

      <div className="stats-grid">
        {['Active', 'Planning', 'On Hold', 'Completed'].map(status => (
          <div key={status} className="stat-card">
            <span className="stat-card-label">{status}</span>
            <span className="stat-card-value">{state.projects.filter(p => p.status === status).length}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {state.projects.map(proj => {
          const totalAlloc = proj.assignments.reduce((s, a) => s + a.allocation, 0);
          const teamSize = proj.assignments.length;
          const overloaded = proj.assignments.filter(a => calcUtilization(a.employeeId, state.projects) > 80).length;
          const daysLeft = proj.deadline ? Math.ceil((new Date(proj.deadline) - new Date()) / 86400000) : null;

          return (
            <div key={proj.id} className="card">
              <div className="flex-between">
                <div className="card-title" style={{ marginBottom: 0 }}>{proj.name}</div>
                <span className={`badge ${statusColor[proj.status] || 'badge-neutral'}`}>{proj.status}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1.25rem 0' }}>
                <div style={{ background: 'var(--bg-4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div className="fw-7" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{teamSize}</div>
                  <div className="text-muted text-xs">Team Members</div>
                </div>
                <div style={{ background: 'var(--bg-4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div className="fw-7" style={{ fontSize: '1.5rem', color: daysLeft < 30 ? 'var(--danger)' : 'var(--success)' }}>{daysLeft !== null ? `${daysLeft}d` : '—'}</div>
                  <div className="text-muted text-xs">Days Left</div>
                </div>
              </div>

              {proj.assignments.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  {proj.assignments.map(a => {
                    const emp = state.employees.find(e => e.id === a.employeeId);
                    if (!emp) return null;
                    const totalUtil = calcUtilization(emp.id, state.projects);
                    const s = utilizationStatus(totalUtil);
                    return (
                      <div key={a.employeeId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{emp.avatar}</div>
                        <span className="text-sm" style={{ flex: 1 }}>{emp.name}</span>
                        <span className="text-xs fw-6">{a.allocation}%</span>
                        <div className="progress-bar" style={{ width: '50px' }}>
                          <div className="progress-fill" style={{ width: `${Math.min(totalUtil, 100)}%`, background: s.color }} />
                        </div>
                      </div>
                    );
                  })}
                  {overloaded > 0 && <div className="badge badge-danger mt-1">⚠️ {overloaded} member{overloaded > 1 ? 's' : ''} overloaded</div>}
                </div>
              )}

              <div className="flex gap-sm" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setAssignModal(proj)}>Manage Resources</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal(proj)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(proj)}>Delete</button>
              </div>
            </div>
          );
        })}

        {state.projects.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-2)' }}>
            No projects found. Create your first one!
          </div>
        )}
      </div>

      {modal && <ProjectModal project={modal === 'add' ? null : modal} employees={state.employees} onClose={() => setModal(null)} />}
      {assignModal && <AssignModal project={assignModal} employees={state.employees} onClose={() => setAssignModal(null)} />}
    </div>
  );
}
