// backend/middleware/auth.js - Authentication middleware
const authService = require('../services/auth');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);

  if (err.message.includes('User not found') || err.message === 'Invalid password') {
    return res.status(401).json({ error: err.message });
  }

  if (
    err.message.includes('Insufficient permissions') ||
    err.message === 'User account is inactive'
  ) {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
}

module.exports = {
  authMiddleware,
  roleMiddleware,
  errorHandler,
};
