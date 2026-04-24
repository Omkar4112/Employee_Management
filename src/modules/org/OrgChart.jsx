import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { buildHierarchy } from '../../engines/InsightsEngine';
import { calcUtilization, utilizationStatus } from '../../engines/ResourceEngine';
import { calcAttendancePct } from '../../engines/AttendanceEngine';

function avatarColor(name = '') {
  const colors = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6','#14b8a6'];
  return colors[name.charCodeAt(0) % colors.length];
}

function OrgNode({ node, state, depth = 0, selected, onSelect }) {
  const [open, setOpen] = useState(depth < 2);
  const util = calcUtilization(node.id, state.projects);
  const uStat = utilizationStatus(util);
  const att = calcAttendancePct(node.id, state.attendance);
  const hasChildren = node.children?.length > 0;

  return (
    <div className="org-node">
      <div
        className={`org-node-item ${selected?.id === node.id ? 'selected' : ''}`}
        onClick={() => onSelect(node)}
        style={{ marginLeft: depth > 0 ? '0.5rem' : 0 }}
      >
        {hasChildren ? (
          <button className="org-expand-btn" onClick={e => { e.stopPropagation(); setOpen(o => !o); }}>
            {open ? '−' : '+'}
          </button>
        ) : <span style={{ width: 22, flexShrink: 0 }} />}

        <div className="avatar avatar-sm" style={{ background: avatarColor(node.name), color: '#fff', flexShrink: 0 }}>{node.avatar}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="fw-6 text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</div>
          <div className="text-xs text-muted">{node.role}</div>
        </div>

        <div className="flex gap-sm" style={{ flexShrink: 0 }}>
          <span className="badge" style={{ background: uStat.bg, color: uStat.color, fontSize: '0.68rem' }}>{util}%</span>
          <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{att}%</span>
        </div>
      </div>

      {hasChildren && open && (
        <div className="org-children">
          {node.children.map(child => (
            <OrgNode key={child.id} node={child} state={state} depth={depth + 1} selected={selected} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const { state } = useApp();
  const [selected, setSelected] = useState(null);

  const tree = useMemo(() => buildHierarchy(state.employees), [state.employees]);

  const util = selected ? calcUtilization(selected.id, state.projects) : 0;
  const uStat = selected ? utilizationStatus(util) : null;
  const att = selected ? calcAttendancePct(selected.id, state.attendance) : 0;
  const mgr = selected?.managerId ? state.employees.find(e => e.id === selected.managerId) : null;
  const reports = selected ? state.employees.filter(e => e.managerId === selected.id) : [];
  const projects = selected ? state.projects.filter(p => p.assignments.some(a => a.employeeId === selected.id)) : [];

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Org Hierarchy</h1>
          <p>Visual organizational tree. Click any node to inspect details.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card">
          <div className="flex-between mb-2">
            <span className="card-title" style={{ marginBottom: 0 }}>🌳 Organization Chart</span>
            <span className="badge badge-neutral text-xs">{state.employees.length} employees</span>
          </div>
          <div className="org-tree" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {tree.length === 0 ? (
              <p className="text-muted text-sm">No hierarchy data. Add employees with manager relationships.</p>
            ) : tree.map(root => (
              <OrgNode key={root.id} node={root} state={state} depth={0} selected={selected} onSelect={setSelected} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1.5rem' }}>
          {selected ? (
            <>
              <div className="card">
                <div className="flex gap-sm flex-center mb-2">
                  <div className="avatar avatar-lg" style={{ background: avatarColor(selected.name), color: '#fff' }}>{selected.avatar}</div>
                  <div>
                    <div className="fw-7" style={{ fontSize: '1.1rem' }}>{selected.name}</div>
                    <div className="text-muted text-sm">{selected.role}</div>
                    <span className={`badge badge-${selected.department === 'Engineering' ? 'primary' : selected.department === 'Design' ? 'info' : 'neutral'} mt-1`}>{selected.department}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Performance', value: `${selected.performance}/10`, color: selected.performance >= 9 ? 'var(--success)' : 'var(--warning)' },
                    { label: 'Salary', value: `$${Number(selected.salary).toLocaleString()}` },
                    { label: 'Joined', value: new Date(selected.joinDate).toLocaleDateString() },
                    { label: 'Direct Reports', value: reports.length },
                  ].map(r => (
                    <div key={r.label} style={{ background: 'var(--bg-4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <div className="text-xs text-muted">{r.label}</div>
                      <div className="fw-7" style={{ color: r.color, marginTop: '0.25rem' }}>{r.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <div className="flex-between text-xs text-muted mb-1"><span>Utilization</span><span style={{ color: uStat.color, fontWeight: 700 }}>{util}%</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(util, 100)}%`, background: uStat.color }} /></div>
                  <span className="badge mt-1" style={{ background: uStat.bg, color: uStat.color, fontSize: '0.7rem' }}>{uStat.label}</span>
                </div>

                <div>
                  <div className="flex-between text-xs text-muted mb-1"><span>Attendance</span><span className="fw-7">{att}%</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${att}%`, background: att >= 90 ? 'var(--success)' : att >= 80 ? 'var(--warning)' : 'var(--danger)' }} /></div>
                </div>
              </div>

              {mgr && (
                <div className="card">
                  <div className="card-title">Reports To</div>
                  <div className="flex gap-sm flex-center">
                    <div className="avatar avatar-sm" style={{ background: avatarColor(mgr.name), color: '#fff' }}>{mgr.avatar}</div>
                    <div><div className="fw-6 text-sm">{mgr.name}</div><div className="text-xs text-muted">{mgr.role}</div></div>
                  </div>
                </div>
              )}

              {reports.length > 0 && (
                <div className="card">
                  <div className="card-title">Direct Reports ({reports.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {reports.map(r => (
                      <div key={r.id} className="flex gap-sm flex-center" style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}>
                        <div className="avatar avatar-sm" style={{ background: avatarColor(r.name), color: '#fff' }}>{r.avatar}</div>
                        <div style={{ flex: 1 }}><div className="fw-6 text-sm">{r.name}</div><div className="text-xs text-muted">{r.role}</div></div>
                        <span className="badge badge-primary text-xs">{calcUtilization(r.id, state.projects)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div className="card">
                  <div className="card-title">Projects ({projects.length})</div>
                  {projects.map(p => {
                    const alloc = p.assignments.find(a => a.employeeId === selected.id)?.allocation;
                    return (
                      <div key={p.id} className="flex-between text-sm mb-1">
                        <span>{p.name}</span>
                        <span className="badge badge-primary">{alloc}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👆</div>
              <div className="fw-6">Click a node</div>
              <div className="text-muted text-sm mt-1">Select any employee in the tree to see their full profile, reports, and projects.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
