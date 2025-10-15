/**
 * Data Access Layer for Tenants
 *
 * This module provides tenant-related database operations with proper
 * data isolation and error handling.
 */

'use server';

import { databases } from '@/lib/server/appwrite';
import { DATABASE_ID, COLLECTIONS } from '@/lib/constants/auth';
import { Query } from 'node-appwrite';
import type { Tenant } from '@/types/tenant';

/**
 * Check if a subdomain is available for registration
 *
 * @param subdomain - The subdomain to check
 * @returns Promise<boolean> - True if available, false if taken
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TENANTS,
      [
        Query.equal('subdomain', subdomain),
        Query.limit(1),
      ]
    );

    return result.total === 0;
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    throw new Error('Fehler beim Prüfen der Subdomain-Verfügbarkeit');
  }
}

/**
 * Get tenant by subdomain
 *
 * @param subdomain - The subdomain to look up
 * @returns Promise<Tenant | null> - The tenant or null if not found
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  try {
    const result = await databases.listDocuments<Tenant>(
      DATABASE_ID,
      COLLECTIONS.TENANTS,
      [
        Query.equal('subdomain', subdomain),
        Query.limit(1),
      ]
    );

    if (result.total === 0) {
      return null;
    }

    return result.documents[0];
  } catch (error) {
    console.error('Error getting tenant by subdomain:', error);
    return null;
  }
}

/**
 * Get tenant by ID
 *
 * @param tenantId - The tenant ID
 * @returns Promise<Tenant | null> - The tenant or null if not found
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    const tenant = await databases.getDocument<Tenant>(
      DATABASE_ID,
      COLLECTIONS.TENANTS,
      tenantId
    );

    return tenant;
  } catch (error) {
    console.error('Error getting tenant by ID:', error);
    return null;
  }
}

/**
 * Get tenant by team ID
 *
 * @param teamId - The Appwrite team ID
 * @returns Promise<Tenant | null> - The tenant or null if not found
 */
export async function getTenantByTeamId(teamId: string): Promise<Tenant | null> {
  try {
    const result = await databases.listDocuments<Tenant>(
      DATABASE_ID,
      COLLECTIONS.TENANTS,
      [
        Query.equal('team_id', teamId),
        Query.limit(1),
      ]
    );

    if (result.total === 0) {
      return null;
    }

    return result.documents[0];
  } catch (error) {
    console.error('Error getting tenant by team ID:', error);
    return null;
  }
}

/**
 * Create a new tenant
 *
 * @param data - Tenant creation data
 * @returns Promise<Tenant> - The created tenant
 */
export async function createTenant(data: {
  teamId: string;
  subdomain: string;
  name: string;
  ownerEmail: string;
}): Promise<Tenant> {
  try {
    const tenant = await databases.createDocument<Tenant>(
      DATABASE_ID,
      COLLECTIONS.TENANTS,
      'unique()',
      {
        team_id: data.teamId,
        subdomain: data.subdomain,
        name: data.name,
        owner_email: data.ownerEmail,
        branding: {},
        status: 'trial',
      }
    );

    return tenant;
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw new Error('Fehler beim Erstellen des Tenants');
  }
}

/**
 * Update tenant branding
 *
 * @param tenantId - The tenant ID
 * @param branding - Branding data to update
 * @returns Promise<Tenant> - The updated tenant
 */
export async function updateTenantBranding(
  tenantId: string,
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }
): Promise<Tenant> {
  try {
    const tenant = await databases.updateDocument<Tenant>(
      DATABASE_ID,
      COLLECTIONS.TENANTS,
      tenantId,
      {
        branding,
      }
    );

    return tenant;
  } catch (error) {
    console.error('Error updating tenant branding:', error);
    throw new Error('Fehler beim Aktualisieren des Brandings');
  }
}
