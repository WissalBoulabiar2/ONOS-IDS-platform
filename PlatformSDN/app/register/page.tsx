'use client';

import type React from 'react';

import Navigation from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Eye, EyeOff, KeyRound, Layers3, ShieldCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    agreeToTerms: false,
    requireMfa: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.username ||
      !formData.password
    ) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: `${formData.firstName} ${formData.lastName}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      // Success - redirect to login
      window.location.href = '/login?registered=true';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navigation />

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4 py-12 dark:from-gray-900 dark:to-gray-950 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
              <UserPlus className="h-8 w-8 text-cyan-600" />
            </div>
            <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-white">
              Create Operator Account
            </h2>
            <p className="mt-2 font-sans text-gray-600 dark:text-gray-400">
              Provision a new access profile for the SDN supervision platform.
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-2xl font-serif font-bold">Access Provisioning</CardTitle>
              <CardDescription className="font-sans">
                Define identity, role, and security options for the new platform user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Hafidha"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Sabbar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="operator@sdn.local"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="onos-operator"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Access role
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                      <SelectValue placeholder="Select the user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 pr-10 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholder="Create a secure password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 pr-10 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholder="Confirm the password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        handleInputChange('agreeToTerms', checked as boolean)
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor="agreeToTerms"
                      className="text-sm leading-relaxed text-gray-600 dark:text-gray-400"
                    >
                      I confirm that this account is authorized to access the SDN control platform
                      and follow internal access policies.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="requireMfa"
                      checked={formData.requireMfa}
                      onCheckedChange={(checked) =>
                        handleInputChange('requireMfa', checked as boolean)
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor="requireMfa"
                      className="text-sm leading-relaxed text-gray-600 dark:text-gray-400"
                    >
                      Require additional verification for this account when backend authentication
                      is enabled.
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!formData.agreeToTerms || isLoading}
                  className="w-full rounded-lg bg-cyan-600 px-4 py-3 text-sm font-medium text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Create Platform User'}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Already have an account?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full border-cyan-600 bg-transparent text-cyan-600 hover:bg-cyan-50"
                    >
                      Return To Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-900/80">
              <div className="mb-2 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Roles</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Admin, operator, and viewer profiles
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-900/80">
              <div className="mb-2 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <Layers3 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Scope</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Topology, devices, flows, and alerts
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-900/80">
              <div className="mb-2 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <KeyRound className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Security</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Prepared for future JWT and MFA support
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 py-16 text-white dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-2xl font-serif font-black text-cyan-400">SDN Platform</h3>
              <p className="mb-4 font-sans text-gray-400">
                Web platform for centralized control, monitoring, and supervision of ONOS-managed
                SDN environments.
              </p>
              <div className="text-sm font-sans text-gray-400">
                <p>Access profiles for internal operators</p>
                <p>Prepared for JWT-based authentication</p>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-serif font-bold">Platform</h4>
              <ul className="space-y-2 font-sans text-gray-400">
                <li>
                  <Link href="/" className="transition-colors hover:text-cyan-400">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/devices" className="transition-colors hover:text-cyan-400">
                    Devices
                  </Link>
                </li>
                <li>
                  <Link href="/topology" className="transition-colors hover:text-cyan-400">
                    Topology
                  </Link>
                </li>
                <li>
                  <Link href="/alerts" className="transition-colors hover:text-cyan-400">
                    Alerts
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-serif font-bold">Access</h4>
              <ul className="space-y-2 font-sans text-gray-400">
                <li>
                  <Link href="/login" className="transition-colors hover:text-cyan-400">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="transition-colors hover:text-cyan-400">
                    New Operator
                  </Link>
                </li>
                <li>
                  <Link href="/configuration" className="transition-colors hover:text-cyan-400">
                    Controller Settings
                  </Link>
                </li>
                <li>
                  <Link href="/forgot-password" className="transition-colors hover:text-cyan-400">
                    Password Recovery
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-serif font-bold">Deployment</h4>
              <div className="space-y-2 font-sans text-gray-400">
                <p>Frontend: Next.js interface</p>
                <p>Controller: ONOS REST API</p>
                <p>Status: Frontend-first implementation</p>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center">
            <p className="font-sans text-gray-400">
              © 2024 SDN Platform. Account provisioning interface for the ONOS-based supervision
              environment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
