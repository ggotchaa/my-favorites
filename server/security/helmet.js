'use strict';

/**
 * Minimal subset of Helmet that only enables the HSTS middleware.
 *
 * The production environment where this application is built does not allow
 * downloading third-party npm modules at build time, so we vendor a tiny
 * implementation that mirrors Helmet's public API surface for HSTS.
 */

function buildMiddlewareStack(options) {
  const stack = [];

  if (options.hsts !== false) {
    stack.push(hsts(options.hsts));
  }

  return stack;
}

function helmet(options = {}) {
  const stack = buildMiddlewareStack(options);

  return function helmetMiddleware(req, res, next) {
    let index = 0;

    function run(err) {
      if (err) {
        return next(err);
      }

      const layer = stack[index++];
      if (!layer) {
        return next();
      }

      try {
        layer(req, res, run);
      } catch (error) {
        next(error);
      }
    }

    run();
  };
}

function hsts(options = {}) {
  const maxAge = typeof options.maxAge === 'number' ? options.maxAge : 15552000;
  const includeSubDomains = options.includeSubDomains !== false;
  const preload = options.preload === true;
  const headerValue =
    `max-age=${maxAge}` +
    (includeSubDomains ? '; includeSubDomains' : '') +
    (preload ? '; preload' : '');

  return function hstsMiddleware(req, res, next) {
    const protoHeader = req.headers['x-forwarded-proto'];
    const firstProto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader;
    const forwardedProto =
      typeof firstProto === 'string' ? firstProto.split(',')[0].trim().toLowerCase() : undefined;

    if (req.secure || req.protocol === 'https' || forwardedProto === 'https') {
      res.setHeader('Strict-Transport-Security', headerValue);
    }

    next();
  };
}

helmet.hsts = hsts;

module.exports = helmet;
