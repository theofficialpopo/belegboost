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

  // TODO: Implement actual authentication check with Appwrite
  // For now, this is a placeholder that will be implemented in Phase 2
  // In Phase 2, we will:
  // 1. Check for valid session cookie
  // 2. Fetch user from Appwrite
  // 3. Verify user belongs to the tenant team
  // 4. Return actual tenant context

  // Placeholder return - will be replaced in Phase 2
  return {
    tenantId: 'placeholder-tenant-id',
    userId: 'placeholder-user-id',
    role: 'owner',
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
