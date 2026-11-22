/**
 * Centralized Route & Role Configuration for Veda AI
 */

export const ROLES = {
  CLIENT: 'client',
  ASTROLOGER: 'astrologer',
  ADMIN: 'admin',
};

export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Client Routes
  CLIENT_DASHBOARD: '/dashboard',
  CLIENT_PROFILE: '/profile',
  CLIENT_KUNDLI: '/kundli',
  CLIENT_PLANETARY_ANALYSIS: '/planetary-analysis',
  CLIENT_PREDICTIONS: '/predictions',
  CLIENT_CHAT: '/chat',

  // Astrologer Routes
  ASTROLOGER_DASHBOARD: '/astrologer/dashboard',
  ASTROLOGER_CLIENTS: '/astrologer/clients',
  ASTROLOGER_VERIFICATIONS: '/astrologer/verifications',
  ASTROLOGER_REPORTS: '/astrologer/reports',

  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ASTROLOGERS: '/admin/astrologers',
  ADMIN_VERIFICATIONS: '/admin/verifications',
};

/**
 * Route metadata mapping each path to its access requirements and title.
 */
export const ROUTE_CONFIG = {
  // Public
  [ROUTES.HOME]: { isPublic: true, title: 'Veda AI | Ancient Wisdom, Intelligent Insights' },
  [ROUTES.LOGIN]: { isPublic: true, title: 'Sign In | Veda AI' },
  [ROUTES.REGISTER]: { isPublic: true, title: 'Create Account | Veda AI' },
  [ROUTES.FORGOT_PASSWORD]: { isPublic: true, title: 'Password Recovery | Veda AI' },

  // Client
  [ROUTES.CLIENT_DASHBOARD]: {
    isPublic: false,
    allowedRoles: [ROLES.CLIENT, ROLES.ADMIN],
    title: 'Client Dashboard | Veda AI',
    defaultForRole: ROLES.CLIENT,
  },
  [ROUTES.CLIENT_PROFILE]: {
    isPublic: false,
    allowedRoles: [ROLES.CLIENT, ROLES.ADMIN],
    title: 'My Profile | Veda AI',
    parentDashboard: ROUTES.CLIENT_DASHBOARD,
    category: 'Client',
  },
  [ROUTES.CLIENT_KUNDLI]: {
    isPublic: false,
    allowedRoles: [ROLES.CLIENT, ROLES.ADMIN],
    title: 'My Kundli Chart | Veda AI',
    parentDashboard: ROUTES.CLIENT_DASHBOARD,
    category: 'Client',
  },
  [ROUTES.CLIENT_PLANETARY_ANALYSIS]: {
    isPublic: false,
    allowedRoles: [ROLES.CLIENT, ROLES.ADMIN],
    title: 'Planetary & Bhava Analysis | Veda AI',
    parentDashboard: ROUTES.CLIENT_DASHBOARD,
    category: 'Client',
  },
  [ROUTES.CLIENT_PREDICTIONS]: {
    isPublic: false,
    allowedRoles: [ROLES.CLIENT, ROLES.ADMIN],
    title: 'Personalized Predictions | Veda AI',
    parentDashboard: ROUTES.CLIENT_DASHBOARD,
    category: 'Client',
  },
  [ROUTES.CLIENT_CHAT]: {
    isPublic: false,
    allowedRoles: [ROLES.CLIENT, ROLES.ADMIN],
    title: 'Veda AI Chat Assistant | Veda AI',
    parentDashboard: ROUTES.CLIENT_DASHBOARD,
    category: 'Client',
  },

  // Astrologer
  [ROUTES.ASTROLOGER_DASHBOARD]: {
    isPublic: false,
    allowedRoles: [ROLES.ASTROLOGER, ROLES.ADMIN],
    title: 'Astrologer Dashboard | Veda AI',
    defaultForRole: ROLES.ASTROLOGER,
  },
  [ROUTES.ASTROLOGER_CLIENTS]: {
    isPublic: false,
    allowedRoles: [ROLES.ASTROLOGER, ROLES.ADMIN],
    title: 'Client Directory | Astrologer Portal',
    parentDashboard: ROUTES.ASTROLOGER_DASHBOARD,
    category: 'Astrologer',
  },
  [ROUTES.ASTROLOGER_VERIFICATIONS]: {
    isPublic: false,
    allowedRoles: [ROLES.ASTROLOGER, ROLES.ADMIN],
    title: 'Pending Verifications | Astrologer Portal',
    parentDashboard: ROUTES.ASTROLOGER_DASHBOARD,
    category: 'Astrologer',
  },
  [ROUTES.ASTROLOGER_REPORTS]: {
    isPublic: false,
    allowedRoles: [ROLES.ASTROLOGER, ROLES.ADMIN],
    title: 'Astrological Reports | Astrologer Portal',
    parentDashboard: ROUTES.ASTROLOGER_DASHBOARD,
    category: 'Astrologer',
  },

  // Admin
  [ROUTES.ADMIN_DASHBOARD]: {
    isPublic: false,
    allowedRoles: [ROLES.ADMIN],
    title: 'System Admin Dashboard | Veda AI',
    defaultForRole: ROLES.ADMIN,
  },
  [ROUTES.ADMIN_USERS]: {
    isPublic: false,
    allowedRoles: [ROLES.ADMIN],
    title: 'User Management | Admin Portal',
    parentDashboard: ROUTES.ADMIN_DASHBOARD,
    category: 'Admin',
  },
  [ROUTES.ADMIN_ASTROLOGERS]: {
    isPublic: false,
    allowedRoles: [ROLES.ADMIN],
    title: 'Astrologer Network | Admin Portal',
    parentDashboard: ROUTES.ADMIN_DASHBOARD,
    category: 'Admin',
  },
  [ROUTES.ADMIN_VERIFICATIONS]: {
    isPublic: false,
    allowedRoles: [ROLES.ADMIN],
    title: 'Platform Verifications | Admin Portal',
    parentDashboard: ROUTES.ADMIN_DASHBOARD,
    category: 'Admin',
  },
};

/**
 * Default landing dashboard for each authenticated role
 */
export const ROLE_DEFAULT_DASHBOARDS = {
  [ROLES.CLIENT]: ROUTES.CLIENT_DASHBOARD,
  [ROLES.ASTROLOGER]: ROUTES.ASTROLOGER_DASHBOARD,
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
};

