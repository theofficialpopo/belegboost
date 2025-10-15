/**
 * Organization Types
 *
 * Represents both tax advisor firms and client companies in the multi-tenant system.
 * Each tenant (tax advisor) can have:
 * - One organization of type "advisor" (the advisor firm itself)
 * - Multiple organizations of type "client" (their client companies)
 */

/**
 * Organization type enum
 * - advisor: Tax advisor firm (Steuerberater)
 * - client: Client company (Mandant)
 */
export type OrganizationType = 'advisor' | 'client';

/**
 * Organization status enum
 */
export type OrganizationStatus = 'active' | 'inactive';

/**
 * Organization interface matching Appwrite collection schema
 */
export interface Organization {
  /**
   * Appwrite Document ID
   */
  $id: string;

  /**
   * Foreign key to tenants collection
   * Identifies which tax advisor this organization belongs to
   */
  tenant_id: string;

  /**
   * Type of organization (advisor or client)
   */
  type: OrganizationType;

  /**
   * Company name (max 200 characters)
   */
  name: string;

  /**
   * German tax ID (Steuernummer) - optional
   * Max 50 characters
   */
  tax_id?: string;

  /**
   * Main contact email address
   */
  contact_email: string;

  /**
   * Contact phone number - optional
   * Max 20 characters
   */
  contact_phone?: string;

  /**
   * Organization status
   */
  status: OrganizationStatus;

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
 * Type for creating a new organization (excludes Appwrite-managed fields)
 */
export type CreateOrganization = Omit<Organization, '$id' | '$createdAt' | '$updatedAt'>;

/**
 * Type for updating an organization (all fields optional except ID)
 */
export type UpdateOrganization = Partial<Omit<Organization, '$id' | '$createdAt' | '$updatedAt'>> & {
  $id: string;
};
