// PlatformSDN/backend/__tests__/services/audit-logs.test.js
const auditService = require('../../services/audit-logs');
const db = require('../../db');

jest.mock('../../db');

describe('AuditService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logAction', () => {
    it('should log action to database', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });

      await auditService.logAction({
        userId: 1,
        action: 'LOGIN',
        resource: 'auth',
        resourceId: 'login',
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audit_logs'),
        expect.any(Array)
      );
    });
  });

  describe('getAuditLogs', () => {
    it('should retrieve audit logs', async () => {
      const logs = [
        { id: 1, action: 'LOGIN', status: 'SUCCESS', created_at: new Date() },
      ];
      db.query.mockResolvedValue({ rows: logs });

      const result = await auditService.getAuditLogs();

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(logs);
    });
  });

  describe('getSuspiciousActivities', () => {
    it('should detect suspicious activities', async () => {
      const activities = [
        { user_id: 1, failed_attempts: 6, created_at: new Date() },
      ];
      db.query.mockResolvedValue({ rows: activities });

      const result = await auditService.getSuspiciousActivities();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
