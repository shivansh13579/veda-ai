import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { DEMO_PROFILES } from './demoProfiles';
import { ROLES, ROLE_DEFAULT_DASHBOARDS } from '../router/routes';
import { navigate } from '../router';

const AUTH_STORAGE_KEY = 'veda_demo_auth_session';

export const AuthProvider = ({ children }) => {
  // Initialize state from sessionStorage if available
  const [authState, setAuthState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isAuthenticated && parsed?.role) {
          return {
            isAuthenticated: true,
            user: { ...DEMO_PROFILES[parsed.role], ...(parsed.user || {}) },
            role: parsed.role,
          };
        }
      }
    } catch {
      // Session storage inaccessible or corrupted
    }

    return {
      isAuthenticated: false,
      user: null,
      role: null,
    };
  });

  const [authNotice, setAuthNotice] = useState(null);

  // Sync to sessionStorage on state updates
  useEffect(() => {
    try {
      if (authState.isAuthenticated) {
        sessionStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            isAuthenticated: true,
            role: authState.role,
            user: authState.user,
          })
        );
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [authState]);

  /**
   * Log in with a specific role
   * @param {string} targetRole - 'client' | 'astrologer' | 'admin'
   * @param {object} [customDetails] - Optional custom name/email
   */
  const login = useCallback((targetRole = ROLES.CLIENT, customDetails = null) => {
    const baseProfile = DEMO_PROFILES[targetRole] || DEMO_PROFILES[ROLES.CLIENT];
    const user = {
      ...baseProfile,
      ...(customDetails || {}),
      role: targetRole,
    };

    setAuthState({
      isAuthenticated: true,
      user,
      role: targetRole,
    });
    setAuthNotice(null);

    const targetDashboard = ROLE_DEFAULT_DASHBOARDS[targetRole] || '/dashboard';
    navigate(targetDashboard);
  }, []);

  /**
   * Log out and clear session
   */
  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: null,
    });
    setAuthNotice(null);
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore
    }
    navigate('/login');
  }, []);

  /**
   * Seamlessly switch demo role while remaining authenticated
   * @param {string} newRole - Target role to switch to
   * @param {boolean} shouldRedirect - Whether to immediately navigate to that role's dashboard
   */
  const switchRole = useCallback((newRole, shouldRedirect = true) => {
    if (!DEMO_PROFILES[newRole]) return;

    const newProfile = DEMO_PROFILES[newRole];
    setAuthState({
      isAuthenticated: true,
      user: newProfile,
      role: newRole,
    });

    if (shouldRedirect) {
      const targetDashboard = ROLE_DEFAULT_DASHBOARDS[newRole] || '/dashboard';
      navigate(targetDashboard);
    }
  }, []);

  /**
   * Update the current authenticated user's profile in state & sessionStorage
   * @param {object} updatedFields - Fields to merge into the user profile
   */
  const updateUser = useCallback((updatedFields) => {
    setAuthState((prev) => {
      if (!prev.isAuthenticated || !prev.user) return prev;
      const updatedUser = {
        ...prev.user,
        ...updatedFields,
      };
      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  const value = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    role: authState.role,
    login,
    logout,
    switchRole,
    updateUser,
    authNotice,
    setAuthNotice,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

