// PlatformSDN/backend/middleware/security-headers.js - Enhanced security headers
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      connectSrc: ["'self'", "localhost:5000"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  xssFilter: true,
  noSniff: true,
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
});

// API key validation
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // Validate API key (should be stored in secure vault)
  if (!isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
}

function isValidApiKey(apiKey) {
  // TODO: Implement secure API key validation
  // Check against stored keys in secure vault (HashiCorp Vault, AWS Secrets Manager, etc.)
  return apiKey.startsWith('sk_');
}

// Input sanitization
function sanitizeInput(data) {
  if (typeof data === 'string') {
    return data
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim();
  }

  if (typeof data === 'object' && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = sanitizeInput(data[key]);
      return acc;
    }, Array.isArray(data) ? [] : {});
  }

  return data;
}

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
};

module.exports = {
  securityHeaders,
  limiter,
  authLimiter,
  validateApiKey,
  sanitizeInput,
  corsOptions,
};
