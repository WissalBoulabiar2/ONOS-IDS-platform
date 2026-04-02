'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <Navigation />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                Account Recovery
              </Badge>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
                Operator Access
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Reset Operator Password
            </h1>
            <p className="mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
              This recovery page is prepared for the future authentication backend. It will later
              trigger a secure reset workflow for admin, operator, and viewer accounts.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-semibold">Secure recovery</p>
                  <p className="mt-1 text-sm text-slate-300">
                    The final implementation will use backend validation, email tokens, and account
                    auditing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <KeyRound className="mt-0.5 h-5 w-5 text-cyan-300" />
                <div>
                  <p className="font-semibold">Platform roles</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Recovery will support administrator, operator, and viewer sessions separately.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-2xl">Password Recovery</CardTitle>
                <CardDescription>
                  Enter your operator email to simulate a password reset request.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
                    <p className="text-xl font-semibold">Reset Request Sent</p>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      A future backend workflow will send a secure reset link to{' '}
                      <span className="font-medium">{email}</span>.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <Button asChild className="bg-cyan-600 text-white hover:bg-cyan-700">
                        <Link href="/login">Return To Login</Link>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSubmitted(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Submit Another Email
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Operator Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="operator@platformsdn.local"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-cyan-600 text-white hover:bg-cyan-700"
                    >
                      Request Password Reset
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-sm font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </Link>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
