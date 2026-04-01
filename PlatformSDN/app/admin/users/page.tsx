"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sdnApi, type AuthUser, type CreateUserPayload } from "@/services/api"
import { AlertCircle, ShieldCheck, UserCog, UserPlus, Users } from "lucide-react"

const initialForm: CreateUserPayload = {
  username: "",
  email: "",
  fullName: "",
  password: "",
  role: "operator",
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateUserPayload>(initialForm)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await sdnApi.getUsers()
      setUsers(response.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleChange = (field: keyof CreateUserPayload, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      const response = await sdnApi.createUser(formData)
      setSuccessMessage(`${response.user.fullName} created successfully.`)
      setFormData(initialForm)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthenticatedShell contentClassName="max-w-7xl">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">Admin Panel</Badge>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
                  JWT Protected
                </Badge>
              </div>
              <h1 className="mb-3 flex items-center gap-3 text-4xl font-bold tracking-tight sm:text-5xl">
                <UserCog className="h-10 w-10 text-cyan-300" />
                User Access Management
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Create platform users, assign roles, and manage the secured access layer for the SDN control center.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[280px]">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Current session</p>
              <p className="mt-2 text-xl font-semibold">{user?.fullName || "Administrator"}</p>
              <p className="mt-1 text-sm text-slate-300">
                Role: <span className="uppercase tracking-[0.18em]">{user?.role || "admin"}</span>
              </p>
            </div>
          </div>
        </section>

        {(error || successMessage) && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
              error
                ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
            }`}
          >
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{error ? "Action failed" : "User created"}</p>
              <p className="text-sm">{error || successMessage}</p>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Registered Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    Loading users...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Full Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Username</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Email</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Role</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Last Login</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((entry) => (
                          <tr
                            key={entry.id}
                            className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                          >
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{entry.fullName}</td>
                            <td className="px-4 py-3 font-mono text-xs text-cyan-600 dark:text-cyan-400">{entry.username}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{entry.email}</td>
                            <td className="px-4 py-3">
                              <Badge
                                className={
                                  entry.role === "admin"
                                    ? "bg-cyan-600 text-white hover:bg-cyan-600"
                                    : entry.role === "operator"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                }
                              >
                                {entry.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                              {entry.lastLogin ? new Date(entry.lastLogin).toLocaleString() : "Never"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserPlus className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Add User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(event) => handleChange("fullName", event.target.value)}
                      placeholder="Network Operator"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Username</Label>
                    <Input
                      value={formData.username}
                      onChange={(event) => handleChange("username", event.target.value)}
                      placeholder="operator1"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      placeholder="operator@sdn.local"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Password</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(event) => handleChange("password", event.target.value)}
                      placeholder="Create a strong password"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: CreateUserPayload["role"]) => handleChange("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full bg-cyan-600 text-white hover:bg-cyan-700" disabled={submitting}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {submitting ? "Creating..." : "Create User"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
    </AuthenticatedShell>
  )
}
