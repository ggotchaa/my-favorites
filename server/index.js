'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('./security/rate-limit');

const app = express();
const port = process.env.PORT || 8080;

const candidatePaths = [
  process.env.STATIC_ROOT && path.resolve(process.env.STATIC_ROOT),
  path.join(__dirname, '..', 'browser'),
  path.join(__dirname, '..', 'dist', 'bidding-tool', 'browser'),
].filter(Boolean);

const browserOutputPath = candidatePaths.find((candidatePath) => {
  try {
    return candidatePath && fs.statSync(candidatePath).isDirectory();
  } catch (error) {
    return false;
  }
});

if (!browserOutputPath) {
  throw new Error('Unable to locate compiled Angular application assets.');
}

app.set('trust proxy', true);

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
  })
);

app.use((req, res, next) => {
  const protoHeader = req.headers['x-forwarded-proto'];
  const forwardedProto =
    typeof protoHeader === 'string' ? protoHeader.split(',')[0].trim().toLowerCase() : undefined;
  const isHttps = req.secure || req.protocol === 'https' || forwardedProto === 'https';

  if (!isHttps && req.headers.host) {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }

  return next();
});

app.use(
  express.static(browserOutputPath, {
    maxAge: '1d',
    setHeaders: (res, servedPath) => {
      if (servedPath && servedPath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

app.get('*', (req, res) => {
  res.sendFile(path.join(browserOutputPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});
