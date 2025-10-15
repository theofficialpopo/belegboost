/**
 * Authentication Server Actions
 *
 * These actions handle user registration, login, logout, and related operations.
 */

'use server';

import { Account, ID } from 'node-appwrite';
import { client, teams } from '@/lib/server/appwrite';
import {
  registrationSchema,
  loginSchema,
  type RegistrationFormData,
  type LoginFormData,
} from '@/lib/validations/auth';
import { RESERVED_SUBDOMAINS } from '@/lib/constants/auth';
import { isSubdomainAvailable, createTenant } from '@/lib/dal/tenants';
import { createUser } from '@/lib/dal/users';
import { createOrganization } from '@/lib/dal/organizations';
import { createSessionCookie, deleteSession } from '@/lib/server/session';
import { redirect } from 'next/navigation';

/**
 * Action result type
 */
type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Register a new tax advisor and create their tenant
 *
 * @param formData - Registration form data
 * @returns ActionResult with success/error status
 */
export async function registerTaxAdvisor(
  formData: RegistrationFormData
): Promise<ActionResult<{ subdomain: string }>> {
  try {
    // Validate form data
    const validatedData = registrationSchema.parse(formData);

    // Check if subdomain is reserved
    if (RESERVED_SUBDOMAINS.includes(validatedData.subdomain.toLowerCase())) {
      return {
        success: false,
        error: 'Diese Subdomain ist reserviert und kann nicht verwendet werden',
      };
    }

    // Check subdomain availability
    const isAvailable = await isSubdomainAvailable(validatedData.subdomain);
    if (!isAvailable) {
      return {
        success: false,
        error: 'Diese Subdomain ist bereits vergeben',
      };
    }

    // Create Appwrite user account
    const account = new Account(client);
    let appwriteUser;

    try {
      appwriteUser = await account.create(
        ID.unique(),
        validatedData.email,
        validatedData.password,
        `${validatedData.firstName} ${validatedData.lastName}`
      );
    } catch (error) {
      console.error('Error creating Appwrite user:', error);

      const err = error as { code?: number };
      if (err.code === 409) {
        return {
          success: false,
          error: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits',
        };
      }

      return {
        success: false,
        error: 'Fehler beim Erstellen des Benutzerkontos',
      };
    }

    // Create Appwrite Team for tenant isolation
    let team;
    try {
      team = await teams.create(
        ID.unique(),
        validatedData.firmName,
        [
          'owner', // Owner role
        ]
      );
    } catch (error) {
      console.error('Error creating Appwrite team:', error);

      // Note: Cleanup would require Users API with admin privileges
      // For now, we log the user ID for manual cleanup if needed
      console.error('User cleanup needed for:', appwriteUser.$id);

      return {
        success: false,
        error: 'Fehler beim Erstellen des Teams',
      };
    }

    // Add user to team as owner
    try {
      await teams.createMembership(
        team.$id,
        ['owner'],
        appwriteUser.email,
        appwriteUser.$id,
        undefined,
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${validatedData.subdomain}/accept-invitation`
      );
    } catch (error) {
      console.error('Error adding user to team:', error);
      // Continue anyway - the user is created and can be manually added later
    }

    // Create tenant record in database
    let tenant;
    try {
      tenant = await createTenant({
        teamId: team.$id,
        subdomain: validatedData.subdomain,
        name: validatedData.firmName,
        ownerEmail: validatedData.email,
      });
    } catch (error) {
      console.error('Error creating tenant:', error);

      // Clean up team (user cleanup requires admin API)
      try {
        await teams.delete(team.$id);
        console.error('User cleanup needed for:', appwriteUser.$id);
      } catch (cleanupError) {
        console.error('Error cleaning up after tenant creation failure:', cleanupError);
      }

      return {
        success: false,
        error: 'Fehler beim Erstellen des Tenants',
      };
    }

    // Create advisor firm organization
    let organization;
    try {
      organization = await createOrganization({
        tenantId: tenant.$id,
        type: 'advisor',
        name: validatedData.firmName,
        contactEmail: validatedData.email,
      });
    } catch (error) {
      console.error('Error creating organization:', error);

      // Clean up team (user cleanup requires admin API)
      try {
        await teams.delete(team.$id);
        console.error('User cleanup needed for:', appwriteUser.$id);
      } catch (cleanupError) {
        console.error('Error cleaning up after organization creation failure:', cleanupError);
      }

      return {
        success: false,
        error: 'Fehler beim Erstellen der Organisation',
      };
    }

    // Create user record in database
    try {
      await createUser({
        tenantId: tenant.$id,
        organizationId: organization.$id,
        appwriteUserId: appwriteUser.$id,
        role: 'owner',
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
      });
    } catch (error) {
      console.error('Error creating user record:', error);

      // Clean up team (user cleanup requires admin API)
      try {
        await teams.delete(team.$id);
        console.error('User cleanup needed for:', appwriteUser.$id);
      } catch (cleanupError) {
        console.error('Error cleaning up after user record creation failure:', cleanupError);
      }

      return {
        success: false,
        error: 'Fehler beim Erstellen des Benutzerdatensatzes',
      };
    }

    // Create session for the new user
    try {
      const session = await account.createEmailPasswordSession(
        validatedData.email,
        validatedData.password
      );

      await createSessionCookie(session.$id);
    } catch (error) {
      console.error('Error creating session:', error);
      // Continue anyway - user can log in manually
    }

    return {
      success: true,
      data: {
        subdomain: validatedData.subdomain,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Validierungsfehler: Bitte überprüfen Sie Ihre Eingaben',
      };
    }

    return {
      success: false,
      error: 'Ein unerwarteter Fehler ist aufgetreten',
    };
  }
}

/**
 * Login a user
 *
 * @param formData - Login form data
 * @returns ActionResult with success/error status
 */
export async function login(formData: LoginFormData): Promise<ActionResult> {
  try {
    // Validate form data
    const validatedData = loginSchema.parse(formData);

    // Create Appwrite session
    const account = new Account(client);

    try {
      const session = await account.createEmailPasswordSession(
        validatedData.email,
        validatedData.password
      );

      await createSessionCookie(session.$id);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Login error:', error);

      const err = error as { code?: number };
      if (err.code === 401) {
        return {
          success: false,
          error: 'E-Mail-Adresse oder Passwort ist falsch',
        };
      }

      return {
        success: false,
        error: 'Fehler beim Anmelden',
      };
    }
  } catch (error) {
    console.error('Login validation error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Validierungsfehler: Bitte überprüfen Sie Ihre Eingaben',
      };
    }

    return {
      success: false,
      error: 'Ein unerwarteter Fehler ist aufgetreten',
    };
  }
}

/**
 * Logout the current user
 *
 * @returns void (redirects to login page)
 */
export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}

/**
 * Check if a subdomain is available
 *
 * @param subdomain - The subdomain to check
 * @returns ActionResult with availability status
 */
export async function checkSubdomainAvailability(
  subdomain: string
): Promise<ActionResult<{ available: boolean }>> {
  try {
    // Check if reserved
    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
      return {
        success: true,
        data: {
          available: false,
        },
      };
    }

    // Check if available
    const available = await isSubdomainAvailable(subdomain);

    return {
      success: true,
      data: {
        available,
      },
    };
  } catch (error) {
    console.error('Error checking subdomain availability:', error);

    return {
      success: false,
      error: 'Fehler beim Prüfen der Subdomain-Verfügbarkeit',
    };
  }
}
