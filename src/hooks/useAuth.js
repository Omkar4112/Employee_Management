// ============================================================
// hooks/useAuth.js
// Custom hook for auth state and permission checks.
//
// Components call `useAuth()` instead of reading state.auth directly.
// This abstracts the auth logic and makes role checks very clean.
// ============================================================

import { useCallback } from 'react';
import { useApp } from '../store/AppContext';
import { ROUTE_PERMISSIONS } from '../constants';

/**
 * useAuth — provides the current user, auth status, and permission utilities.
 *
 * @returns {{
 *   user: Object|null,
 *   isAuthenticated: boolean,
 *   role: string|null,
 *   isAdmin: boolean,
 *   isHR: boolean,
 *   isEmployee: boolean,
 *   canAccess: (routeId: string) => boolean,
 *   hasRole: (...roles: string[]) => boolean,
 *   login: (payload) => void,
 *   logout: () => void,
 * }}
 */
export function useAuth() {
  const { state, dispatch } = useApp();
  const { user, isAuthenticated } = state.auth;

  const role = user?.role ?? null;
  const isAdmin    = role === 'ADMIN';
  const isHR       = role === 'HR';
  const isEmployee = role === 'EMPLOYEE';

  /**
   * Check if the current user's role is allowed to access a route.
   * @param {string} routeId
   */
  const canAccess = useCallback(
    (routeId) => {
      if (!role) return false;
      const allowedRoles = ROUTE_PERMISSIONS[routeId] ?? [];
      return allowedRoles.includes(role);
    },
    [role]
  );

  /**
   * Check if the current user has one of the given roles.
   * Usage: hasRole('ADMIN', 'HR')
   */
  const hasRole = useCallback(
    (...roles) => roles.includes(role),
    [role]
  );

  const login = useCallback(
    (payload) => dispatch({ type: 'LOGIN', payload }),
    [dispatch]
  );

  const logout = useCallback(
    () => dispatch({ type: 'LOGOUT' }),
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    role,
    isAdmin,
    isHR,
    isEmployee,
    canAccess,
    hasRole,
    login,
    logout,
  };
}
