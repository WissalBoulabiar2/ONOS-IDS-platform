"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sdnApi, type VplsServiceItem } from "@/services/api"
import {
  Cable,
  Layers3,
  Plus,
  RefreshCw,
  Router,
  Trash2,
} from "lucide-react"

export default function ServicesPage() {
  const [services, setServices] = useState<VplsServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedService, setSelectedService] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [source, setSource] = useState<"onos">("onos")

  const [serviceName, setServiceName] = useState("VPLS-CORP")
  const [encapsulation, setEncapsulation] = useState("VLAN")
  const [interfaceName, setInterfaceName] = useState("site-a")
  const [connectPoint, setConnectPoint] = useState("of:0000000000000001/1")
  const [ips, setIps] = useState("10.0.1.1/24")
  const [mac, setMac] = useState("00:04:00:00:00:02")
  const [vlan, setVlan] = useState("100")

  const fetchServices = useCallback(async (background = false) => {
    try {
      if (background) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError(null)
      const data = await sdnApi.getVplsServices()
      setServices(data.vpls)
      setSource(data.source)
      setSelectedService((current) => current || data.vpls[0]?.name || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch VPLS services")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
    const interval = setInterval(() => {
      fetchServices(true)
    }, 8000)

    return () => clearInterval(interval)
  }, [fetchServices])

  const totalInterfaces = useMemo(
    () => services.reduce((sum, service) => sum + (service.interfaces?.length || 0), 0),
    [services]
  )

  const activeService = useMemo(
    () => services.find((service) => service.name === selectedService) || null,
    [services, selectedService]
  )

  const handleCreateService = async () => {
    try {
      setSubmitting(true)
      setError(null)
      setMessage(null)

      await sdnApi.createVplsService({
        vpls: [
          {
            name: serviceName,
            encapsulation,
          },
        ],
      })

      setMessage(`VPLS service ${serviceName} created successfully.`)
      await fetchServices(true)
      setSelectedService(serviceName)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create VPLS service")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteService = async (name: string) => {
    try {
      setSubmitting(true)
      setError(null)
      setMessage(null)
      await sdnApi.deleteVplsService(name)
      setMessage(`VPLS service ${name} deleted successfully.`)
      if (selectedService === name) {
        setSelectedService("")
      }
      await fetchServices(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete VPLS service")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddInterface = async () => {
    if (!selectedService) {
      setError("Select a VPLS service before adding an interface.")
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setMessage(null)

      await sdnApi.addVplsInterface(selectedService, {
        interfaces: [
          {
            name: interfaceName,
            "connect point": connectPoint,
            ips: ips
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
            mac: mac.trim() || undefined,
            vlan: vlan.trim() || undefined,
          },
        ],
      })

      setMessage(`Interface ${interfaceName} added to ${selectedService}.`)
      await fetchServices(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add VPLS interface")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteInterface = async (serviceNameValue: string, interfaceNameValue: string) => {
    try {
      setSubmitting(true)
      setError(null)
      setMessage(null)
      await sdnApi.deleteVplsInterface(serviceNameValue, interfaceNameValue)
      setMessage(`Interface ${interfaceNameValue} removed from ${serviceNameValue}.`)
      await fetchServices(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete VPLS interface")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthenticatedShell contentClassName="max-w-7xl">
        <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-sky-400/20 bg-sky-400/10 text-sky-100">Service Orchestration</Badge>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
                  {source === "onos" ? "Live ONOS VPLS" : source}
                </Badge>
              </div>
              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">VPLS Services</h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Manage Layer 2 virtual private LAN services directly from the platform using ONOS VPLS REST APIs.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[320px]">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-sky-100">Service inventory</p>
              <p className="text-2xl font-semibold">{services.length} service(s)</p>
              <p className="mt-2 text-sm text-slate-300">{totalInterfaces} interface(s) mapped across all VPLS services</p>
              <Button
                onClick={() => fetchServices(true)}
                variant="outline"
                className="mt-4 w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                disabled={refreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh services
              </Button>
            </div>
          </div>
        </section>

        {(error || message) && (
          <div
            className={`mb-8 rounded-2xl border p-4 ${
              error
                ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard title="Services" value={services.length} icon={<Layers3 className="h-5 w-5 text-sky-600 dark:text-sky-400" />} />
          <MetricCard title="Interfaces" value={totalInterfaces} icon={<Cable className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />} />
          <MetricCard title="Selected" value={activeService?.interfaces?.length || 0} icon={<Router className="h-5 w-5 text-violet-600 dark:text-violet-400" />} />
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="space-y-8 xl:col-span-2">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle>Existing VPLS Services</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading services...</div>
                ) : services.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    No VPLS service returned by ONOS yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.name}
                        className={`rounded-3xl border p-5 ${
                          selectedService === service.name
                            ? "border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/20"
                            : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-sky-600 text-white hover:bg-sky-600">{service.name}</Badge>
                              <Badge variant="outline">{service.encapsulation || "Encapsulation N/A"}</Badge>
                              <Badge variant="outline">{service.interfaces?.length || 0} interface(s)</Badge>
                            </div>

                            {(service.interfaces || []).length > 0 ? (
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {(service.interfaces || []).map((serviceInterface) => (
                                  <div key={serviceInterface.name} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-semibold">{serviceInterface.name}</p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                          {serviceInterface["connect point"]}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                          VLAN {serviceInterface.vlan || "N/A"} • {serviceInterface.mac || "MAC N/A"}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="p-1 text-gray-500 hover:text-red-500"
                                        onClick={() => handleDeleteInterface(service.name, serviceInterface.name)}
                                        disabled={submitting}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No interfaces configured yet.</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedService(service.name)}
                              className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              Select
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDeleteService(service.name)}
                              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
                              disabled={submitting}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle>Create VPLS Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Service Name</Label>
                  <Input value={serviceName} onChange={(event) => setServiceName(event.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">Encapsulation</Label>
                  <Input value={encapsulation} onChange={(event) => setEncapsulation(event.target.value)} />
                </div>
                <Button className="w-full bg-sky-600 hover:bg-sky-700" onClick={handleCreateService} disabled={submitting}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create VPLS
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle>Add Interface To Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Selected Service</Label>
                  <Input value={selectedService} onChange={(event) => setSelectedService(event.target.value)} placeholder="Select or type a VPLS service name" />
                </div>
                <div>
                  <Label className="mb-2 block">Interface Name</Label>
                  <Input value={interfaceName} onChange={(event) => setInterfaceName(event.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">Connect Point</Label>
                  <Input value={connectPoint} onChange={(event) => setConnectPoint(event.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">IPs</Label>
                  <Input value={ips} onChange={(event) => setIps(event.target.value)} placeholder="10.0.1.1/24,10.0.1.2/24" />
                </div>
                <div>
                  <Label className="mb-2 block">MAC</Label>
                  <Input value={mac} onChange={(event) => setMac(event.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">VLAN</Label>
                  <Input value={vlan} onChange={(event) => setVlan(event.target.value)} />
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleAddInterface} disabled={submitting}>
                  <Cable className="mr-2 h-4 w-4" />
                  Add Interface
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
    </AuthenticatedShell>
  )
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between">
          {icon}
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{title}</span>
        </div>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
