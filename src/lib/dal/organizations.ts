/**
 * Data Access Layer for Organizations
 *
 * This module provides organization-related database operations with proper
 * tenant isolation and error handling.
 */

'use server';

import { databases } from '@/lib/server/appwrite';
import { DATABASE_ID, COLLECTIONS } from '@/lib/constants/auth';
import { Query } from 'node-appwrite';

/**
 * Organization type enum
 */
export type OrganizationType = 'advisor_firm' | 'client_company';

/**
 * Organization interface
 */
export interface Organization {
  $id: string;
  tenant_id: string;
  type: OrganizationType;
  name: string;
  $createdAt: string;
  $updatedAt: string;
}

/**
 * Create a new organization
 *
 * @param data - Organization creation data
 * @returns Promise<Organization> - The created organization
 */
export async function createOrganization(data: {
  tenantId: string;
  type: OrganizationType;
  name: string;
}): Promise<Organization> {
  try {
    const organization = await databases.createDocument<Organization>(
      DATABASE_ID,
      COLLECTIONS.ORGANIZATIONS,
      'unique()',
      {
        tenant_id: data.tenantId,
        type: data.type,
        name: data.name,
      }
    );

    return organization;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw new Error('Fehler beim Erstellen der Organisation');
  }
}

/**
 * Get organization by ID
 *
 * @param organizationId - The organization ID
 * @returns Promise<Organization | null> - The organization or null if not found
 */
export async function getOrganizationById(organizationId: string): Promise<Organization | null> {
  try {
    const organization = await databases.getDocument<Organization>(
      DATABASE_ID,
      COLLECTIONS.ORGANIZATIONS,
      organizationId
    );

    return organization;
  } catch (error) {
    console.error('Error getting organization by ID:', error);
    return null;
  }
}

/**
 * List organizations in a tenant
 *
 * @param tenantId - The tenant ID
 * @param type - Optional filter by organization type
 * @returns Promise<Organization[]> - Array of organizations
 */
export async function listOrganizations(
  tenantId: string,
  type?: OrganizationType
): Promise<Organization[]> {
  try {
    const queries = [
      Query.equal('tenant_id', tenantId),
      Query.orderDesc('$createdAt'),
    ];

    if (type) {
      queries.push(Query.equal('type', type));
    }

    const result = await databases.listDocuments<Organization>(
      DATABASE_ID,
      COLLECTIONS.ORGANIZATIONS,
      queries
    );

    return result.documents;
  } catch (error) {
    console.error('Error listing organizations:', error);
    return [];
  }
}

/**
 * Get the advisor firm organization for a tenant
 *
 * @param tenantId - The tenant ID
 * @returns Promise<Organization | null> - The advisor firm organization or null
 */
export async function getAdvisorFirmOrganization(tenantId: string): Promise<Organization | null> {
  try {
    const result = await databases.listDocuments<Organization>(
      DATABASE_ID,
      COLLECTIONS.ORGANIZATIONS,
      [
        Query.equal('tenant_id', tenantId),
        Query.equal('type', 'advisor_firm'),
        Query.limit(1),
      ]
    );

    if (result.total === 0) {
      return null;
    }

    return result.documents[0];
  } catch (error) {
    console.error('Error getting advisor firm organization:', error);
    return null;
  }
}
