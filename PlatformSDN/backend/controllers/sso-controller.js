// PlatformSDN/backend/controllers/sso-controller.js - SSO authentication controller
const ssoService = require('../services/sso');
const authService = require('../services/auth');
const auditService = require('../services/audit-logs');
const crypto = require('crypto');

class SSOController {
  /**
   * Get login URL for provider
   */
  async getLoginUrl(req, res) {
    try {
      const { provider } = req.params;
      const state = crypto.randomBytes(16).toString('hex');

      // Store state in session/cache for verification
      const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/sso/callback/${provider}`;

      const loginUrl = ssoService.getAuthorizationUrl(provider, redirectUri, state);

      res.json({
        loginUrl,
        state, // Client should store this
      });
    } catch (error) {
      console.error('[SSOController] Get login URL error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Handle SSO callback
   */
  async handleCallback(req, res) {
    try {
      const { provider } = req.params;
      const { code, state } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Missing authorization code' });
      }

      const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/sso/callback/${provider}`;

      // Get user from SSO provider
      const user = await ssoService.handleSSOCallback(provider, code, redirectUri);

      const token = authService.generateToken(user);

      await auditService.logAction({
        userId: user.id,
        action: 'SSO_LOGIN',
        resource: 'auth',
        resourceId: provider,
        status: 'SUCCESS',
        details: { provider, email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
        },
      });
    } catch (error) {
      console.error('[SSOController] Callback error:', error.message);

      await auditService.logAction({
        userId: null,
        action: 'SSO_LOGIN',
        resource: 'auth',
        resourceId: req.params.provider,
        status: 'FAILED',
        details: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(500).json({ error: 'SSO authentication failed' });
    }
  }

  /**
   * Link SSO account to user
   */
  async linkAccount(req, res) {
    try {
      const { provider } = req.params;
      const { idToken } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await ssoService.linkSSOAccount(req.user.id, provider, idToken);

      await auditService.logAction({
        userId: req.user.id,
        action: 'SSO_LINK',
        resource: 'auth',
        resourceId: provider,
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({ message: 'SSO account linked successfully' });
    } catch (error) {
      console.error('[SSOController] Link account error:', error.message);
      res.status(500).json({ error: 'Failed to link SSO account' });
    }
  }

  /**
   * Unlink SSO account
   */
  async unlinkAccount(req, res) {
    try {
      const { provider } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const success = await ssoService.unlinkSSOAccount(req.user.id, provider);

      if (!success) {
        return res.status(404).json({ error: 'SSO account not linked' });
      }

      await auditService.logAction({
        userId: req.user.id,
        action: 'SSO_UNLINK',
        resource: 'auth',
        resourceId: provider,
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({ message: 'SSO account unlinked successfully' });
    } catch (error) {
      console.error('[SSOController] Unlink account error:', error.message);
      res.status(500).json({ error: 'Failed to unlink SSO account' });
    }
  }

  /**
   * Get user's SSO accounts
   */
  async getSSOAccounts(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const accounts = await ssoService.getUserSSOAccounts(req.user.id);

      res.json({
        accounts,
      });
    } catch (error) {
      console.error('[SSOController] Get SSO accounts error:', error.message);
      res.status(500).json({ error: 'Failed to retrieve SSO accounts' });
    }
  }
}

module.exports = new SSOController();
