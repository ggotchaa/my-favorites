'use strict';

const expressRateLimit = require('express-rate-limit');

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 100;

function resolveClientKey(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  if (typeof firstForwarded === 'string' && firstForwarded.trim().length > 0) {
    return firstForwarded.split(',')[0].trim();
  }

  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function rateLimit(options = {}) {
  const windowMs = typeof options.windowMs === 'number' && options.windowMs > 0 ? options.windowMs : DEFAULT_WINDOW_MS;
  const max = typeof options.max === 'number' && options.max > 0 ? options.max : DEFAULT_MAX_REQUESTS;

  return expressRateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: true,
    keyGenerator: resolveClientKey,
    handler: (req, res) => {
      const resetTime = req.rateLimit?.resetTime;
      const retryAfterSeconds =
        resetTime instanceof Date
          ? Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
          : Math.ceil(windowMs / 1000);

      if (retryAfterSeconds > 0) {
        res.setHeader('Retry-After', String(retryAfterSeconds));
      }

      res.status(429).send('Too many requests, please try again later.');
    },
  });
}

module.exports = rateLimit;
