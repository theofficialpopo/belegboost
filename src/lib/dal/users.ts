/**
 * Data Access Layer for Users
 *
 * This module provides user-related database operations with proper
 * tenant isolation and error handling.
 */

'use server';

import { databases } from '@/lib/server/appwrite';
import { DATABASE_ID, COLLECTIONS } from '@/lib/constants/auth';
import { Query } from 'node-appwrite';
import type { User, UserRole } from '@/types/user';

/**
 * Get user by Appwrite user ID
 *
 * @param appwriteUserId - The Appwrite authentication user ID
 * @returns Promise<User | null> - The user or null if not found
 */
export async function getUserByAppwriteId(appwriteUserId: string): Promise<User | null> {
  try {
    const result = await databases.listDocuments<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [
        Query.equal('appwrite_user_id', appwriteUserId),
        Query.limit(1),
      ]
    );

    if (result.total === 0) {
      return null;
    }

    return result.documents[0];
  } catch (error) {
    console.error('Error getting user by Appwrite ID:', error);
    return null;
  }
}

/**
 * Get user by email within a tenant
 *
 * @param email - The user's email
 * @param tenantId - The tenant ID
 * @returns Promise<User | null> - The user or null if not found
 */
export async function getUserByEmail(email: string, tenantId: string): Promise<User | null> {
  try {
    const result = await databases.listDocuments<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [
        Query.equal('email', email),
        Query.equal('tenant_id', tenantId),
        Query.limit(1),
      ]
    );

    if (result.total === 0) {
      return null;
    }

    return result.documents[0];
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Get user by ID
 *
 * @param userId - The user document ID
 * @returns Promise<User | null> - The user or null if not found
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await databases.getDocument<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId
    );

    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Create a new user
 *
 * @param data - User creation data
 * @returns Promise<User> - The created user
 */
export async function createUser(data: {
  tenantId: string;
  organizationId: string;
  appwriteUserId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}): Promise<User> {
  try {
    const user = await databases.createDocument<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      'unique()',
      {
        tenant_id: data.tenantId,
        organization_id: data.organizationId,
        appwrite_user_id: data.appwriteUserId,
        role: data.role,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || '',
        status: 'active',
      }
    );

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Fehler beim Erstellen des Benutzers');
  }
}

/**
 * Update user's last login timestamp
 *
 * @param userId - The user document ID
 * @returns Promise<void>
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      {
        last_login_at: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Update user status
 *
 * @param userId - The user document ID
 * @param status - The new status
 * @returns Promise<User> - The updated user
 */
export async function updateUserStatus(
  userId: string,
  status: 'active' | 'inactive' | 'pending'
): Promise<User> {
  try {
    const user = await databases.updateDocument<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      {
        status,
      }
    );

    return user;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Fehler beim Aktualisieren des Benutzerstatus');
  }
}

/**
 * List users in a tenant
 *
 * @param tenantId - The tenant ID
 * @param limit - Maximum number of users to return
 * @param offset - Number of users to skip
 * @returns Promise<User[]> - Array of users
 */
export async function listTenantUsers(
  tenantId: string,
  limit: number = 25,
  offset: number = 0
): Promise<User[]> {
  try {
    const result = await databases.listDocuments<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [
        Query.equal('tenant_id', tenantId),
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt'),
      ]
    );

    return result.documents;
  } catch (error) {
    console.error('Error listing tenant users:', error);
    return [];
  }
}
