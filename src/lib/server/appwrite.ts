/**
 * Server-side Appwrite SDK initialization
 * Use this for Server Actions, API routes, and server components
 */

import { Client, Databases, Storage, Users, Teams } from 'node-appwrite';

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined');
}

if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined');
}

if (!process.env.APPWRITE_API_KEY) {
  throw new Error('APPWRITE_API_KEY is not defined (server-side only)');
}

// Create a server client with API key
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

// Initialize services
export const databases = new Databases(client);
export const storage = new Storage(client);
export const users = new Users(client);
export const teams = new Teams(client);

// Export client for advanced use cases
export { client };
