// ============================================================
// utils/helpers.js
// Pure utility functions — no side effects, no imports from app
// These are generic helpers used across multiple components
// ============================================================

import { PERFORMANCE, ATTENDANCE } from '../constants';

// ─── Date Utilities ───────────────────────────────────────────

/**
 * Format an ISO date string to a human-readable format.
 * @param {string} isoString - e.g. "2024-03-15"
 * @returns {string} - e.g. "Mar 15, 2024"
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate the number of days between two date strings.
 * @param {string} startDate
 * @param {string} endDate
 * @returns {number}
 */
export function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusive
}

/**
 * Check if two date ranges overlap.
 * @returns {boolean}
 */
export function datesOverlap(start1, end1, start2, end2) {
  return new Date(start1) <= new Date(end2) && new Date(end1) >= new Date(start2);
}

/**
 * Get a relative time string (e.g., "3 minutes ago").
 * @param {string} isoString
 * @returns {string}
 */
export function timeAgo(isoString) {
  const now = Date.now();
  const past = new Date(isoString).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60)  return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

// ─── Number / Currency Utilities ──────────────────────────────

/**
 * Format a number as currency (USD).
 * @param {number} value
 * @returns {string} - e.g. "$120,000"
 */
export function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as a percentage.
 * @param {number} value - e.g. 95.4
 * @returns {string} - e.g. "95.4%"
 */
export function formatPercent(value, decimals = 1) {
  if (value == null) return '—';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate average of an array of numbers.
 * @param {number[]} arr
 * @returns {number}
 */
export function average(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

// ─── Performance / Attendance Helpers ─────────────────────────

/**
 * Get the performance label and color based on a score.
 * @param {number} score - 0 to 10
 * @returns {{ label: string, color: string }}
 */
export function getPerformanceMeta(score) {
  if (score >= PERFORMANCE.EXCELLENT.min) return PERFORMANCE.EXCELLENT;
  if (score >= PERFORMANCE.GOOD.min)      return PERFORMANCE.GOOD;
  if (score >= PERFORMANCE.AVERAGE.min)   return PERFORMANCE.AVERAGE;
  return PERFORMANCE.POOR;
}

/**
 * Get attendance status meta (label + badge class) based on percentage.
 * @param {number} percent
 * @returns {{ label: string, badge: string }}
 */
export function getAttendanceMeta(percent) {
  if (percent >= ATTENDANCE.EXCELLENT.min) return ATTENDANCE.EXCELLENT;
  if (percent >= ATTENDANCE.FAIR.min)      return ATTENDANCE.FAIR;
  return ATTENDANCE.LOW;
}

/**
 * Calculate attendance percentage from present and total days.
 */
export function calcAttendancePercent(presentDays, totalDays) {
  if (!totalDays || totalDays === 0) return 0;
  return Math.round((presentDays / totalDays) * 100 * 10) / 10; // 1 decimal
}

// ─── String Utilities ─────────────────────────────────────────

/**
 * Get initials from a full name.
 * @param {string} name - e.g. "John Doe"
 * @returns {string} - e.g. "JD"
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ─── ID Generation ────────────────────────────────────────────

/**
 * Generate a simple unique ID (for client-side only, not production).
 * @param {string} prefix - e.g. 'emp', 'leave'
 * @returns {string}
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Sorting ──────────────────────────────────────────────────

/**
 * Generic sort comparator for arrays of objects.
 * @param {string} key - The property key to sort by
 * @param {'asc'|'desc'} direction
 * @returns {function} - Comparator function for Array.sort()
 */
export function sortByKey(key, direction = 'asc') {
  return (a, b) => {
    const valA = a[key];
    const valB = b[key];
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (typeof valA === 'string') {
      return direction === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return direction === 'asc' ? valA - valB : valB - valA;
  };
}

// ─── Filtering ────────────────────────────────────────────────

/**
 * Multi-condition filter for employee arrays.
 * @param {Array} employees
 * @param {{ search, department, status, minPerformance }} filters
 * @returns {Array}
 */
export function filterEmployees(employees, filters) {
  const { search = '', department = '', status = '', minPerformance = 0 } = filters;
  return employees.filter(emp => {
    const matchesSearch = !search ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !department || emp.department === department;
    const matchesStatus = !status || emp.status === status;
    const matchesPerf = (emp.performance ?? emp.performanceScore ?? 0) >= minPerformance;
    return matchesSearch && matchesDept && matchesStatus && matchesPerf;
  });
}

// ─── Pagination ───────────────────────────────────────────────

/**
 * Slice an array for a given page.
 * @param {Array} items
 * @param {number} page - 1-indexed
 * @param {number} pageSize
 * @returns {{ items: Array, totalPages: number }}
 */
export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    currentPage: safePage,
    totalItems: items.length,
  };
}
