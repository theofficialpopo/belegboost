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
import type { Organizations } from '@/types/appwrite';
import { OrganizationType, OrganizationStatus } from '@/types/appwrite';

/**
 * Create a new organization
 *
 * @param data - Organization creation data
 * @returns Promise<Organizations> - The created organization
 */
export async function createOrganization(data: {
  tenantId: string;
  type: 'advisor' | 'client';
  name: string;
  contactEmail?: string;
}): Promise<Organizations> {
  try {
    // Map string type to enum
    const typeEnum = data.type === 'advisor' ? OrganizationType.ADVISOR : OrganizationType.CLIENT;

    const organization = await databases.createDocument<Organizations>(
      DATABASE_ID,
      COLLECTIONS.ORGANIZATIONS,
      'unique()',
      {
        tenant_id: data.tenantId,
        type: typeEnum,
        name: data.name,
        tax_id: null,
        contact_email: data.contactEmail || '',
        contact_phone: null,
        status: OrganizationStatus.ACTIVE,
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
 * @returns Promise<Organizations | null> - The organization or null if not found
 */
export async function getOrganizationById(organizationId: string): Promise<Organizations | null> {
  try {
    const organization = await databases.getDocument<Organizations>(
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
 * @returns Promise<Organizations[]> - Array of organizations
 */
export async function listOrganizations(
  tenantId: string,
  type?: 'advisor' | 'client'
): Promise<Organizations[]> {
  try {
    const queries = [
      Query.equal('tenant_id', tenantId),
      Query.orderDesc('$createdAt'),
    ];

    if (type) {
      const typeEnum = type === 'advisor' ? OrganizationType.ADVISOR : OrganizationType.CLIENT;
      queries.push(Query.equal('type', typeEnum));
    }

    const result = await databases.listDocuments<Organizations>(
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
 * @returns Promise<Organizations | null> - The advisor firm organization or null
 */
export async function getAdvisorFirmOrganization(tenantId: string): Promise<Organizations | null> {
  try {
    const result = await databases.listDocuments<Organizations>(
      DATABASE_ID,
      COLLECTIONS.ORGANIZATIONS,
      [
        Query.equal('tenant_id', tenantId),
        Query.equal('type', OrganizationType.ADVISOR),
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
