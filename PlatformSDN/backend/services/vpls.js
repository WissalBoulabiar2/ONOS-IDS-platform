// PlatformSDN/backend/services/vpls.js - VPLS (Virtual Private LAN Service) support
const axios = require('axios');
const config = require('../config');
const cache = require('../cache');
const db = require('../db');

const ONOS_VPLS_URL = `http://${config.ONOS_CONFIG.host}:${config.ONOS_CONFIG.port}/onos/vpls`;

const vplsClient = axios.create({
  baseURL: ONOS_VPLS_URL,
  timeout: 8000,
  auth: {
    username: config.ONOS_CONFIG.user,
    password: config.ONOS_CONFIG.password,
  },
});

class VPLSService {
  // Get all VPLS networks
  async getVPLSNetworks(forceRefresh = false) {
    const cacheKey = 'vpls:networks';

    if (!forceRefresh && cache.has(cacheKey)) {
      console.log('[VPLS Cache] Hit: networks');
      return cache.get(cacheKey);
    }

    try {
      const response = await vplsClient.get('/networks');
      const networks = response.data.networks || [];

      cache.set(cacheKey, networks, 60);
      console.log('[VPLS] Fetched', networks.length, 'networks');

      return networks;
    } catch (error) {
      console.error('[VPLS] Get networks error:', error.message);
      const cached = cache.get(cacheKey);
      if (cached) return cached;
      throw error;
    }
  }

  // Create VPLS network
  async createVPLSNetwork(networkData) {
    try {
      const { name, description, members = [] } = networkData;

      const response = await vplsClient.post('/networks', {
        name,
        description,
        members,
      });

      // Save to database for audit trail
      await db.query(
        `INSERT INTO vpls_networks (name, description, members_count, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [name, description, members.length]
      );

      // Invalidate cache
      cache.delete('vpls:networks');

      return response.data;
    } catch (error) {
      console.error('[VPLS] Create network error:', error.message);
      throw error;
    }
  }

  // Add interface to VPLS
  async addInterfaceToVPLS(networkName, interfaceData) {
    try {
      const response = await vplsClient.post(`/networks/${networkName}/interfaces`, interfaceData);

      cache.delete('vpls:networks');
      cache.delete(`vpls:network:${networkName}`);

      return response.data;
    } catch (error) {
      console.error('[VPLS] Add interface error:', error.message);
      throw error;
    }
  }

  // Remove interface from VPLS
  async removeInterfaceFromVPLS(networkName, interfaceName) {
    try {
      const response = await vplsClient.delete(
        `/networks/${networkName}/interfaces/${interfaceName}`
      );

      cache.delete('vpls:networks');
      cache.delete(`vpls:network:${networkName}`);

      return response.data;
    } catch (error) {
      console.error('[VPLS] Remove interface error:', error.message);
      throw error;
    }
  }

  // Get VPLS network details
  async getVPLSNetworkDetails(networkName) {
    const cacheKey = `vpls:network:${networkName}`;

    if (cache.has(cacheKey)) {
      console.log('[VPLS Cache] Hit:', networkName);
      return cache.get(cacheKey);
    }

    try {
      const response = await vplsClient.get(`/networks/${networkName}`);
      const details = response.data;

      cache.set(cacheKey, details, 120);
      return details;
    } catch (error) {
      console.error('[VPLS] Get network details error:', error.message);
      throw error;
    }
  }

  // Delete VPLS network
  async deleteVPLSNetwork(networkName) {
    try {
      const response = await vplsClient.delete(`/networks/${networkName}`);

      await db.query('UPDATE vpls_networks SET deleted_at = NOW() WHERE name = $1', [networkName]);

      cache.delete('vpls:networks');
      cache.delete(`vpls:network:${networkName}`);

      return response.data;
    } catch (error) {
      console.error('[VPLS] Delete network error:', error.message);
      throw error;
    }
  }

  // Get VPLS statistics
  async getVPLSStats(networkName) {
    const cacheKey = `vpls:stats:${networkName}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    try {
      const response = await vplsClient.get(`/networks/${networkName}/stats`);
      const stats = response.data;

      cache.set(cacheKey, stats, 30);
      return stats;
    } catch (error) {
      console.error('[VPLS] Get stats error:', error.message);
      throw error;
    }
  }
}

module.exports = new VPLSService();
