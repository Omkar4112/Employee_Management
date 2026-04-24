import React, { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { generateInsights } from '../../engines/InsightsEngine';
import { calcUtilization, utilizationStatus, calcTeamUtilizationDistribution } from '../../engines/ResourceEngine';
import { calcAttendancePct } from '../../engines/AttendanceEngine';

// Mini SVG Donut Chart
function DonutChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const segments = [
    { label: 'Optimal', value: data.Optimal, color: '#10b981' },
    { label: 'Overloaded', value: data.Overloaded, color: '#ef4444' },
    { label: 'Underutilized', value: data.Underutilized, color: '#f59e0b' },
  ];
  const r = 52, cx = 60, cy = 60, stroke = 16;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-container">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1c2540" strokeWidth={stroke} />
        {segments.map((seg) => {
          const pct = seg.value / total;
          const dash = pct * circ;
          const el = (
            <circle key={seg.label} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
              strokeWidth={stroke} strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset} strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dasharray 0.5s ease' }}
            />
          );
          offset += dash;
          return el;
        })}
        <text x="60" y="57" textAnchor="middle" fill="#f1f5f9" fontSize="16" fontWeight="800" fontFamily="Outfit">{total}</text>
        <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="Inter">Staff</text>
      </svg>
      <div className="donut-legend">
        {segments.map(s => (
          <div key={s.label} className="donut-legend-item">
            <span className="donut-dot" style={{ background: s.color }} />
            <span className="text-muted text-xs">{s.label}</span>
            <span className="fw-6 text-xs">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal bar chart
function BarChart({ items, color }) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="bar-chart">
      {items.map(item => (
        <div key={item.label} className="bar-row">
          <span className="bar-label">{item.label}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(item.value / max) * 100}%`, background: color || 'var(--primary)' }} />
          </div>
          <span className="bar-value">{item.value}{item.unit || ''}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { state } = useApp();
  const [insightFilter, setInsightFilter] = useState('all');

  const insights = useMemo(() => generateInsights(state), [state]);
  const utilDist = useMemo(() => calcTeamUtilizationDistribution(state.employees, state.projects), [state.employees, state.projects]);

  const stats = useMemo(() => ({
    total: state.employees.length,
    activeProjects: state.projects.filter(p => p.status === 'Active').length,
    avgPerf: state.employees.length ? (state.employees.reduce((s, e) => s + e.performance, 0) / state.employees.length).toFixed(1) : 0,
    avgAtt: state.employees.length ? Math.round(state.employees.reduce((s, e) => s + calcAttendancePct(e.id, state.attendance), 0) / state.employees.length) : 0,
    onLeave: state.leaves.filter(l => l.status === 'Approved' && (() => { const t=new Date(); return t >= new Date(l.startDate) && t <= new Date(l.endDate); })()).length,
    pending: state.leaves.filter(l => l.status === 'Pending').length,
  }), [state]);

  const deptData = useMemo(() => {
    const map = {};
    state.employees.forEach(e => { map[e.department] = (map[e.department] || 0) + 1; });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [state.employees]);

  const attItems = useMemo(() =>
    state.employees.slice(0, 5).map(e => ({ label: e.name.split(' ')[0], value: calcAttendancePct(e.id, state.attendance), unit: '%' })),
    [state]
  );

  const filteredInsights = insights.filter(i => insightFilter === 'all' || i.priority === insightFilter);

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Real-time analytics and system intelligence overview.</p>
        </div>
        <div className="flex gap-sm">
          <span className="badge badge-success">● Live</span>
          <span className="text-xs text-muted" style={{ alignSelf: 'center' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Workforce', value: stats.total, icon: '👥', sub: `${stats.onLeave} on leave today`, color: 'var(--primary)' },
          { label: 'Active Projects', value: stats.activeProjects, icon: '🚀', sub: `${state.projects.filter(p=>p.status==='Planning').length} in planning`, color: 'var(--info)' },
          { label: 'Avg Performance', value: `${stats.avgPerf}/10`, icon: '⭐', sub: `${insights.filter(i=>i.id.startsWith('promotion')).length} promotion candidates`, color: 'var(--success)' },
          { label: 'Avg Attendance', value: `${stats.avgAtt}%`, icon: '📅', sub: `${stats.pending} pending leave requests`, color: 'var(--warning)' },
          { label: 'Overloaded', value: utilDist.Overloaded, icon: '🔴', sub: 'Need task redistribution', color: 'var(--danger)' },
          { label: 'Active Insights', value: insights.length, icon: '🧠', sub: `${insights.filter(i=>i.priority==='critical').length} critical`, color: '#a855f7' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex-between">
              <span className="stat-card-label">{s.label}</span>
              <span className="stat-card-icon">{s.icon}</span>
            </div>
            <span className="stat-card-value" style={{ color: s.color }}>{s.value}</span>
            <span className="stat-card-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="section-grid mb-2">
        {/* Insights Engine */}
        <div className="card">
          <div className="flex-between mb-2">
            <span className="card-title" style={{ marginBottom: 0 }}>🧠 Insights Engine</span>
            <div className="flex gap-sm">
              {['all', 'critical', 'warning', 'success', 'info'].map(f => (
                <button key={f} onClick={() => setInsightFilter(f)}
                  className={`btn btn-sm ${insightFilter === f ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ textTransform: 'capitalize', padding: '0.25rem 0.6rem' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
            {filteredInsights.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-2)' }}>
                {insightFilter === 'all' ? '✅ All systems optimal.' : `No ${insightFilter} insights.`}
              </div>
            ) : filteredInsights.map(ins => (
              <div key={ins.id} className={`insight-card insight-${ins.priority}`}>
                <div className="flex gap-sm flex-center">
                  <span>{ins.icon}</span>
                  <span className="insight-title">{ins.title}</span>
                  <span className={`badge badge-${ins.priority === 'critical' ? 'danger' : ins.priority === 'warning' ? 'warning' : ins.priority === 'success' ? 'success' : 'info'}`} style={{ marginLeft: 'auto', fontSize: '0.68rem' }}>{ins.priority}</span>
                </div>
                <p className="insight-msg">{ins.msg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Utilization Donut */}
        <div className="card">
          <div className="card-title">📊 Utilization Distribution</div>
          <DonutChart data={utilDist} />
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {state.employees.slice(0, 4).map(emp => {
              const u = calcUtilization(emp.id, state.projects);
              const s = utilizationStatus(u);
              return (
                <div key={emp.id} className="flex-between text-xs" style={{ gap: '0.75rem' }}>
                  <span className="text-muted" style={{ width: '80px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.name.split(' ')[0]}</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${Math.min(u, 100)}%`, background: s.color }} />
                  </div>
                  <span style={{ color: s.color, fontWeight: 600, width: '38px', textAlign: 'right' }}>{u}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section-grid-equal">
        {/* Dept Breakdown */}
        <div className="card">
          <div className="card-title">🏢 Department Breakdown</div>
          <BarChart items={deptData} color="var(--primary)" />
        </div>

        {/* Attendance */}
        <div className="card">
          <div className="card-title">📅 Attendance (This Month)</div>
          <BarChart items={attItems} color="var(--success)" />
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card mt-2">
        <div className="card-title">⏱ Recent Activity</div>
        <div className="timeline" style={{ maxHeight: '340px', overflowY: 'auto' }}>
          {state.activityLogs.slice(0, 10).map((log, i) => (
            <div key={log.id} className="timeline-item">
              <div className="timeline-dot">●</div>
              <div className="timeline-content">
                <div className="timeline-action">{log.action}</div>
                <div className="timeline-detail">{log.details}</div>
                <div className="timeline-time">{new Date(log.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
