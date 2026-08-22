const rateLimit = require('express-rate-limit');
const config = require('../config/config');

class RateLimiter {
  constructor() {
    this.limiter = this.createLimiter();
  }

  createLimiter() {
    return rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
      message: {
        success: false,
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      keyGenerator: (req) => {
        // Use IP address and API key as unique identifier
        const apiKey = req.headers['x-api-key'] || req.decryptedApiKey || 'anonymous';
        return `${req.ip}-${apiKey}`;
      },
      skip: (req) => {
        // Optionally skip rate limiting for certain IPs or conditions
        // Example: skip for admin IPs
        // return req.ip === '127.0.0.1';
        return false;
      }
    });
  }

  // Custom rate limiter for different endpoints
  createCustomLimiter(options = {}) {
    return rateLimit({
      windowMs: options.windowMs || config.RATE_LIMIT_WINDOW_MS,
      max: options.max || config.RATE_LIMIT_MAX_REQUESTS,
      message: options.message || {
        success: false,
        error: 'Too many requests, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  getLimiter() {
    return this.limiter;
  }
}

module.exports = new RateLimiter();