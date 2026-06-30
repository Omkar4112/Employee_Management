// ============================================================
// hooks/useEmployees.js
// Custom hook for employee data with filtering, sorting, pagination.
//
// WHY CUSTOM HOOKS?
// They extract complex stateful logic OUT of components.
// EmployeeList.jsx becomes much cleaner — it just calls this hook.
// The hook is also reusable in other components (e.g., OrgChart).
// ============================================================

import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { filterEmployees, sortByKey, paginate } from '../utils/helpers';
import { DEFAULT_PAGE_SIZE } from '../constants';

/**
 * useEmployees — provides a filtered, sorted, paginated view of employees
 * from global state, along with state setters for all controls.
 *
 * @returns {{
 *   employees: Array,       — the full unfiltered list
 *   filtered: Array,        — after filters applied
 *   paginated: Array,       — the current page's data
 *   totalPages: number,
 *   totalItems: number,
 *   currentPage: number,
 *   filters: Object,
 *   setFilters: Function,
 *   sort: { key, direction },
 *   setSort: Function,
 *   page: number,
 *   setPage: Function,
 *   pageSize: number,
 *   setPageSize: Function,
 * }}
 */
export function useEmployees() {
  const { state } = useApp();
  const employees = state.employees;

  // ── Filter state ──────────────────────────────────────────
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    minPerformance: 0,
  });

  // ── Sort state ────────────────────────────────────────────
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' });

  // ── Pagination state ──────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ── Derived: filtered + sorted list (memoized) ─────────────
  // useMemo ensures this expensive computation only re-runs when
  // employees, filters, or sort actually change — not on every render.
  const filtered = useMemo(() => {
    const result = filterEmployees(employees, filters);
    return result.sort(sortByKey(sort.key, sort.direction));
  }, [employees, filters, sort]);

  // ── Derived: paginated slice ───────────────────────────────
  const { items: paginated, totalPages, totalItems, currentPage } = useMemo(
    () => paginate(filtered, page, pageSize),
    [filtered, page, pageSize]
  );

  // Reset to page 1 whenever filters change
  function updateFilters(newFilters) {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }

  // Toggle sort — if same column, flip direction; else sort asc by new column
  function updateSort(key) {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  return {
    employees,
    filtered,
    paginated,
    totalPages,
    totalItems,
    currentPage,
    filters,
    setFilters: updateFilters,
    sort,
    setSort: updateSort,
    page,
    setPage,
    pageSize,
    setPageSize,
  };
}
