/**
 * Custom Database Type Extensions
 *
 * This file contains business logic types that extend the auto-generated
 * Appwrite types. Use this for derived types, utility types, and custom
 * type transformations.
 *
 * IMPORTANT: Do NOT edit src/types/appwrite.ts - it's auto-generated.
 * All custom types should go here.
 */

import type { Models } from 'node-appwrite';
import type {
  Tenants,
  Organizations,
  Users,
  Checklists,
  ChecklistItems,
  Documents,
} from './appwrite';

/**
 * Tenant Extensions
 */

// Tenant with aggregated counts
export type TenantWithCounts = Tenants & {
  user_count: number;
  checklist_count: number;
  client_count: number;
};

// Input type for creating a new tenant (excludes Appwrite-managed fields)
export type CreateTenantInput = Omit<Tenants, keyof Models.Document>;

// Input type for updating tenant branding
export type UpdateTenantBrandingInput = Pick<
  Tenants,
  'branding_logo_url' | 'branding_primary_color' | 'branding_secondary_color'
>;

/**
 * Organization Extensions
 */

// Organization with user count
export type OrganizationWithCounts = Organizations & {
  user_count: number;
  active_checklist_count: number;
};

// Input type for creating a new organization
export type CreateOrganizationInput = Omit<Organizations, keyof Models.Document>;

// Input type for updating an organization
export type UpdateOrganizationInput = Partial<
  Omit<Organizations, keyof Models.Document>
> & {
  $id: string;
};

/**
 * User Extensions
 */

// User with organization details
export type UserWithOrganization = Users & {
  organization_name: string;
  organization_type: 'advisor' | 'client';
};

// Input type for creating a new user
export type CreateUserInput = Omit<Users, keyof Models.Document>;

// Input type for updating a user
export type UpdateUserInput = Partial<Omit<Users, keyof Models.Document>> & {
  $id: string;
};

/**
 * Checklist Extensions
 */

// Checklist with items
export type ChecklistWithItems = Checklists & {
  items: ChecklistItems[];
};

// Checklist with progress percentage
export type ChecklistWithProgress = Checklists & {
  progress_percentage: number;
};

// Input type for creating a new checklist
export type CreateChecklistInput = Omit<Checklists, keyof Models.Document>;

// Input type for updating a checklist
export type UpdateChecklistInput = Partial<Omit<Checklists, keyof Models.Document>> & {
  $id: string;
};

/**
 * ChecklistItem Extensions
 */

// Checklist item with document count
export type ChecklistItemWithDocuments = ChecklistItems & {
  documents: Documents[];
  document_count: number;
};

// Input type for creating a new checklist item
export type CreateChecklistItemInput = Omit<ChecklistItems, keyof Models.Document>;

// Input type for updating a checklist item
export type UpdateChecklistItemInput = Partial<
  Omit<ChecklistItems, keyof Models.Document>
> & {
  $id: string;
};

/**
 * Document Extensions
 */

// Document with uploader name
export type DocumentWithUploader = Documents & {
  uploaded_by_name: string;
};

// Input type for creating a new document
export type CreateDocumentInput = Omit<Documents, keyof Models.Document>;

/**
 * Helper type guards
 */

export function isTenant(obj: unknown): obj is Tenants {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '$id' in obj &&
    'team_id' in obj &&
    'subdomain' in obj
  );
}

export function isOrganization(obj: unknown): obj is Organizations {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '$id' in obj &&
    'tenant_id' in obj &&
    'type' in obj
  );
}

export function isUser(obj: unknown): obj is Users {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '$id' in obj &&
    'appwrite_user_id' in obj &&
    'role' in obj
  );
}
