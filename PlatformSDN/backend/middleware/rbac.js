// PlatformSDN/backend/middleware/rbac.js - Role-Based Access Control middleware
const RBACService = require('../services/rbac');
const auditService = require('../services/audit-logs');

/**
 * Check if user has required role
 */
function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      await auditService.logAction({
        userId: req.user.id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: req.path,
        resourceId: req.path,
        status: 'FAILED',
        details: {
          requiredRoles: allowedRoles,
          userRole: req.user.role,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
}

/**
 * Check if user has specific permission
 */
function requirePermission(permission) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!RBACService.hasPermission(req.user.role, permission)) {
      await auditService.logAction({
        userId: req.user.id,
        action: 'PERMISSION_DENIED',
        resource: req.path,
        resourceId: req.path,
        status: 'FAILED',
        details: {
          requiredPermission: permission,
          userRole: req.user.role,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return res.status(403).json({
        error: 'Permission denied',
        required: permission,
      });
    }

    next();
  };
}

/**
 * Check if user has any of the permissions
 */
function requireAnyPermission(...permissions) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!RBACService.hasAnyPermission(req.user.role, permissions)) {
      return res.status(403).json({
        error: 'Permission denied',
        required: permissions,
      });
    }

    next();
  };
}

/**
 * Check if user can manage another user
 */
function canManageUser(req, res, next) {
  return async (req, res, next) => {
    const targetUserId = req.params.id;

    // Get target user role
    const db = require('../db');
    const result = await db.query('SELECT role FROM users WHERE id = $1', [targetUserId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetRole = result.rows[0].role;

    if (!RBACService.canUserManageUser(req.user.role, targetRole)) {
      return res.status(403).json({
        error: 'Cannot manage user with higher or equal role',
      });
    }

    next();
  };
}

/**
 * Get available roles middleware
 */
function injectRoles(req, res, next) {
  req.availableRoles = RBACService.getAllRoles();
  next();
}

module.exports = {
  requireRole,
  requirePermission,
  requireAnyPermission,
  canManageUser,
  injectRoles,
};
