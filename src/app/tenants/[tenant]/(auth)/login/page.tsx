'use client';

/**
 * Tenant Login Page
 *
 * This page allows users to log in to their tenant account.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/actions/auth';
import type { LoginFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData);

    if (result.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setError(result.error || 'Anmeldung fehlgeschlagen');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Anmelden
            </CardTitle>
            <CardDescription className="text-center">
              Melden Sie sich bei Ihrem Konto an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

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
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Passwort</Label>
                  <a
                    href="/passwort-vergessen"
                    className="text-xs text-primary hover:underline"
                  >
                    Passwort vergessen?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              Sie haben noch kein Konto?
            </div>
            <div className="text-sm text-center">
              <a
                href="https://belegboost.de/registrieren"
                className="text-primary hover:underline font-medium"
              >
                Jetzt Konto erstellen
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
