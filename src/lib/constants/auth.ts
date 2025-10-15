/**
 * Authentication constants and configuration
 */

/**
 * Session cookie name
 */
export const SESSION_COOKIE_NAME = 'belegboost_session';

/**
 * Session cookie max age (30 days in seconds)
 */
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * Invitation token expiry (7 days in milliseconds)
 */
export const INVITATION_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

/**
 * Password reset token expiry (1 hour in milliseconds)
 */
export const PASSWORD_RESET_TOKEN_EXPIRY = 60 * 60 * 1000;

/**
 * Reserved subdomains that cannot be used for tenant registration
 */
export const RESERVED_SUBDOMAINS = [
  'www',
  'app',
  'api',
  'admin',
  'dashboard',
  'auth',
  'login',
  'logout',
  'register',
  'signup',
  'signin',
  'mail',
  'email',
  'smtp',
  'ftp',
  'help',
  'support',
  'docs',
  'blog',
  'status',
  'cdn',
  'assets',
  'static',
  'media',
  'uploads',
  'downloads',
  'test',
  'testing',
  'staging',
  'dev',
  'development',
  'prod',
  'production',
];

/**
 * Routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/',
  '/impressum',
  '/datenschutz',
  '/login',
  '/register',
  '/einladung',
  '/passwort-vergessen',
  '/passwort-zurucksetzen',
];

/**
 * Routes that are only accessible when not authenticated
 */
export const AUTH_ROUTES = [
  '/login',
  '/register',
];

/**
 * Default redirect after login (relative to tenant subdomain)
 */
export const DEFAULT_LOGIN_REDIRECT = '/dashboard';

/**
 * Default redirect after logout
 */
export const DEFAULT_LOGOUT_REDIRECT = '/login';

/**
 * Appwrite collection IDs from environment
 */
export const COLLECTIONS = {
  TENANTS: process.env.APPWRITE_TENANTS_COLLECTION || 'tenants',
  ORGANIZATIONS: process.env.APPWRITE_ORGANIZATIONS_COLLECTION || 'organizations',
  USERS: process.env.APPWRITE_USERS_COLLECTION || 'users',
  CHECKLISTS: process.env.APPWRITE_CHECKLISTS_COLLECTION || 'checklists',
  CHECKLIST_ITEMS: process.env.APPWRITE_CHECKLIST_ITEMS_COLLECTION || 'checklist_items',
  DOCUMENTS: process.env.APPWRITE_DOCUMENTS_COLLECTION || 'documents',
  AUDIT_LOGS: process.env.APPWRITE_AUDIT_LOGS_COLLECTION || 'audit_logs',
} as const;

/**
 * Appwrite database ID from environment
 */
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'belegboost-db';
