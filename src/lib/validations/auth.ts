/**
 * Authentication validation schemas using Zod
 *
 * These schemas validate registration, login, and invitation forms
 */

import { z } from 'zod';

/**
 * Subdomain validation regex
 * - Must start and end with alphanumeric character
 * - Can contain hyphens in the middle
 * - Min 3 characters, max 63 characters (DNS limit)
 * - Lowercase only
 */
const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;

/**
 * Password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

/**
 * Tax advisor registration schema
 */
export const registrationSchema = z.object({
  // Firm details
  firmName: z.string()
    .min(2, 'Firmenname muss mindestens 2 Zeichen lang sein')
    .max(200, 'Firmenname darf maximal 200 Zeichen lang sein')
    .trim(),

  subdomain: z.string()
    .min(3, 'Subdomain muss mindestens 3 Zeichen lang sein')
    .max(63, 'Subdomain darf maximal 63 Zeichen lang sein')
    .regex(subdomainRegex, 'Subdomain darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten')
    .toLowerCase()
    .trim(),

  // Owner details
  firstName: z.string()
    .min(1, 'Vorname ist erforderlich')
    .max(100, 'Vorname darf maximal 100 Zeichen lang sein')
    .trim(),

  lastName: z.string()
    .min(1, 'Nachname ist erforderlich')
    .max(100, 'Nachname darf maximal 100 Zeichen lang sein')
    .trim(),

  email: z.string()
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .max(128, 'Passwort darf maximal 128 Zeichen lang sein')
    .regex(passwordRegex, 'Passwort muss Groß- und Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten'),

  confirmPassword: z.string(),

  acceptTerms: z.boolean()
    .refine((val) => val === true, 'Sie müssen den Nutzungsbedingungen zustimmen'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(1, 'Passwort ist erforderlich'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Client invitation schema
 */
export const invitationSchema = z.object({
  email: z.string()
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein')
    .toLowerCase()
    .trim(),

  firstName: z.string()
    .min(1, 'Vorname ist erforderlich')
    .max(100, 'Vorname darf maximal 100 Zeichen lang sein')
    .trim(),

  lastName: z.string()
    .min(1, 'Nachname ist erforderlich')
    .max(100, 'Nachname darf maximal 100 Zeichen lang sein')
    .trim(),

  role: z.enum(['client_admin', 'client_employee'], {
    errorMap: () => ({ message: 'Bitte wählen Sie eine gültige Rolle' }),
  }),

  organizationId: z.string()
    .min(1, 'Organisation ist erforderlich'),
});

export type InvitationFormData = z.infer<typeof invitationSchema>;

/**
 * Accept invitation schema
 */
export const acceptInvitationSchema = z.object({
  invitationToken: z.string()
    .min(1, 'Einladungstoken ist erforderlich'),

  password: z.string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .max(128, 'Passwort darf maximal 128 Zeichen lang sein')
    .regex(passwordRegex, 'Passwort muss Groß- und Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten'),

  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: z.string()
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein')
    .toLowerCase()
    .trim(),
});

export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  token: z.string()
    .min(1, 'Token ist erforderlich'),

  password: z.string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .max(128, 'Passwort darf maximal 128 Zeichen lang sein')
    .regex(passwordRegex, 'Passwort muss Groß- und Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten'),

  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
