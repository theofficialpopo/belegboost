/**
 * User Types
 *
 * Users belong to organizations and have roles that determine their permissions.
 * Each user is associated with:
 * - A tenant (tax advisor firm)
 * - An organization (either the advisor firm itself or a client company)
 */

/**
 * User role enum with updated roles for multi-organization architecture
 * - owner: Tenant owner (full access to all tenant resources)
 * - advisor: Tax advisor employee (access to advisor firm resources)
 * - client_admin: Client company administrator (full access to their organization's resources)
 * - client_employee: Client company employee (limited access to their organization's resources)
 */
export type UserRole = 'owner' | 'advisor' | 'client_admin' | 'client_employee';

/**
 * User status enum
 */
export type UserStatus = 'active' | 'inactive' | 'pending';

/**
 * User interface matching Appwrite collection schema
 */
export interface User {
  /**
   * Appwrite Document ID
   */
  $id: string;

  /**
   * Foreign key to tenants collection
   * Identifies which tax advisor this user belongs to
   */
  tenant_id: string;

  /**
   * Foreign key to organizations collection
   * Identifies which organization (advisor firm or client company) this user belongs to
   */
  organization_id: string;

  /**
   * Appwrite Auth User ID
   * Links to Appwrite's authentication system
   */
  appwrite_user_id: string;

  /**
   * User role determining permissions
   */
  role: UserRole;

  /**
   * User's first name (max 100 characters)
   */
  first_name: string;

  /**
   * User's last name (max 100 characters)
   */
  last_name: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * User's phone number - optional
   * Max 20 characters
   */
  phone?: string;

  /**
   * User account status
   */
  status: UserStatus;

  /**
   * Last login timestamp (ISO 8601) - optional
   */
  last_login_at?: string;

  /**
   * Appwrite creation timestamp (ISO 8601)
   */
  $createdAt: string;

  /**
   * Appwrite update timestamp (ISO 8601)
   */
  $updatedAt: string;
}

/**
 * Type for creating a new user (excludes Appwrite-managed fields)
 */
export type CreateUser = Omit<User, '$id' | '$createdAt' | '$updatedAt' | 'last_login_at'>;

/**
 * Type for updating a user (all fields optional except ID)
 */
export type UpdateUser = Partial<Omit<User, '$id' | '$createdAt' | '$updatedAt'>> & {
  $id: string;
};

/**
 * Tenant context for request handling
 */
export interface TenantContext {
  tenantId: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  subdomain: string;
}

/**
 * Helper function to check if a user has advisor-level permissions
 */
export function isAdvisorRole(role: UserRole): boolean {
  return role === 'owner' || role === 'advisor';
}

/**
 * Helper function to check if a user has client-level permissions
 */
export function isClientRole(role: UserRole): boolean {
  return role === 'client_admin' || role === 'client_employee';
}

/**
 * Helper function to check if a user has admin permissions (tenant owner or client admin)
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'owner' || role === 'client_admin';
}
