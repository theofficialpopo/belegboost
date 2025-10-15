/**
 * Type Index
 *
 * Central export point for all types in the application.
 * Import from this file for convenience: `import type { Tenants } from '@/types'`
 */

// Re-export auto-generated Appwrite types (source of truth)
export type {
  Tenants,
  Organizations,
  Users,
  Checklists,
  ChecklistItems,
  Documents,
  AuditLogs,
} from './appwrite';

// Re-export auto-generated enums
export {
  OrganizationType,
  OrganizationStatus,
  TenantStatus,
  UserRole,
  UserStatus,
  ChecklistStatus,
  ChecklistItemStatus,
  Action
} from './appwrite';

// Re-export custom database extensions
export type {
  // Tenant types
  TenantWithCounts,
  CreateTenantInput,
  UpdateTenantBrandingInput,
  // Organization types
  OrganizationWithCounts,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  // User types
  UserWithOrganization,
  CreateUserInput,
  UpdateUserInput,
  // Checklist types
  ChecklistWithItems,
  ChecklistWithProgress,
  CreateChecklistInput,
  UpdateChecklistInput,
  // ChecklistItem types
  ChecklistItemWithDocuments,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
  // Document types
  DocumentWithUploader,
  CreateDocumentInput,
} from './database';

// Re-export type guards
export { isTenant, isOrganization, isUser } from './database';

// Re-export manual types that are still useful
export type {
  OrganizationType,
  OrganizationStatus,
  Organization,
  CreateOrganization,
  UpdateOrganization,
} from './organization';

export type {
  UserRole,
  UserStatus,
  User,
  CreateUser,
  UpdateUser,
  TenantContext,
} from './user';

export { isAdvisorRole, isClientRole, isAdminRole } from './user';

export type {
  ChecklistStatus,
  ChecklistItemStatus,
  Checklist,
  ChecklistItem,
  CreateChecklist,
  UpdateChecklist,
} from './checklist';
