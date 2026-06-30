// ============================================================
// components/common/Table.jsx
// Reusable data table with built-in styling, empty states, and loading states.
// ============================================================

import React from 'react';

/**
 * Reusable Table Component.
 *
 * Props:
 * - columns {Array}     - Array of objects: { key, label, render(item), sortable }
 * - data {Array}        - Array of data objects
 * - keyExtractor {Func} - Function to extract unique key for rows (e.g. item => item.id)
 * - sort {Object}       - Current sort state: { key, direction: 'asc'|'desc' }
 * - onSort {Func}       - Called when a sortable column header is clicked
 * - isLoading {boolean} - Shows loading state
 * - emptyMessage {str}  - Message to display when data is empty
 */
export default function Table({
  columns,
  data,
  keyExtractor,
  sort,
  onSort,
  isLoading = false,
  emptyMessage = 'No data found.',
}) {
  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      borderRadius: '0.5rem',
      border: '1px solid var(--border)',
      background: 'var(--surface)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{
            background: 'var(--background)',
            borderBottom: '1px solid var(--border)'
          }}>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort && onSort(col.key)}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-2)',
                  cursor: col.sortable ? 'pointer' : 'default',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {col.label}
                  {col.sortable && sort?.key === col.key && (
                    <span style={{ fontSize: '0.7rem' }}>
                      {sort.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-2)' }}>
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-2)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                style={{
                  borderBottom: index !== data.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--background)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
