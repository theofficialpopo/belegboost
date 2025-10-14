/**
 * Tenant type definitions for BelegBoost multi-tenant system
 */

export type TenantStatus = 'active' | 'trial' | 'suspended';

export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Tenant {
  id: string;
  teamId: string; // Appwrite Team ID
  subdomain: string;
  name: string;
  ownerEmail: string;
  branding?: TenantBranding;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantInput {
  subdomain: string;
  name: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface UpdateTenantBrandingInput {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}
