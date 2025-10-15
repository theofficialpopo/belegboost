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
import type { Tenants } from '@/types/appwrite';
import { TenantStatus } from '@/types/appwrite';

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
 * @returns Promise<Tenants | null> - The tenant or null if not found
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenants | null> {
  try {
    const result = await databases.listDocuments<Tenants>(
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
 * @returns Promise<Tenants | null> - The tenant or null if not found
 */
export async function getTenantById(tenantId: string): Promise<Tenants | null> {
  try {
    const tenant = await databases.getDocument<Tenants>(
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
 * @returns Promise<Tenants | null> - The tenant or null if not found
 */
export async function getTenantByTeamId(teamId: string): Promise<Tenants | null> {
  try {
    const result = await databases.listDocuments<Tenants>(
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
 * @returns Promise<Tenants> - The created tenant
 */
export async function createTenant(data: {
  teamId: string;
  subdomain: string;
  name: string;
  ownerEmail: string;
}): Promise<Tenants> {
  try {
    const tenant = await databases.createDocument<Tenants>(
      DATABASE_ID,
      COLLECTIONS.TENANTS,
      'unique()',
      {
        team_id: data.teamId,
        subdomain: data.subdomain,
        name: data.name,
        owner_email: data.ownerEmail,
        branding_logo_url: null,
        branding_primary_color: null,
        branding_secondary_color: null,
        status: TenantStatus.ACTIVE,
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
 * @returns Promise<Tenants> - The updated tenant
 */
export async function updateTenantBranding(
  tenantId: string,
  branding: {
    branding_logo_url?: string | null;
    branding_primary_color?: string | null;
    branding_secondary_color?: string | null;
  }
): Promise<Tenants> {
  try {
    const tenant = await databases.updateDocument<Tenants>(
      DATABASE_ID,
      COLLECTIONS.TENANTS,
      tenantId,
      branding
    );

    return tenant;
  } catch (error) {
    console.error('Error updating tenant branding:', error);
    throw new Error('Fehler beim Aktualisieren des Brandings');
  }
}
