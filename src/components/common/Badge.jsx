// ============================================================
// components/common/Badge.jsx
// Reusable status badge — used for employee status, leave status,
// performance level, attendance status, etc.
// ============================================================

import React from 'react';

/**
 * Badge component.
 *
 * Props:
 * - label {string}  - Text to display inside the badge
 * - variant {'success'|'warning'|'danger'|'info'|'neutral'} - Color
 * - size {'sm'|'md'} - Font/padding size
 */
export default function Badge({ label, variant = 'neutral', size = 'sm' }) {
  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
    warning: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    danger:  { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
    info:    { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
    neutral: { bg: 'rgba(100,116,139,0.15)',color: '#64748b', border: 'rgba(100,116,139,0.3)' },
  };

  const sizes = {
    sm: { fontSize: '0.68rem', padding: '0.15rem 0.5rem' },
    md: { fontSize: '0.78rem', padding: '0.25rem 0.75rem' },
  };

  const { bg, color, border } = colors[variant] ?? colors.neutral;
  const { fontSize, padding } = sizes[size] ?? sizes.sm;

  return (
    <span style={{
      display: 'inline-block',
      background: bg,
      color,
      border: `1px solid ${border}`,
      borderRadius: '9999px',
      fontWeight: 600,
      fontSize,
      padding,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── Helper: map common status strings to Badge variants ──────
export function StatusBadge({ status }) {
  const map = {
    // Employee status
    Active:   { label: 'Active',    variant: 'success' },
    Inactive: { label: 'Inactive',  variant: 'neutral' },
    'On Leave':{ label: 'On Leave', variant: 'warning' },
    // Leave status
    Approved: { label: 'Approved',  variant: 'success' },
    Rejected: { label: 'Rejected',  variant: 'danger'  },
    Pending:  { label: 'Pending',   variant: 'warning' },
    // Project status
    Planning: { label: 'Planning',  variant: 'info'    },
    Completed:{ label: 'Completed', variant: 'neutral' },
    'On Hold':{ label: 'On Hold',   variant: 'warning' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'neutral' };
  return <Badge label={label} variant={variant} />;
}

// ── Helper: attendance percentage → Badge ─────────────────────
export function AttendanceBadge({ percent }) {
  if (percent >= 90) return <Badge label="Excellent" variant="success" />;
  if (percent >= 75) return <Badge label="Fair"      variant="warning" />;
  return                   <Badge label="Low"        variant="danger"  />;
}
