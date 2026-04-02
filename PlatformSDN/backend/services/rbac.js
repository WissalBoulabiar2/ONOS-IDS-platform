// PlatformSDN/backend/services/rbac.js - Role-Based Access Control
const db = require('../db');

class RBACService {
  /**
   * Define default roles and permissions
   */
  static ROLES = {
    admin: {
      label: 'Administrator',
      permissions: [
        'users:read',
        'users:write',
        'users:delete',
        'tenants:read',
        'tenants:write',
        'tenants:delete',
        'onos:read',
        'onos:write',
        'audit:read',
        'settings:write',
        'alerts:write',
      ],
    },
    manager: {
      label: 'Manager',
      permissions: [
        'users:read',
        'onos:read',
        'onos:write',
        'audit:read',
        'alerts:read',
        'alerts:write',
        'reports:read',
      ],
    },
    operator: {
      label: 'Operator',
      permissions: ['onos:read', 'alerts:read', 'metrics:read', 'reports:read'],
    },
    user: {
      label: 'User',
      permissions: ['onos:read', 'metrics:read'],
    },
    guest: {
      label: 'Guest',
      permissions: ['metrics:read'],
    },
  };

  /**
   * Check if user has permission
   */
  static hasPermission(userRole, requiredPermission) {
    const role = this.ROLES[userRole];
    if (!role) return false;
    return role.permissions.includes(requiredPermission);
  }

  /**
   * Check if user has any of the permissions
   */
  static hasAnyPermission(userRole, permissions) {
    return permissions.some((perm) => this.hasPermission(userRole, perm));
  }

  /**
   * Check if user has all permissions
   */
  static hasAllPermissions(userRole, permissions) {
    return permissions.every((perm) => this.hasPermission(userRole, perm));
  }

  /**
   * Get role permissions
   */
  static getRolePermissions(role) {
    const roleData = this.ROLES[role];
    return roleData ? roleData.permissions : [];
  }

  /**
   * Get all available roles
   */
  static getAllRoles() {
    return Object.entries(this.ROLES).map(([key, value]) => ({
      id: key,
      label: value.label,
      permissions: value.permissions,
    }));
  }

  /**
   * Can user perform resource action
   */
  static canUserPerformAction(userRole, resourceAction) {
    return this.hasPermission(userRole, resourceAction);
  }

  /**
   * Get role hierarchy level (for comparison)
   */
  static getRoleHierarchy(role) {
    const hierarchy = {
      admin: 5,
      manager: 4,
      operator: 3,
      user: 2,
      guest: 1,
    };
    return hierarchy[role] || 0;
  }

  /**
   * Can user manage another user (based on role)
   */
  static canUserManageUser(managerRole, targetRole) {
    const managerLevel = this.getRoleHierarchy(managerRole);
    const targetLevel = this.getRoleHierarchy(targetRole);
    return managerLevel > targetLevel;
  }
}

module.exports = RBACService;
