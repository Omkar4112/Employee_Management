import React, { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { generateInsights } from '../../engines/InsightsEngine';
import { calcUtilization, utilizationStatus, calcTeamUtilizationDistribution } from '../../engines/ResourceEngine';
import { calcAttendancePct } from '../../engines/AttendanceEngine';

function MiniBarChart({ items, colorFn }) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="bar-chart">
      {items.map(item => (
        <div key={item.label} className="bar-row">
          <span className="bar-label">{item.label}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(item.value / max) * 100}%`, background: colorFn ? colorFn(item.value) : 'var(--primary)' }} />
          </div>
          <span className="bar-value">{item.value}{item.unit || ''}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { state } = useApp();
  const insights = useMemo(() => generateInsights(state), [state]);

  const utilDist = useMemo(() => calcTeamUtilizationDistribution(state.employees, state.projects), [state]);

  const perfData = useMemo(() =>
    [...state.employees].sort((a, b) => b.performance - a.performance).map(e => ({ label: e.name.split(' ')[0], value: e.performance, unit: '/10' })),
    [state.employees]
  );

  const attData = useMemo(() =>
    state.employees.map(e => ({ label: e.name.split(' ')[0], value: calcAttendancePct(e.id, state.attendance), unit: '%', emp: e }))
      .sort((a, b) => b.value - a.value),
    [state]
  );

  const utilData = useMemo(() =>
    state.employees.map(e => ({ label: e.name.split(' ')[0], value: calcUtilization(e.id, state.projects), unit: '%', emp: e }))
      .sort((a, b) => b.value - a.value),
    [state]
  );

  const deptPerf = useMemo(() => {
    const map = {};
    state.employees.forEach(e => {
      if (!map[e.department]) map[e.department] = { total: 0, count: 0 };
      map[e.department].total += e.performance;
      map[e.department].count++;
    });
    return Object.entries(map).map(([label, v]) => ({ label, value: parseFloat((v.total / v.count).toFixed(1)), unit: '/10' })).sort((a, b) => b.value - a.value);
  }, [state.employees]);

  const salaryByDept = useMemo(() => {
    const map = {};
    state.employees.forEach(e => {
      if (!map[e.department]) map[e.department] = 0;
      map[e.department] += e.salary;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value: Math.round(value / 1000), unit: 'k' })).sort((a, b) => b.value - a.value);
  }, [state.employees]);

  const totalSalary = state.employees.reduce((s, e) => s + (e.salary || 0), 0);
  const avgUtil = state.employees.length ? Math.round(state.employees.reduce((s, e) => s + calcUtilization(e.id, state.projects), 0) / state.employees.length) : 0;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Analytics</h1>
          <p>Aggregate workforce intelligence and trend analysis.</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Payroll', value: `$${(totalSalary / 1000).toFixed(0)}k`, icon: '💰', color: 'var(--success)' },
          { label: 'Avg Utilization', value: `${avgUtil}%`, icon: '⚙️', color: utilizationStatus(avgUtil).color },
          { label: 'Critical Insights', value: insights.filter(i => i.priority === 'critical').length, icon: '🔴', color: 'var(--danger)' },
          { label: 'Promo Candidates', value: insights.filter(i => i.id.startsWith('promotion')).length, icon: '🏆', color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex-between">
              <span className="stat-card-label">{s.label}</span>
              <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
            </div>
            <span className="stat-card-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="section-grid-equal mb-2">
        <div className="card">
          <div className="card-title">🏆 Performance by Employee</div>
          <MiniBarChart items={perfData} colorFn={v => v >= 9 ? 'var(--success)' : v >= 7 ? 'var(--warning)' : 'var(--danger)'} />
        </div>
        <div className="card">
          <div className="card-title">📅 Attendance by Employee</div>
          <MiniBarChart items={attData} colorFn={v => v >= 90 ? 'var(--success)' : v >= 80 ? 'var(--warning)' : 'var(--danger)'} />
        </div>
      </div>

      <div className="section-grid-equal mb-2">
        <div className="card">
          <div className="card-title">⚙️ Utilization by Employee</div>
          <MiniBarChart items={utilData} colorFn={v => v > 80 ? 'var(--danger)' : v >= 40 ? 'var(--success)' : 'var(--warning)'} />
        </div>
        <div className="card">
          <div className="card-title">⭐ Avg Performance by Department</div>
          <MiniBarChart items={deptPerf} colorFn={() => 'var(--primary)'} />
        </div>
      </div>

      <div className="section-grid-equal mb-2">
        <div className="card">
          <div className="card-title">💰 Payroll by Department (K)</div>
          <MiniBarChart items={salaryByDept} colorFn={() => 'var(--info)'} />
        </div>

        <div className="card">
          <div className="card-title">📊 Utilization Distribution</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            {[
              { label: 'Underutilized', key: 'Underutilized', color: 'var(--warning)', icon: '🟡' },
              { label: 'Optimal', key: 'Optimal', color: 'var(--success)', icon: '🟢' },
              { label: 'Overloaded', key: 'Overloaded', color: 'var(--danger)', icon: '🔴' },
            ].map(d => (
              <div key={d.key} style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-4)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{d.icon}</div>
                <div className="fw-7" style={{ fontSize: '2rem', color: d.color }}>{utilDist[d.key] || 0}</div>
                <div className="text-xs text-muted">{d.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Active Projects', value: state.projects.filter(p => p.status === 'Active').length, total: state.projects.length },
              { label: 'Pending Leaves', value: state.leaves.filter(l => l.status === 'Pending').length, total: state.leaves.length },
              { label: 'Top Performers (≥9)', value: state.employees.filter(e => e.performance >= 9).length, total: state.employees.length },
            ].map(r => (
              <div key={r.label}>
                <div className="flex-between text-xs text-muted mb-1"><span>{r.label}</span><span className="fw-6">{r.value}/{r.total}</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${r.total > 0 ? (r.value / r.total) * 100 : 0}%`, background: 'var(--primary)' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Summary Table */}
      <div className="card">
        <div className="card-title">🧠 All Active Insights ({insights.length})</div>
        <div className="table-wrap" style={{ border: 'none', background: 'transparent' }}>
          <table>
            <thead><tr><th>Priority</th><th>Employee</th><th>Insight</th><th>Detail</th></tr></thead>
            <tbody>
              {insights.length === 0 ? (
                <tr><td colSpan={4}><div className="table-empty">No active insights. System is healthy!</div></td></tr>
              ) : insights.map(ins => (
                <tr key={ins.id}>
                  <td><span className={`badge badge-${ins.priority === 'critical' ? 'danger' : ins.priority === 'warning' ? 'warning' : ins.priority === 'success' ? 'success' : 'info'}`}>{ins.icon} {ins.priority}</span></td>
                  <td className="fw-6">{ins.employeeName}</td>
                  <td className="fw-6">{ins.title}</td>
                  <td className="text-muted text-sm">{ins.msg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
