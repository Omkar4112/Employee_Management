import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { calcAttendancePct, isOnLeaveToday, detectLeaveConflict, calcLeaveBalance } from '../../engines/AttendanceEngine';

function LeaveModal({ onClose }) {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({ employeeId: '', type: 'Annual', startDate: '', endDate: '', reason: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const [conflict, setConflict] = useState(false);

  const checkConflict = () => {
    if (form.employeeId && form.startDate && form.endDate) {
      const hasConflict = detectLeaveConflict({ ...form }, state.leaves);
      setConflict(hasConflict);
    }
  };

  const submit = ev => {
    ev.preventDefault();
    if (conflict) return;
    dispatch({ type: 'APPLY_LEAVE', payload: { ...form, id: `l${Date.now()}`, status: 'Pending' } });
    onClose();
  };

  const emp = form.employeeId ? state.employees.find(e => e.id === form.employeeId) : null;
  const balance = emp ? calcLeaveBalance(emp.id, state.leaves) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Apply for Leave</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select required className="form-control" value={form.employeeId} onChange={set('employeeId')} onBlur={checkConflict}>
              <option value="">— Select Employee —</option>
              {state.employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            {balance !== null && <span className="text-xs text-muted mt-1">Leave balance: <strong>{balance}</strong> days remaining</span>}
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-control" value={form.type} onChange={set('type')}>
                {['Annual', 'Sick', 'Unpaid', 'Emergency', 'Maternity'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input required type="date" className="form-control" value={form.startDate} onChange={set('startDate')} onBlur={checkConflict} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input required type="date" className="form-control" value={form.endDate} onChange={set('endDate')} onBlur={checkConflict} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea className="form-control" rows={2} value={form.reason} onChange={set('reason')} placeholder="Optional reason..." />
          </div>
          {conflict && (
            <div className="insight-card insight-critical" style={{ padding: '0.75rem 1rem' }}>
              <span className="insight-title" style={{ color: 'var(--danger)' }}>⚠️ Leave Conflict Detected</span>
              <p className="insight-msg">This employee already has an approved/pending leave overlapping with the selected dates.</p>
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={conflict}>Submit Leave</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeaveAttendance() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('leave');
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const pendingLeaves = state.leaves.filter(l => l.status === 'Pending');
  const approvedLeaves = state.leaves.filter(l => l.status === 'Approved');

  const updateLeaveStatus = (id, status) => dispatch({ type: 'UPDATE_LEAVE_STATUS', payload: { id, status } });

  const updateAttendance = (employeeId, field, value) => {
    const existing = state.attendance.find(a => a.employeeId === employeeId) || { employeeId, presentDays: 0, totalDays: 20 };
    dispatch({ type: 'UPDATE_ATTENDANCE', payload: { ...existing, [field]: Number(value) } });
  };

  const leaveStatusColor = { Approved: 'badge-success', Pending: 'badge-warning', Rejected: 'badge-danger' };
  const leaveTypeColor = { Annual: 'badge-info', Sick: 'badge-warning', Unpaid: 'badge-neutral', Emergency: 'badge-danger', Maternity: 'badge-primary' };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Attendance & Leave</h1>
          <p>Track daily attendance and manage leave requests.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowLeaveModal(true)}>+ Apply Leave</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card-label">Pending Requests</span>
          <span className="stat-card-value" style={{ color: 'var(--warning)' }}>{pendingLeaves.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Approved This Cycle</span>
          <span className="stat-card-value" style={{ color: 'var(--success)' }}>{approvedLeaves.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">On Leave Today</span>
          <span className="stat-card-value" style={{ color: 'var(--danger)' }}>
            {state.employees.filter(e => isOnLeaveToday(e.id, state.leaves)).length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Team Avg Attendance</span>
          <span className="stat-card-value" style={{ color: 'var(--primary)' }}>
            {state.employees.length ? Math.round(state.employees.reduce((s, e) => s + calcAttendancePct(e.id, state.attendance), 0) / state.employees.length) : 0}%
          </span>
        </div>
      </div>

      <div className="flex gap-sm mb-2">
        {['leave', 'attendance'].map(t => (
          <button key={t} className={`btn ${activeTab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>
            {t === 'leave' ? '📋 Leave Requests' : '📅 Attendance Records'}
          </button>
        ))}
      </div>

      {activeTab === 'leave' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {state.leaves.length === 0 ? (
                <tr><td colSpan={7}><div className="table-empty">No leave records.</div></td></tr>
              ) : state.leaves.map(leave => {
                const emp = state.employees.find(e => e.id === leave.employeeId);
                const days = leave.startDate && leave.endDate
                  ? Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / 86400000) + 1 : 0;
                return (
                  <tr key={leave.id}>
                    <td className="fw-6">{emp?.name || leave.employeeId}</td>
                    <td><span className={`badge ${leaveTypeColor[leave.type] || 'badge-neutral'}`}>{leave.type}</span></td>
                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>
                    <td>{days}d</td>
                    <td><span className={`badge ${leaveStatusColor[leave.status]}`}>{leave.status}</span></td>
                    <td>
                      {leave.status === 'Pending' ? (
                        <div className="flex gap-sm">
                          <button className="btn btn-success btn-sm" onClick={() => updateLeaveStatus(leave.id, 'Approved')}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateLeaveStatus(leave.id, 'Rejected')}>Reject</button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Employee</th><th>Dept</th><th>Present Days</th><th>Total Days</th><th>Attendance %</th><th>Status</th><th>Edit</th></tr>
            </thead>
            <tbody>
              {state.employees.map(emp => {
                const rec = state.attendance.find(a => a.employeeId === emp.id) || { employeeId: emp.id, presentDays: 0, totalDays: 20 };
                const pct = rec.totalDays > 0 ? Math.round((rec.presentDays / rec.totalDays) * 100) : 0;
                const onLeave = isOnLeaveToday(emp.id, state.leaves);
                return (
                  <tr key={emp.id}>
                    <td><div className="fw-6">{emp.name}</div><div className="text-xs text-muted">{emp.role}</div></td>
                    <td>{emp.department}</td>
                    <td>
                      <input type="number" min="0" max={rec.totalDays} className="form-control" style={{ width: 70 }}
                        defaultValue={rec.presentDays}
                        onBlur={e => updateAttendance(emp.id, 'presentDays', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" min="1" max="31" className="form-control" style={{ width: 70 }}
                        defaultValue={rec.totalDays}
                        onBlur={e => updateAttendance(emp.id, 'totalDays', e.target.value)} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="progress-bar" style={{ width: '60px' }}>
                          <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 90 ? 'var(--success)' : pct >= 80 ? 'var(--warning)' : 'var(--danger)' }} />
                        </div>
                        <span className="fw-7 text-sm" style={{ color: pct >= 90 ? 'var(--success)' : pct >= 80 ? 'var(--warning)' : 'var(--danger)' }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      {onLeave
                        ? <span className="badge badge-warning">On Leave</span>
                        : pct >= 90 ? <span className="badge badge-success">Excellent</span>
                        : pct >= 80 ? <span className="badge badge-warning">Fair</span>
                        : <span className="badge badge-danger">Low</span>}
                    </td>
                    <td><span className="text-xs text-muted">Blur to save</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showLeaveModal && <LeaveModal onClose={() => setShowLeaveModal(false)} />}
    </div>
  );
}
