'use client';

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN_COOKIE = 'sdn_token';
const AUTH_ROLE_COOKIE = 'sdn_role';

export interface ApiHealthResponse {
  status: 'OK' | 'DEGRADED' | 'ERROR';
  message: string;
  timestamp: string;
  onos?: {
    connected: boolean;
    error: string | null;
    url: string;
  };
  database?: {
    connected: boolean;
    error: string | null;
  };
  auth?: {
    jwtConfigured: boolean;
    bootstrapAdmin: string;
    databaseBacked: boolean;
    localStoreBacked?: boolean;
  };
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'operator' | 'viewer';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: AuthUser;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: 'admin' | 'operator' | 'viewer';
}

export interface ApiDevice {
  id: string;
  type: string;
  available: boolean;
  manufacturer?: string;
  serialNumber?: string;
  port?: string;
}

export interface ApiDevicesResponse {
  total: number;
  source?: 'database' | 'onos';
  devices: ApiDevice[];
}

export interface ApiPort {
  portNumber: number;
  portSpeed?: string | number | null;
  enabled: boolean;
  live: boolean;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
}

export interface ApiPortsResponse {
  deviceId: string;
  total: number;
  source?: 'database' | 'onos';
  ports: ApiPort[];
}

export type TopologySourceMode = 'onos' | 'database' | 'auto';
export type TopologyLayoutMode = 'cose' | 'breadthfirst' | 'circle';

export interface TopologyNode {
  id: string;
  label: string;
  type: 'switch' | 'router' | 'host';
  available?: boolean;
  status: 'active' | 'inactive';
  manufacturer?: string | null;
  serialNumber?: string | null;
  hwVersion?: string | null;
  swVersion?: string | null;
  mac?: string | null;
  vlan?: string | null;
  ipAddresses?: string[];
  location?: string | null;
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  status: 'active' | 'inactive';
  sourcePort?: string | null;
  targetPort?: string | null;
  kind?: 'infrastructure' | 'access';
  utilization?: number | null;
  throughput?: number | null;
  loadState?: 'nominal' | 'warm' | 'hot' | 'unknown';
}

export interface TopologyResponse {
  source: 'database' | 'onos';
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface TopologyPathResponse {
  source: 'onos';
  src: string;
  dst: string;
  total: number;
  paths: Array<{
    id: string;
    cost: number | null;
    hops: number;
    summary: string;
    nodes: string[];
    edgeRefs: string[];
  }>;
}

export interface ApiFlow {
  id: string;
  flowId: string;
  deviceId: string;
  appId?: string;
  priority: number;
  tableId?: number;
  state: string;
  selector?: {
    criteria?: Array<Record<string, unknown>>;
  };
  treatment?: {
    instructions?: Array<Record<string, unknown>>;
  };
}

export interface ApiFlowsResponse {
  total: number;
  source?: 'database' | 'onos';
  flows: ApiFlow[];
}

export interface DashboardStatsResponse {
  source: 'database' | 'onos';
  timestamp: string;
  stats: {
    total_devices: number;
    online_devices: number;
    offline_devices: number;
    total_ports: number;
    live_ports: number;
    enabled_ports: number;
    total_flows: number;
    active_alerts: number;
    active_links: number;
  };
}

export interface DeviceMetricsResponse {
  source: 'database' | 'onos';
  metrics: Array<{
    device_id: string;
    type: string;
    available: boolean;
    live_ports: number;
    enabled_ports: number;
    total_ports: number;
    total_rx_bytes: number;
    total_tx_bytes: number;
    last_updated: string;
  }>;
}

export interface ApiAlert {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  deviceId: string | null;
  message: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

export interface AlertsResponse {
  source: 'database' | 'onos' | 'local-store';
  total: number;
  summary: {
    total: number;
    open: number;
    resolved: number;
    critical: number;
    warning: number;
    info: number;
  };
  alerts: ApiAlert[];
}

export interface DashboardOverviewResponse {
  source: 'onos';
  controller: {
    version: string;
    build: string | null;
    uptime: string | null;
    system: {
      node: string | null;
      clusterId: string | null;
      os: string | null;
      javaVersion: string | null;
      processors: number | null;
      totalMemoryMb: number | null;
      usedMemoryMb: number | null;
      freeMemoryMb: number | null;
      usedMemoryPercent: number | null;
      threadsLive: number | null;
      threadsDaemon: number | null;
      devices: number | null;
      links: number | null;
      hosts: number | null;
      flows: number | null;
    };
  };
  cluster: {
    total: number;
    online: number;
    nodes: Array<{
      id: string;
      ip: string | null;
      state: string;
    }>;
  };
  applications: {
    total: number;
    active: number;
    items: Array<{
      name: string;
      state: string;
      version: string | null;
      health: Record<string, unknown> | null;
    }>;
  };
  hosts: {
    total: number;
  };
  intents: {
    summary: Record<string, unknown>;
  };
  mastership: {
    totalDevices: number;
    sampledDevices: number;
    resolvedDevices: number;
    unresolvedDevices: number;
    leaders: Array<{
      controller: string;
      devices: number;
      online: boolean | null;
    }>;
    devices: Array<{
      deviceId: string;
      master: string | null;
      available: boolean;
    }>;
  };
  observability: {
    totalMetrics: number;
    timers: number;
    counters: number;
    gauges: number;
    meters: number;
    histograms: number;
    highlighted: Array<{
      name: string;
      kind: string;
      counter: number | null;
      meanRate: number | null;
      max: number | null;
    }>;
  };
  vpls: {
    totalServices: number;
    totalInterfaces: number;
    encapsulations: Array<{
      name: string;
      count: number;
    }>;
    services: Array<{
      name: string;
      encapsulation: string | null;
      interfaces: number;
    }>;
  };
}

export interface LinkLoadResponse {
  source: 'onos';
  total: number;
  links: Array<{
    id: string;
    device: string;
    port: string;
    utilization: number | null;
    raw: Record<string, unknown>;
  }>;
}

export interface VplsInterfacePayload {
  name: string;
  'connect point': string;
  ips?: string[];
  mac?: string;
  vlan?: string;
}

export interface VplsServiceItem {
  name: string;
  encapsulation?: string;
  interfaces?: VplsInterfacePayload[];
}

export interface VplsResponse {
  source: 'onos';
  total: number;
  vpls: VplsServiceItem[];
}

// NEW: Cluster Health Types
export interface ClusterHealthResponse {
  source: 'onos';
  timestamp: string;
  cluster: {
    totalNodes: number;
    onlineNodes: number;
    offlineNodes: number;
    masterNode: string | null;
    nodes: Array<{
      id: string;
      ip: string;
      status: string;
      lastUpdated: string | null;
    }>;
  };
}

// NEW: ONOS Applications Types
export interface ApplicationsResponse {
  source: 'onos';
  timestamp: string;
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
  applications: Array<{
    id: string;
    name: string;
    state: string;
    category?: string | null;
    version?: string | null;
    description?: string | null;
    origin?: string | null;
    featuresRepo?: string | null;
    features?: string[];
    permissions?: string[];
    requiredApps?: string[];
  }>;
}

// NEW: ONOS Intents Types
export interface IntentsResponse {
  source: 'onos';
  timestamp: string;
  summary: {
    total: number;
    installed: number;
    failed: number;
    other: number;
  };
  intents: Array<{
    id: string;
    type: string;
    state: string;
    appId: string;
  }>;
}

// NEW: Network Performance Types
export interface NetworkPerformanceResponse {
  source: 'onos';
  timestamp: string;
  summary: {
    totalRxBytes: number;
    totalTxBytes: number;
    totalRxPackets: number;
    totalTxPackets: number;
    linkCount: number;
  };
  throughput: {
    rxBytesPerSec: number;
    txBytesPerSec: number;
  };
  utilization: {
    average: number;
    min: number;
    max: number;
  };
}

// NEW: Network Heatmap Types
export interface NetworkHeatmapResponse {
  source: 'onos';
  timestamp: string;
  topLinks: Array<{
    id: string;
    link: string;
    throughput: number;
    utilization: number;
  }>;
  totalLinks: number;
}

function getAuthToken() {
  return Cookies.get(AUTH_TOKEN_COOKIE) ?? null;
}

function isTokenExpired(token: string | null = null): boolean {
  if (!token) {
    token = getAuthToken();
  }

  if (!token) {
    return true;
  }

  try {
    // Decode JWT payload (format: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }

    // Decode base64url payload
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
    ) as { exp?: number };

    // Check if token is expired (with 5-minute buffer)
    if (!payload.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp - 300 < now; // Refresh if expiring in next 5 minutes
  } catch {
    return true;
  }
}

export function hasAuthSession() {
  return Boolean(getAuthToken());
}

export function persistAuthSession(token: string, role: AuthUser['role'], rememberMe = false) {
  const options = {
    path: '/',
    sameSite: 'lax' as const,
    ...(rememberMe ? { expires: 7 } : {}),
  };

  Cookies.set(AUTH_TOKEN_COOKIE, token, options);
  Cookies.set(AUTH_ROLE_COOKIE, role, options);
}

export function clearAuthSession() {
  Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
  Cookies.remove(AUTH_ROLE_COOKIE, { path: '/' });
}

async function requestJson<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();

  // Check token expiration
  if (requiresAuth && token && isTokenExpired(token)) {
    clearAuthSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?expired=true';
    }
    throw new Error('Session expired');
  }

  if (requiresAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response
    .json()
    .catch(() => ({ error: 'Request failed', message: 'Invalid server response' }));

  if (!response.ok) {
    if (response.status === 401 && requiresAuth && token && typeof window !== 'undefined') {
      clearAuthSession();
      window.location.href = '/login';
    }

    throw new Error(data.message || data.error || 'Request failed');
  }

  return data as T;
}

export const sdnApi = {
  async healthCheck(): Promise<ApiHealthResponse> {
    return requestJson<ApiHealthResponse>('/health', {}, false);
  },

  async login(identifier: string, password: string): Promise<LoginResponse> {
    return requestJson<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      },
      false
    );
  },

  async getCurrentUser(): Promise<{ user: AuthUser }> {
    return requestJson<{ user: AuthUser }>('/auth/me');
  },

  async getUsers(): Promise<{ total: number; users: AuthUser[] }> {
    return requestJson<{ total: number; users: AuthUser[] }>('/users');
  },

  async createUser(payload: CreateUserPayload): Promise<{ message: string; user: AuthUser }> {
    return requestJson<{ message: string; user: AuthUser }>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getDevices(): Promise<ApiDevicesResponse> {
    return requestJson<ApiDevicesResponse>('/devices');
  },

  async getDevicePorts(deviceId: string): Promise<ApiPortsResponse> {
    return requestJson<ApiPortsResponse>(`/devices/${deviceId}/ports`);
  },

  async getTopology(source: TopologySourceMode = 'onos') {
    return requestJson<TopologyResponse>(`/topology?source=${encodeURIComponent(source)}`);
  },

  async getPaths(src: string, dst: string): Promise<TopologyPathResponse> {
    const params = new URLSearchParams({ src, dst });
    return requestJson<TopologyPathResponse>(`/paths?${params.toString()}`);
  },

  async getFlows() {
    return requestJson<ApiFlowsResponse>('/flows');
  },

  async createFlow(deviceId: string, flowData: unknown, appId = 'org.platformsdn.app') {
    return requestJson(`/flows/${deviceId}?appId=${encodeURIComponent(appId)}`, {
      method: 'POST',
      body: JSON.stringify(flowData),
    });
  },

  async deleteFlow(deviceId: string, flowId: string) {
    return requestJson(`/flows/${deviceId}/${flowId}`, {
      method: 'DELETE',
    });
  },

  async getDashboardStats(): Promise<DashboardStatsResponse> {
    return requestJson<DashboardStatsResponse>('/dashboard/stats');
  },

  async getDeviceMetrics(): Promise<DeviceMetricsResponse> {
    return requestJson<DeviceMetricsResponse>('/metrics/devices');
  },

  async getAlerts(params?: {
    status?: 'all' | 'open' | 'resolved';
    severity?: 'all' | 'critical' | 'warning' | 'info';
    limit?: number;
  }): Promise<AlertsResponse> {
    const searchParams = new URLSearchParams();

    if (params?.status) {
      searchParams.set('status', params.status);
    }

    if (params?.severity) {
      searchParams.set('severity', params.severity);
    }

    if (params?.limit) {
      searchParams.set('limit', String(params.limit));
    }

    const query = searchParams.toString();
    return requestJson<AlertsResponse>(`/alerts${query ? `?${query}` : ''}`);
  },

  async resolveAlert(alertId: string): Promise<{ message: string; alert: ApiAlert }> {
    return requestJson<{ message: string; alert: ApiAlert }>(`/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
  },

  async getDashboardOverview(): Promise<DashboardOverviewResponse> {
    return requestJson<DashboardOverviewResponse>('/dashboard/overview');
  },

  async getLinkLoad(): Promise<LinkLoadResponse> {
    return requestJson<LinkLoadResponse>('/dashboard/link-load');
  },

  async getVplsServices(): Promise<VplsResponse> {
    return requestJson<VplsResponse>('/services/vpls');
  },

  async createVplsService(payload: {
    vpls: Array<{ name: string; encapsulation: string; interfaces?: VplsInterfacePayload[] }>;
  }) {
    return requestJson<{ message: string; result: unknown }>('/services/vpls', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteVplsService(name: string) {
    return requestJson<{ message: string }>(`/services/vpls/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  },

  async addVplsInterface(name: string, payload: { interfaces: VplsInterfacePayload[] }) {
    return requestJson<{ message: string; result: unknown }>(
      `/services/vpls/${encodeURIComponent(name)}/interfaces`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async deleteVplsInterface(name: string, interfaceName: string) {
    return requestJson<{ message: string }>(
      `/services/vpls/${encodeURIComponent(name)}/interfaces/${encodeURIComponent(interfaceName)}`,
      {
        method: 'DELETE',
      }
    );
  },

  // NEW: Cluster Health
  async getClusterHealth(): Promise<ClusterHealthResponse> {
    return requestJson<ClusterHealthResponse>('/cluster/health').catch(() => ({
      source: 'onos' as const,
      timestamp: new Date().toISOString(),
      cluster: {
        totalNodes: 0,
        onlineNodes: 0,
        offlineNodes: 0,
        masterNode: null,
        nodes: [],
      },
    }));
  },

  // NEW: ONOS Applications
  async getApplications(): Promise<ApplicationsResponse> {
    return requestJson<ApplicationsResponse>('/onos/applications').catch(() => ({
      source: 'onos' as const,
      timestamp: new Date().toISOString(),
      summary: { total: 0, active: 0, inactive: 0 },
      applications: [],
    }));
  },

  async activateApplication(appId: string) {
    return requestJson<{ message: string; applicationId: string; state: string }>(
      `/onos/applications/${encodeURIComponent(appId)}/activate`,
      {
        method: 'POST',
      }
    );
  },

  async deactivateApplication(appId: string) {
    return requestJson<{ message: string; applicationId: string; state: string }>(
      `/onos/applications/${encodeURIComponent(appId)}/deactivate`,
      {
        method: 'POST',
      }
    );
  },

  // NEW: ONOS Intents
  async getIntents(): Promise<IntentsResponse> {
    return requestJson<IntentsResponse>('/onos/intents').catch(() => ({
      source: 'onos' as const,
      timestamp: new Date().toISOString(),
      summary: { total: 0, installed: 0, failed: 0, other: 0 },
      intents: [],
    }));
  },

  // NEW: Network Performance
  async getNetworkPerformance(): Promise<NetworkPerformanceResponse> {
    return requestJson<NetworkPerformanceResponse>('/network/performance').catch(() => ({
      source: 'onos' as const,
      timestamp: new Date().toISOString(),
      summary: {
        totalRxBytes: 0,
        totalTxBytes: 0,
        totalRxPackets: 0,
        totalTxPackets: 0,
        linkCount: 0,
      },
      throughput: { rxBytesPerSec: 0, txBytesPerSec: 0 },
      utilization: { average: 0, min: 0, max: 0 },
    }));
  },

  // NEW: Network Heatmap
  async getNetworkHeatmap(): Promise<NetworkHeatmapResponse> {
    return requestJson<NetworkHeatmapResponse>('/network/heatmap').catch(() => ({
      source: 'onos' as const,
      timestamp: new Date().toISOString(),
      topLinks: [],
      totalLinks: 0,
    }));
  },
};

export function useONOS() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sdnApi
      .healthCheck()
      .then((health) => {
        setIsConnected(health.status !== 'ERROR');
        setError(health.status === 'DEGRADED' ? health.message : null);
      })
      .catch((err) => {
        setIsConnected(false);
        setError(err.message);
      });
  }, []);

  return { isConnected, error, api: sdnApi };
}
