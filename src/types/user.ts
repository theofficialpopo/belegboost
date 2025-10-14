/**
 * User type definitions for BelegBoost multi-tenant system
 */

export type UserRole = 'owner' | 'advisor' | 'client';
export type UserStatus = 'active' | 'inactive' | 'invited';

export interface User {
  id: string;
  tenantId: string;
  appwriteUserId: string; // Appwrite Auth user ID
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
}

export interface CreateUserInput {
  tenantId: string;
  appwriteUserId: string;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: UserRole;
  subdomain: string;
}
