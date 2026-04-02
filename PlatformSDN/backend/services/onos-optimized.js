// PlatformSDN/backend/services/onos-optimized.js - Optimized ONOS API with caching
const axios = require('axios');
const config = require('../config');
const cache = require('../cache');

const ONOS_URL = `http://${config.ONOS_CONFIG.host}:${config.ONOS_CONFIG.port}`;
const ONOS_API = `${ONOS_URL}/onos/v1`;

const onosClient = axios.create({
  baseURL: ONOS_API,
  timeout: 8000,
  proxy: false,
  auth: {
    username: config.ONOS_CONFIG.user,
    password: config.ONOS_CONFIG.password,
  },
});

// Cache TTLs in seconds
const CACHE_TTL = {
  DEVICES: 30,
  LINKS: 30,
  FLOWS: 60,
  INTENTS: 60,
  TOPOLOGY: 30,
};

async function getDevices(forceRefresh = false) {
  const cacheKey = 'onos:devices';

  if (!forceRefresh && cache.has(cacheKey)) {
    console.log('[ONOS Cache] Hit: devices');
    return cache.get(cacheKey);
  }

  try {
    const response = await onosClient.get('/devices');
    const devices = response.data.devices || [];

    // Cache result
    cache.set(cacheKey, devices, CACHE_TTL.DEVICES);
    console.log('[ONOS] Fetched devices, cached for', CACHE_TTL.DEVICES, 'seconds');

    return devices;
  } catch (error) {
    console.error('[ONOS] Get devices error:', error.message);
    // Return cached data if available, even if expired
    const cached = cache.get(cacheKey);
    if (cached) {
      console.warn('[ONOS] Returning stale cached devices');
      return cached;
    }
    throw error;
  }
}

async function getLinks(forceRefresh = false) {
  const cacheKey = 'onos:links';

  if (!forceRefresh && cache.has(cacheKey)) {
    console.log('[ONOS Cache] Hit: links');
    return cache.get(cacheKey);
  }

  try {
    const response = await onosClient.get('/links');
    const links = response.data.links || [];
    cache.set(cacheKey, links, CACHE_TTL.LINKS);
    return links;
  } catch (error) {
    console.error('[ONOS] Get links error:', error.message);
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    throw error;
  }
}

async function getFlows(deviceId = null, forceRefresh = false) {
  const cacheKey = deviceId ? `onos:flows:${deviceId}` : 'onos:flows';

  if (!forceRefresh && cache.has(cacheKey)) {
    console.log('[ONOS Cache] Hit:', cacheKey);
    return cache.get(cacheKey);
  }

  try {
    const endpoint = deviceId ? `/flows/${deviceId}` : '/flows';
    const response = await onosClient.get(endpoint);
    const flows = response.data.flows || [];
    cache.set(cacheKey, flows, CACHE_TTL.FLOWS);
    return flows;
  } catch (error) {
    console.error('[ONOS] Get flows error:', error.message);
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    throw error;
  }
}

async function getIntents(forceRefresh = false) {
  const cacheKey = 'onos:intents';

  if (!forceRefresh && cache.has(cacheKey)) {
    console.log('[ONOS Cache] Hit: intents');
    return cache.get(cacheKey);
  }

  try {
    const response = await onosClient.get('/intents');
    const intents = response.data.intents || [];
    cache.set(cacheKey, intents, CACHE_TTL.INTENTS);
    return intents;
  } catch (error) {
    console.error('[ONOS] Get intents error:', error.message);
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    throw error;
  }
}

function invalidateCache(resource = null) {
  if (!resource) {
    cache.clear();
    console.log('[ONOS Cache] Invalidated all caches');
  } else {
    cache.delete(`onos:${resource}`);
    console.log('[ONOS Cache] Invalidated', resource);
  }
}

function getCacheStats() {
  return cache.getStats();
}

module.exports = {
  getDevices,
  getLinks,
  getFlows,
  getIntents,
  invalidateCache,
  getCacheStats,
  onosClient,
};
