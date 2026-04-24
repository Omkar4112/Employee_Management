import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../store/AppContext';
import { calcUtilization, utilizationStatus, getEmployeeProjects } from '../../engines/ResourceEngine';
import { calcAttendancePct, isOnLeaveToday } from '../../engines/AttendanceEngine';
import { applyFilters } from '../../engines/InsightsEngine';

const DEPTS = ['Engineering', 'Design', 'Product', 'Executive', 'HR'];
const OPS = ['=', '!=', '>', '>=', '<', '<=', 'contains'];
const FILTER_FIELDS = [
  { value: 'department', label: 'Department' },
  { value: 'role', label: 'Role' },
  { value: 'performance', label: 'Performance' },
  { value: 'salary', label: 'Salary' },
  { value: 'utilization', label: 'Utilization %' },
  { value: 'attendance', label: 'Attendance %' },
];

function avatarColor(name = '') {
  const colors = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6','#14b8a6'];
  return colors[name.charCodeAt(0) % colors.length];
}

function EmployeeModal({ employee, onClose, employees }) {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState(employee || { id: `e${Date.now()}`, name: '', role: '', department: 'Engineering', status: 'Active', salary: '', performance: '', managerId: '', joinDate: new Date().toISOString().slice(0,10), avatar: '' });
  const isEdit = !!employee;
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (ev) => {
    ev.preventDefault();
    const payload = { ...form, salary: Number(form.salary), performance: Number(form.performance), avatar: form.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) };
    dispatch({ type: isEdit ? 'UPDATE_EMPLOYEE' : 'ADD_EMPLOYEE', payload });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Employee' : 'Hire New Employee'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input required className="form-control" value={form.name} onChange={set('name')} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <input required className="form-control" value={form.role} onChange={set('role')} placeholder="Senior Developer" />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select required className="form-control" value={form.department} onChange={set('department')}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select required className="form-control" value={form.status || 'Active'} onChange={set('status')}>
                {['Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Manager</label>
              <select className="form-control" value={form.managerId || ''} onChange={set('managerId')}>
                <option value="">— No Manager (Top-Level) —</option>
                {employees.filter(e => e.id !== form.id).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Salary (USD)</label>
              <input type="number" className="form-control" value={form.salary} onChange={set('salary')} placeholder="100000" />
            </div>
            <div className="form-group">
              <label className="form-label">Performance (0-10)</label>
              <input type="number" min="0" max="10" step="0.1" className="form-control" value={form.performance} onChange={set('performance')} placeholder="8.5" />
            </div>
            <div className="form-group">
              <label className="form-label">Join Date</label>
              <input type="date" className="form-control" value={form.joinDate} onChange={set('joinDate')} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Hire Employee'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeeDetailPanel({ emp, onClose }) {
  const { state } = useApp();
  if (!emp) return null;
  const util = calcUtilization(emp.id, state.projects);
  const uStat = utilizationStatus(util);
  const att = calcAttendancePct(emp.id, state.attendance);
  const onLeave = isOnLeaveToday(emp.id, state.leaves);
  const projects = getEmployeeProjects(emp.id, state.projects);

  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
      <div className="flex-between mb-2">
        <span className="fw-7">Employee Detail</span>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem 0', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
        <div className="avatar avatar-lg" style={{ background: avatarColor(emp.name), color: '#fff' }}>{emp.avatar}</div>
        <div style={{ textAlign: 'center' }}>
          <div className="fw-7" style={{ fontSize: '1.1rem' }}>{emp.name}</div>
          <div className="text-muted text-sm">{emp.role}</div>
          <div style={{ marginTop: '0.5rem' }}>
            <span className={`badge badge-${emp.department === 'Engineering' ? 'primary' : emp.department === 'Design' ? 'info' : 'neutral'}`}>{emp.department}</span>
            <span className={`badge ${emp.status === 'Inactive' ? 'badge-danger' : 'badge-success'}`} style={{ marginLeft: '0.5rem' }}>{emp.status || 'Active'}</span>
            {onLeave && <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>On Leave</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[
          { label: 'Performance', value: `${emp.performance}/10`, color: emp.performance >= 9 ? 'var(--success)' : emp.performance >= 7 ? 'var(--warning)' : 'var(--danger)' },
          ...(canSeeSalary ? [{ label: 'Salary', value: `$${Number(emp.salary).toLocaleString()}` }] : []),
          { label: 'Join Date', value: new Date(emp.joinDate).toLocaleDateString() },
        ].map(r => (
          <div key={r.label} className="flex-between">
            <span className="text-muted text-xs">{r.label}</span>
            <span className="fw-6 text-sm" style={{ color: r.color }}>{r.value}</span>
          </div>
        ))}
        <div>
          <span className="text-muted text-xs">Utilization</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${Math.min(util, 100)}%`, background: uStat.color }} />
            </div>
            <span style={{ color: uStat.color, fontWeight: 700, fontSize: '0.8rem' }}>{util}%</span>
          </div>
          <span className="badge mt-1" style={{ background: uStat.bg, color: uStat.color, fontSize: '0.7rem' }}>{uStat.label}</span>
        </div>
        <div>
          <span className="text-muted text-xs">Attendance</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${att}%`, background: att >= 90 ? 'var(--success)' : att >= 80 ? 'var(--warning)' : 'var(--danger)' }} />
            </div>
            <span className="fw-7 text-sm">{att}%</span>
          </div>
        </div>
        {projects.length > 0 && (
          <div>
            <span className="text-muted text-xs">Assigned Projects</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.5rem' }}>
              {projects.map(p => {
                const alloc = p.assignments.find(a => a.employeeId === emp.id)?.allocation;
                return <div key={p.id} className="flex-between text-xs"><span>{p.name}</span><span className="badge badge-primary">{alloc}%</span></div>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeeList() {
  const { state, dispatch } = useApp();
  const [modal, setModal] = useState(null); // null | 'add' | employee_obj
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState([]);
  const [filterForm, setFilterForm] = useState({ field: 'department', op: '=', value: '' });
  const [sort, setSort] = useState({ key: 'name', dir: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const userRole = state.auth.user.role;
  const canManage = userRole === 'ADMIN' || userRole === 'HR';
  const canSeeSalary = userRole === 'ADMIN' || userRole === 'HR';

  const addFilter = () => {
    if (!filterForm.value.trim()) return;
    setFilters(f => [...f, { ...filterForm, id: Date.now() }]);
    setFilterForm(f => ({ ...f, value: '' }));
    setCurrentPage(1);
  };

  const removeFilter = id => {
    setFilters(f => f.filter(x => x.id !== id));
    setCurrentPage(1);
  };

  const displayed = useMemo(() => {
    let list = applyFilters(state.employees, filters, state);
    list = [...list].sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (sort.key === 'utilization') { av = calcUtilization(a.id, state.projects); bv = calcUtilization(b.id, state.projects); }
      if (sort.key === 'attendance') { av = calcAttendancePct(a.id, state.attendance); bv = calcAttendancePct(b.id, state.attendance); }
      if (typeof av === 'string') return av.localeCompare(bv) * sort.dir;
      return (av - bv) * sort.dir;
    });
    return list;
  }, [state, filters, sort]);

  const toggleSort = key => setSort(s => s.key === key ? { key, dir: -s.dir } : { key, dir: 1 });
  const sortIcon = key => sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';

  const handleDelete = emp => {
    if (window.confirm(`Delete ${emp.name}? This will cascade remove all their project assignments and leaves.`)) {
      dispatch({ type: 'DELETE_EMPLOYEE', payload: emp.id });
      if (selected?.id === emp.id) setSelected(null);
    }
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Employee Directory</h1>
          <p>{state.employees.length} employees · filter, sort, and manage workforce data.</p>
        </div>
        {canManage && <button className="btn btn-primary" onClick={() => setModal('add')}>+ Hire Employee</button>}
      </div>

      {/* Filter Bar */}
      <div className="card mb-2">
        <div className="card-title" style={{ marginBottom: '1rem' }}>🔍 Advanced Filters (AND logic)</div>
        <div className="flex gap-sm" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ minWidth: 140 }}>
            <label className="form-label">Field</label>
            <select className="form-control" value={filterForm.field} onChange={e => setFilterForm(f => ({ ...f, field: e.target.value }))}>
              {FILTER_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ minWidth: 80 }}>
            <label className="form-label">Operator</label>
            <select className="form-control" value={filterForm.op} onChange={e => setFilterForm(f => ({ ...f, op: e.target.value }))}>
              {OPS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ minWidth: 140 }}>
            <label className="form-label">Value</label>
            <input className="form-control" value={filterForm.value} onChange={e => setFilterForm(f => ({ ...f, value: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addFilter()} placeholder="e.g. Engineering" />
          </div>
          <button className="btn btn-primary" onClick={addFilter}>Add Filter</button>
          {filters.length > 0 && <button className="btn btn-ghost" onClick={() => setFilters([])}>Clear All</button>}
        </div>
        {filters.length > 0 && (
          <div className="flex gap-sm mt-1" style={{ flexWrap: 'wrap' }}>
            {filters.map(f => (
              <div key={f.id} className="filter-chip">
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{f.field}</span>
                <span className="text-xs">{f.op}</span>
                <span className="fw-6 text-xs">"{f.value}"</span>
                <button className="filter-chip-remove" onClick={() => removeFilter(f.id)}>✕</button>
              </div>
            ))}
            <span className="text-xs text-muted" style={{ alignSelf: 'center' }}>{displayed.length} result{displayed.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th><button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-2)' }} onClick={() => toggleSort('name')}>Employee{sortIcon('name')}</button></th>
                <th>Department</th>
                <th><button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-2)' }} onClick={() => toggleSort('utilization')}>Utilization{sortIcon('utilization')}</button></th>
                <th><button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-2)' }} onClick={() => toggleSort('attendance')}>Attendance{sortIcon('attendance')}</button></th>
                <th><button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-2)' }} onClick={() => toggleSort('performance')}>Performance{sortIcon('performance')}</button></th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={6}><div className="table-empty">No employees match the current filters.</div></td></tr>
              ) : displayed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(emp => {
                const util = calcUtilization(emp.id, state.projects);
                const uStat = utilizationStatus(util);
                const att = calcAttendancePct(emp.id, state.attendance);
                const onLeave = isOnLeaveToday(emp.id, state.leaves);
                return (
                  <tr key={emp.id} onClick={() => setSelected(s => s?.id === emp.id ? null : emp)} style={{ cursor: 'pointer', opacity: emp.status === 'Inactive' ? 0.6 : 1 }}>
                    <td>
                      <div className="flex gap-sm flex-center">
                        <div className="avatar avatar-sm" style={{ background: avatarColor(emp.name), color: '#fff' }}>{emp.avatar}</div>
                        <div>
                          <div className="fw-6" style={{ fontSize: '0.875rem' }}>{emp.name} {emp.status === 'Inactive' && <span className="text-xs text-muted">(Inactive)</span>}</div>
                          <div className="text-xs text-muted">{emp.role}</div>
                        </div>
                        {onLeave && <span className="badge badge-warning" style={{ fontSize: '0.65rem', marginLeft: '0.25rem' }}>Leave</span>}
                      </div>
                    </td>
                    <td><span className={`badge badge-neutral dept-${emp.department}`}>{emp.department}</span></td>
                    <td>
                      <div className="flex gap-sm flex-center">
                        <div className="progress-bar" style={{ width: '60px' }}>
                          <div className="progress-fill" style={{ width: `${Math.min(util, 100)}%`, background: uStat.color }} />
                        </div>
                        <span style={{ color: uStat.color, fontWeight: 700, fontSize: '0.8rem' }}>{util}%</span>
                      </div>
                      <span className="badge" style={{ background: uStat.bg, color: uStat.color, fontSize: '0.68rem', marginTop: '0.25rem' }}>{uStat.label}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: att >= 90 ? 'var(--success)' : att >= 80 ? 'var(--warning)' : 'var(--danger)' }}>{att}%</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: emp.performance >= 9 ? 'var(--success)' : emp.performance >= 7 ? 'var(--warning)' : 'var(--danger)' }}>{emp.performance}/10</span>
                    </td>
                    {canManage && (
                      <td onClick={e => e.stopPropagation()}>
                        <div className="flex gap-sm">
                          <button className="btn btn-ghost btn-sm" onClick={() => setModal(emp)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayed.length > itemsPerPage && (
          <div className="flex-between mt-1" style={{ padding: '0.5rem 1rem' }}>
            <span className="text-sm text-muted">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, displayed.length)} of {displayed.length}</span>
            <div className="flex gap-sm">
              <button className="btn btn-ghost btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
              <button className="btn btn-ghost btn-sm" disabled={currentPage * itemsPerPage >= displayed.length} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}

        {selected && <EmployeeDetailPanel emp={selected} onClose={() => setSelected(null)} />}
      </div>

      {modal && (
        <EmployeeModal employee={modal === 'add' ? null : modal} employees={state.employees} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
