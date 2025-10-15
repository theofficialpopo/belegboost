'use client';

/**
 * Tax Advisor Registration Page
 *
 * This page allows tax advisors to register and create their tenant account.
 */

import { useState } from 'react';
import { registerTaxAdvisor, checkSubdomainAvailability } from '@/actions/auth';
import type { RegistrationFormData } from '@/lib/validations/auth';

export default function RegistrationPage() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    firmName: '',
    subdomain: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  const handleSubdomainCheck = async (subdomain: string) => {
    if (subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    const result = await checkSubdomainAvailability(subdomain);
    if (result.success && result.data) {
      setSubdomainAvailable(result.data.available);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = await registerTaxAdvisor(formData);

    if (result.success && result.data) {
      // Redirect to subdomain login page
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const subdomainUrl = baseUrl.replace('://', `://${result.data.subdomain}.`);
      window.location.href = `${subdomainUrl}/dashboard`;
    } else {
      setErrors({ form: result.error || 'Registration failed' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Steuerberater-Konto erstellen
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Registrieren Sie Ihre Steuerkanzlei für BelegBoost
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errors.form}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="firmName" className="sr-only">Firmenname</label>
              <input
                id="firmName"
                name="firmName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Firmenname"
                value={formData.firmName}
                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="subdomain" className="sr-only">Subdomain</label>
              <input
                id="subdomain"
                name="subdomain"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="subdomain (z.B. meine-kanzlei)"
                value={formData.subdomain}
                onChange={(e) => {
                  setFormData({ ...formData, subdomain: e.target.value.toLowerCase() });
                  handleSubdomainCheck(e.target.value.toLowerCase());
                }}
              />
              {subdomainAvailable !== null && (
                <p className={`text-xs mt-1 ${subdomainAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {subdomainAvailable ? '✓ Verfügbar' : '✗ Bereits vergeben'}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="firstName" className="sr-only">Vorname</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Vorname"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="sr-only">Nachname</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nachname"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">E-Mail</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="E-Mail-Adresse"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Passwort</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Passwort"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Passwort bestätigen</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Passwort bestätigen"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              required
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
              Ich akzeptiere die <a href="/datenschutz" className="text-indigo-600 hover:text-indigo-500">Nutzungsbedingungen</a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Registrierung läuft...' : 'Registrieren'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
