/**
 * Tenant context resolution for server-side operations
 *
 * This module provides functions to get the current tenant context
 * based on the subdomain from the request headers.
 *
 * CRITICAL: Always use getTenantContext() in Server Actions to ensure
 * proper tenant isolation and prevent data leakage.
 */

'use server';

import { headers } from 'next/headers';
import { type TenantContext } from '@/types/user';

/**
 * Get the current tenant context from request headers
 *
 * @returns Promise<TenantContext> - The current tenant, user, and role context
 * @throws Error if user is not authenticated or tenant cannot be determined
 *
 * @example
 * ```typescript
 * export async function createChecklist(formData: FormData) {
 *   const { tenantId, userId, role } = await getTenantContext();
 *   // Use tenantId to ensure data isolation
 * }
 * ```
 */
export async function getTenantContext(): Promise<TenantContext> {
  const { getCurrentUser } = await import('@/lib/server/session');
  const { getTenantBySubdomain } = await import('@/lib/dal/tenants');
  const { getUserByAppwriteId } = await import('@/lib/dal/users');

  // Get hostname from headers
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  // Extract subdomain
  let subdomain = '';

  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      subdomain = parts[0];
    }
  } else if (hostname.includes('belegboost.de')) {
    const parts = hostname.split('.');
    if (parts[0] !== 'www' && parts.length === 3) {
      subdomain = parts[0];
    }
  }

  if (!subdomain) {
    throw new Error('No tenant subdomain found in request');
  }

  // Get current authenticated user
  const appwriteUser = await getCurrentUser();
  if (!appwriteUser) {
    throw new Error('User not authenticated');
  }

  // Get tenant by subdomain
  const tenant = await getTenantBySubdomain(subdomain);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Get user from database
  const user = await getUserByAppwriteId(appwriteUser.$id);
  if (!user) {
    throw new Error('User record not found');
  }

  // Verify user belongs to this tenant
  if (user.tenant_id !== tenant.$id) {
    throw new Error('User does not belong to this tenant');
  }

  return {
    tenantId: tenant.$id,
    userId: user.$id,
    organizationId: user.organization_id,
    role: user.role,
    subdomain,
  };
}

/**
 * Get subdomain from request headers
 *
 * @returns Promise<string | null> - The subdomain or null if on main domain
 */
export async function getSubdomain(): Promise<string | null> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
  } else if (hostname.includes('belegboost.de')) {
    const parts = hostname.split('.');
    if (parts[0] !== 'www' && parts.length === 3) {
      return parts[0];
    }
  }

  return null;
}
