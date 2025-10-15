'use client';

/**
 * Tax Advisor Registration Page
 *
 * This page allows tax advisors to register and create their tenant account.
 */

import { useState } from 'react';
import { registerTaxAdvisor, checkSubdomainAvailability } from '@/actions/auth';
import type { RegistrationFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, XCircle } from 'lucide-react';

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
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);

  const handleSubdomainCheck = async (subdomain: string) => {
    if (subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setIsCheckingSubdomain(true);
    try {
      const result = await checkSubdomainAvailability(subdomain);
      if (result.success && result.data) {
        setSubdomainAvailable(result.data.available);
      }
    } finally {
      setIsCheckingSubdomain(false);
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
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Steuerberater-Konto erstellen
            </CardTitle>
            <CardDescription className="text-center">
              Registrieren Sie Ihre Steuerkanzlei für BelegBoost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">{errors.form}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="firmName">Firmenname</Label>
                <Input
                  id="firmName"
                  name="firmName"
                  type="text"
                  required
                  placeholder="Meine Steuerkanzlei GmbH"
                  value={formData.firmName}
                  onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="relative">
                  <Input
                    id="subdomain"
                    name="subdomain"
                    type="text"
                    required
                    placeholder="meine-kanzlei"
                    value={formData.subdomain}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      setFormData({ ...formData, subdomain: value });
                      handleSubdomainCheck(value);
                    }}
                    className="pr-10"
                  />
                  {isCheckingSubdomain && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                  {!isCheckingSubdomain && subdomainAvailable !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {subdomainAvailable ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ihre URL: {formData.subdomain || 'subdomain'}.belegboost.de
                </p>
                {!isCheckingSubdomain && subdomainAvailable !== null && (
                  <p className={`text-xs ${subdomainAvailable ? 'text-green-600' : 'text-destructive'}`}>
                    {subdomainAvailable ? '✓ Subdomain verfügbar' : '✗ Subdomain bereits vergeben'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Max"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Mustermann"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="max@meine-kanzlei.de"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Mind. 8 Zeichen, inkl. Groß-/Kleinbuchstaben, Zahl und Sonderzeichen
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, acceptTerms: checked === true })
                  }
                  required
                />
                <Label
                  htmlFor="acceptTerms"
                  className="text-sm font-normal leading-tight cursor-pointer"
                >
                  Ich akzeptiere die{' '}
                  <a href="/datenschutz" className="text-primary hover:underline">
                    Nutzungsbedingungen
                  </a>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || (subdomainAvailable === false)}
                className="w-full"
              >
                {isLoading ? 'Registrierung läuft...' : 'Konto erstellen'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Bereits ein Konto?{' '}
              <a href="/" className="text-primary hover:underline">
                Zur Anmeldung
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
