/**
 * Client-side Appwrite SDK initialization
 * Use this for client components and browser-side operations
 */

import { Client, Account, Databases, Storage } from 'appwrite';

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined');
}

if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined');
}

// Create a client for browser use (no API key)
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Initialize client services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export client for advanced use cases
export { client };
