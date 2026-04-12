'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyMfa } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (mfaRequired) {
        // Step 2 : vérifie le code TOTP
        await verifyMfa(mfaToken, mfaCode);
        router.replace('/dashboard');
        return;
      }

      // Step 1 : login normal
      const result = await login({ identifier, password, rememberMe });

      if (result.mfa_required && result.mfa_token) {
        setMfaToken(result.mfa_token);
        setMfaRequired(true);
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f7fb_0%,#eaf0f7_100%)] px-6 py-10 dark:bg-[linear-gradient(180deg,#08111d_0%,#0c1728_100%)] sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <Card className="w-full max-w-md rounded-[2rem] border-slate-200 bg-white/92 shadow-[0_32px_90px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-black/40">
          <CardContent className="p-8 sm:p-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-700">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                {mfaRequired ? 'Two-Factor Auth' : 'NetGuard SOC'}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {mfaRequired
                  ? 'Enter the 6-digit code from your authenticator app'
                  : 'Sign in to continue to your workspace.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!mfaRequired ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email or username
                    </Label>
                    <Input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="admin@sdn.local"
                      className="h-12 border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="h-12 border-slate-300 bg-white pr-11 dark:border-slate-700 dark:bg-slate-900"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
                        onClick={() => setShowPassword((c) => !c)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(c) => setRememberMe(Boolean(c))}
                    />
                    <Label htmlFor="remember-me" className="text-sm text-slate-600 dark:text-slate-400">
                      Keep session active
                    </Label>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="mfa-code" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Authentication Code
                  </Label>
                  <Input
                    id="mfa-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="h-12 text-center text-2xl tracking-[0.5em] border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setMfaRequired(false); setMfaCode(''); }}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    ← Back to login
                  </button>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-12 w-full bg-cyan-700 text-white hover:bg-cyan-800"
                disabled={loading}
              >
                {loading ? 'Signing in...' : mfaRequired ? 'Verify Code' : 'Login'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}