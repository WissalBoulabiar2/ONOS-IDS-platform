// PlatformSDN/services/api-optimized.ts - Optimized API service with caching
import axios, { AxiosInstance } from 'axios';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APIService {
  private client: AxiosInstance;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private requestCache: Map<string, Promise<any>> = new Map();

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
    });

    // Add interceptors
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        throw error;
      }
    );
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  private setToken(token: string): void {
    try {
      localStorage.setItem('auth_token', token);
    } catch {
      console.error('[API] Failed to store token');
    }
  }

  private logout(): void {
    try {
      localStorage.removeItem('auth_token');
    } catch {
      console.error('[API] Failed to clear token');
    }
  }

  // Cache management
  private getCacheKey(method: string, url: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramStr}`;
  }

  private isCacheValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl * 1000;
  }

  async getWithCache<T>(url: string, ttlSeconds: number = 300, params?: any): Promise<T> {
    const cacheKey = this.getCacheKey('GET', url, params);

    // Check in-memory cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('[API Cache] Hit:', url);
      return cached.data;
    }

    // Check request deduplication
    if (this.requestCache.has(cacheKey)) {
      console.log('[API Dedup] Waiting for pending request:', url);
      return this.requestCache.get(cacheKey);
    }

    // Make request
    const request = this.client.get<T>(url, { params }).then((res) => {
      this.cache.set(cacheKey, {
        data: res.data,
        timestamp: Date.now(),
        ttl: ttlSeconds,
      });
      this.requestCache.delete(cacheKey);
      return res.data;
    });

    this.requestCache.set(cacheKey, request);
    return request;
  }

  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      console.log('[API Cache] Cleared all');
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
    console.log('[API Cache] Invalidated:', pattern);
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const response = await this.client.post('/auth/login', { username, password });
    this.setToken(response.data.token);
    return response.data;
  }

  async register(userData: any): Promise<{ token: string; user: any }> {
    const response = await this.client.post('/auth/register', userData);
    this.setToken(response.data.token);
    return response.data;
  }

  async getCurrentUser(): Promise<any> {
    return this.getWithCache('/auth/me', 600);
  }

  // ONOS endpoints with caching
  async getDevices(forceRefresh: boolean = false): Promise<any[]> {
    if (forceRefresh) {
      this.invalidateCache('devices');
    }
    return this.getWithCache('/onos/devices', 30);
  }

  async getLinks(forceRefresh: boolean = false): Promise<any[]> {
    if (forceRefresh) {
      this.invalidateCache('links');
    }
    return this.getWithCache('/onos/links', 30);
  }

  async getFlows(forceRefresh: boolean = false): Promise<any[]> {
    if (forceRefresh) {
      this.invalidateCache('flows');
    }
    return this.getWithCache('/onos/flows', 60);
  }

  async getIntents(forceRefresh: boolean = false): Promise<any[]> {
    if (forceRefresh) {
      this.invalidateCache('intents');
    }
    return this.getWithCache('/onos/intents', 60);
  }

  // Users endpoints
  async getAllUsers(): Promise<any[]> {
    return this.getWithCache('/users', 120);
  }

  async createUser(userData: any): Promise<any> {
    const response = await this.client.post('/users', userData);
    this.invalidateCache('users');
    return response.data;
  }

  async updateUser(id: string, userData: any): Promise<any> {
    const response = await this.client.patch(`/users/${id}`, userData);
    this.invalidateCache('users');
    return response.data;
  }

  async deleteUser(id: string): Promise<any> {
    const response = await this.client.delete(`/users/${id}`);
    this.invalidateCache('users');
    return response.data;
  }

  // Health check
  async getHealth(): Promise<any> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch {
      return { status: 'error', database: 'disconnected' };
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const apiService = new APIService();
export default APIService;
