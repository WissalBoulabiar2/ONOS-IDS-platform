'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  Mail,
  MessageSquare,
  Server,
  ShieldCheck,
} from 'lucide-react';

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    controller: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                  Operator Support
                </Badge>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
                  SDN Platform
                </Badge>
              </div>
              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Contact And Operations Support
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Use this page to contact the platform team about ONOS connectivity, topology issues,
                flow provisioning, account access, or frontend anomalies.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[280px]">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Support scope</p>
              <p className="mt-2 text-lg font-semibold">
                Frontend, backend, ONOS, and operator access
              </p>
              <p className="mt-2 text-sm text-slate-300">
                This form is currently mock-only and ready for backend integration in a future
                sprint.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-2xl">Open A Support Request</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
                    <h2 className="text-2xl font-bold">Request Registered</h2>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      Your support request has been recorded in the mock workflow. Later, this
                      action will create a backend ticket and notify operators in real time.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <Button asChild className="bg-cyan-600 text-white hover:bg-cyan-700">
                        <Link href="/configuration">
                          Review Platform Settings
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsSubmitted(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Send Another Request
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(event) => handleInputChange('fullName', event.target.value)}
                          placeholder="Network operator"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(event) => handleInputChange('email', event.target.value)}
                          placeholder="operator@platformsdn.local"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="controller">Controller / Device</Label>
                        <Input
                          id="controller"
                          value={formData.controller}
                          onChange={(event) => handleInputChange('controller', event.target.value)}
                          placeholder="onos-cluster-1 or of:0000000000000001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(event) => handleInputChange('subject', event.target.value)}
                          placeholder="Topology mismatch or flow deployment issue"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(event) => handleInputChange('message', event.target.value)}
                        placeholder="Describe the issue, expected behavior, and any related flow rule or device identifier."
                        className="min-h-36"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This form is prepared for future API integration and ticket persistence.
                      </p>
                      <Button type="submit" className="bg-cyan-600 text-white hover:bg-cyan-700">
                        Submit Request
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-xl">Support Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                  <Headphones className="mt-0.5 h-4 w-4 text-cyan-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Operations Desk</p>
                    <p>Use this route for topology, alerts, and dashboard incidents.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                  <Server className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">ONOS Controller</p>
                    <p>Include the controller or device identifier when reporting an issue.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-violet-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Account Support</p>
                    <p>
                      Password recovery and operator access flows will be linked to the auth backend
                      later.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-xl">Direct Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                  <Mail className="h-4 w-4 text-cyan-500" />
                  <span>support@platformsdn.local</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                  <MessageSquare className="h-4 w-4 text-cyan-500" />
                  <span>Internal channel: SDN-OPS</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
