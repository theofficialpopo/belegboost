/**
 * Checklist Types
 *
 * Checklists are assigned to client organizations and contain items with traffic light status.
 */

/**
 * Checklist status enum
 */
export type ChecklistStatus = 'draft' | 'active' | 'completed' | 'archived';

/**
 * Checklist item status enum (traffic light system)
 */
export type ChecklistItemStatus = 'red' | 'yellow' | 'green';

/**
 * Checklist interface matching Appwrite collection schema
 */
export interface Checklist {
  /**
   * Appwrite Document ID
   */
  $id: string;

  /**
   * Foreign key to tenants collection
   * Identifies which tax advisor this checklist belongs to
   */
  tenant_id: string;

  /**
   * Foreign key to organizations collection
   * Identifies which client organization this checklist is assigned to
   */
  organization_id: string;

  /**
   * Checklist title (max 200 characters)
   */
  title: string;

  /**
   * Checklist description - optional
   * Max 1000 characters
   */
  description?: string;

  /**
   * Total number of items in checklist
   */
  total_items: number;

  /**
   * Number of completed items (status = 'green')
   */
  completed_items: number;

  /**
   * Checklist status
   */
  status: ChecklistStatus;

  /**
   * Due date (ISO 8601) - optional
   */
  due_date?: string;

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
 * Checklist item interface matching Appwrite collection schema
 */
export interface ChecklistItem {
  /**
   * Appwrite Document ID
   */
  $id: string;

  /**
   * Foreign key to checklists collection
   */
  checklist_id: string;

  /**
   * Item title (max 200 characters)
   */
  title: string;

  /**
   * Item description - optional
   * Max 1000 characters
   */
  description?: string;

  /**
   * Traffic light status
   */
  status: ChecklistItemStatus;

  /**
   * Position/order in checklist
   */
  position: number;

  /**
   * Whether this item requires a document upload
   */
  requires_document: boolean;

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
 * Type for creating a new checklist (excludes Appwrite-managed fields)
 */
export type CreateChecklist = Omit<
  Checklist,
  '$id' | '$createdAt' | '$updatedAt' | 'total_items' | 'completed_items'
>;

/**
 * Type for updating a checklist (all fields optional except ID)
 */
export type UpdateChecklist = Partial<
  Omit<Checklist, '$id' | '$createdAt' | '$updatedAt'>
> & {
  $id: string;
};

/**
 * Type for creating a new checklist item (excludes Appwrite-managed fields)
 */
export type CreateChecklistItem = Omit<ChecklistItem, '$id' | '$createdAt' | '$updatedAt'>;

/**
 * Type for updating a checklist item (all fields optional except ID)
 */
export type UpdateChecklistItem = Partial<
  Omit<ChecklistItem, '$id' | '$createdAt' | '$updatedAt'>
> & {
  $id: string;
};

/**
 * Helper function to calculate checklist progress percentage
 */
export function calculateProgress(checklist: Checklist): number {
  if (checklist.total_items === 0) return 0;
  return Math.round((checklist.completed_items / checklist.total_items) * 100);
}

/**
 * Helper function to determine if all items are complete
 */
export function isChecklistComplete(checklist: Checklist): boolean {
  return checklist.total_items > 0 && checklist.completed_items === checklist.total_items;
}
