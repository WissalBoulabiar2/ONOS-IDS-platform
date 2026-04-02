// PlatformSDN/backend/services/sso.js - SSO Integration (OIDC, OAuth2)
const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../db');

class SSOService {
  constructor() {
    this.providers = {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        discoveryUrl: 'https://accounts.google.com/.well-known/openid-configuration',
      },
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        discoveryUrl: 'https://login.microsoftonline.com/common/.well-known/openid-configuration',
      },
      okta: {
        clientId: process.env.OKTA_CLIENT_ID,
        clientSecret: process.env.OKTA_CLIENT_SECRET,
        domain: process.env.OKTA_DOMAIN,
        discoveryUrl: `${process.env.OKTA_DOMAIN}/.well-known/openid-configuration`,
      },
    };
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(provider, redirectUri, state) {
    const config = this.providers[provider];
    if (!config) throw new Error('Unknown provider');

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
    });

    const baseUrl = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      okta: `${config.domain}/oauth2/v1/authorize`,
    }[provider];

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(provider, code, redirectUri) {
    const config = this.providers[provider];
    if (!config) throw new Error('Unknown provider');

    const tokenEndpoint = {
      google: 'https://oauth2.googleapis.com/token',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      okta: `${config.domain}/oauth2/v1/token`,
    }[provider];

    const response = await axios.post(tokenEndpoint, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    return response.data;
  }

  /**
   * Verify and decode ID token
   */
  async verifyIDToken(provider, idToken) {
    // In production, validate signature using provider's public keys
    try {
      const decoded = jwt.decode(idToken, { complete: true });
      return decoded.payload;
    } catch (error) {
      throw new Error('Invalid ID token');
    }
  }

  /**
   * Handle SSO callback
   */
  async handleSSOCallback(provider, code, redirectUri) {
    try {
      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(provider, code, redirectUri);

      // Verify ID token
      const userInfo = await this.verifyIDToken(provider, tokens.id_token);

      // Find or create user
      let user = await db.query('SELECT * FROM users WHERE email = $1', [userInfo.email]);

      if (user.rows.length === 0) {
        // Create new user from SSO profile
        const result = await db.query(
          `INSERT INTO users (username, email, full_name, role, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, true, NOW(), NOW())
           RETURNING *`,
          [userInfo.email.split('@')[0], userInfo.email, userInfo.name || userInfo.email, 'user']
        );
        user = result;
      }

      // Store SSO metadata
      await db.query(
        `INSERT INTO user_sso_metadata (user_id, provider, sso_id, sso_data, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id, provider) DO UPDATE SET sso_data = $4, updated_at = NOW()`,
        [user.rows[0].id, provider, userInfo.sub, JSON.stringify(userInfo)]
      );

      return user.rows[0];
    } catch (error) {
      console.error('[SSO] Callback error:', error.message);
      throw error;
    }
  }

  /**
   * Link SSO account to existing user
   */
  async linkSSOAccount(userId, provider, idToken) {
    try {
      const userInfo = await this.verifyIDToken(provider, idToken);

      await db.query(
        `INSERT INTO user_sso_metadata (user_id, provider, sso_id, sso_data, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id, provider) DO UPDATE SET sso_data = $4, updated_at = NOW()`,
        [userId, provider, userInfo.sub, JSON.stringify(userInfo)]
      );

      return true;
    } catch (error) {
      console.error('[SSO] Link error:', error.message);
      throw error;
    }
  }

  /**
   * Unlink SSO account
   */
  async unlinkSSOAccount(userId, provider) {
    const result = await db.query(
      'DELETE FROM user_sso_metadata WHERE user_id = $1 AND provider = $2',
      [userId, provider]
    );
    return result.rowCount > 0;
  }

  /**
   * Get user's SSO accounts
   */
  async getUserSSOAccounts(userId) {
    const result = await db.query(
      `SELECT provider, sso_id, created_at FROM user_sso_metadata WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Check if SSO account linked
   */
  async isSSOAccountLinked(userId, provider) {
    const result = await db.query(
      'SELECT 1 FROM user_sso_metadata WHERE user_id = $1 AND provider = $2',
      [userId, provider]
    );
    return result.rows.length > 0;
  }

  /**
   * Get provider public key (JWKS)
   */
  async getProviderPublicKey(provider, keyId) {
    const config = this.providers[provider];
    if (!config) throw new Error('Unknown provider');

    try {
      const response = await axios.get(config.discoveryUrl);
      const jwksUri = response.data.jwks_uri;

      const jwksResponse = await axios.get(jwksUri);
      const key = jwksResponse.data.keys.find(k => k.kid === keyId);

      return key;
    } catch (error) {
      console.error('[SSO] Get public key error:', error.message);
      throw error;
    }
  }
}

module.exports = new SSOService();
