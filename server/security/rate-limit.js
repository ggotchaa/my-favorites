'use strict';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 100;
const CLEANUP_INTERVAL_MS = DEFAULT_WINDOW_MS;

function createStore() {
  const hits = new Map();

  function cleanup() {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (now - entry.firstRequestTime >= entry.windowMs) {
        hits.delete(key);
      }
    }
  }

  setInterval(cleanup, CLEANUP_INTERVAL_MS).unref();

  return {
    increment(key, windowMs) {
      const now = Date.now();
      let entry = hits.get(key);

      if (!entry || now - entry.firstRequestTime >= entry.windowMs) {
        entry = {
          count: 0,
          firstRequestTime: now,
          windowMs,
        };
      }

      entry.count += 1;
      entry.lastRequestTime = now;
      entry.windowMs = windowMs;

      hits.set(key, entry);

      return entry;
    },
  };
}

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
  const store = createStore();

  return function rateLimitMiddleware(req, res, next) {
    const key = resolveClientKey(req);
    const entry = store.increment(key, windowMs);
    const remaining = Math.max(0, max - entry.count);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(entry.firstRequestTime + windowMs));

    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.firstRequestTime + windowMs - Date.now()) / 1000)));
      return res.status(429).send('Too many requests, please try again later.');
    }

    return next();
  };
}

module.exports = rateLimit;
