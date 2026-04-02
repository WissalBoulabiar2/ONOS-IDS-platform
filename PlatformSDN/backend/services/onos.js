// backend/services/onos.js - ONOS API integration
const axios = require('axios');
const config = require('../config');

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

const onosVplsClient = axios.create({
  baseURL: `${ONOS_URL}/onos/vpls`,
  timeout: 8000,
  proxy: false,
  auth: {
    username: config.ONOS_CONFIG.user,
    password: config.ONOS_CONFIG.password,
  },
});

async function getDevices() {
  try {
    const response = await onosClient.get('/devices');
    return response.data.devices || [];
  } catch (error) {
    console.error('[ONOS] Get devices error:', error.message);
    throw error;
  }
}

async function getLinks() {
  try {
    const response = await onosClient.get('/links');
    return response.data.links || [];
  } catch (error) {
    console.error('[ONOS] Get links error:', error.message);
    throw error;
  }
}

async function getFlows() {
  try {
    const response = await onosClient.get('/flows');
    return response.data.flows || [];
  } catch (error) {
    console.error('[ONOS] Get flows error:', error.message);
    throw error;
  }
}

async function getIntents() {
  try {
    const response = await onosClient.get('/intents');
    return response.data.intents || [];
  } catch (error) {
    console.error('[ONOS] Get intents error:', error.message);
    throw error;
  }
}

async function getClusterTopology() {
  try {
    const response = await onosClient.get('/topology');
    return response.data;
  } catch (error) {
    console.error('[ONOS] Get topology error:', error.message);
    throw error;
  }
}

module.exports = {
  getDevices,
  getLinks,
  getFlows,
  getIntents,
  getClusterTopology,
  onosClient,
  onosVplsClient,
};
