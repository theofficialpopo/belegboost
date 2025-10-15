/**
 * Session management utilities
 *
 * Handles session creation, validation, and removal using Appwrite sessions
 * and Next.js cookies.
 */

'use server';

import { cookies } from 'next/headers';
import { Account } from 'node-appwrite';
import { client } from '@/lib/server/appwrite';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/constants/auth';

/**
 * Create a session cookie from Appwrite session
 *
 * @param sessionId - The Appwrite session ID
 * @returns Promise<void>
 */
export async function createSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Get the current session ID from cookies
 *
 * @returns Promise<string | null> - The session ID or null if not found
 */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  return sessionCookie?.value || null;
}

/**
 * Delete the session cookie
 *
 * @returns Promise<void>
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get the current authenticated user from the session
 *
 * @returns Promise<any | null> - The Appwrite user or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      return null;
    }

    // Create a new client with the session
    const sessionClient = client.setSession(sessionId);
    const account = new Account(sessionClient);

    const user = await account.get();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Validate the current session
 *
 * @returns Promise<boolean> - True if session is valid, false otherwise
 */
export async function validateSession(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Delete the current session (logout)
 *
 * @returns Promise<void>
 */
export async function deleteSession(): Promise<void> {
  try {
    const sessionId = await getSessionId();

    if (sessionId) {
      // Create a new client with the session
      const sessionClient = client.setSession(sessionId);
      const account = new Account(sessionClient);

      // Delete the session from Appwrite
      await account.deleteSession('current');
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    // Continue to delete cookie even if Appwrite deletion fails
  } finally {
    // Always delete the session cookie
    await deleteSessionCookie();
  }
}
