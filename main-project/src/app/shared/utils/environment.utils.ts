const LOCAL_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
]);

function normalizeHostname(hostname: string | null | undefined): string | null {
  if (!hostname) {
    return null;
  }

  return hostname.trim().toLowerCase();
}

export function getBrowserHostname(): string | null {
  if (typeof window === 'undefined' || !window.location) {
    return null;
  }

  return window.location.hostname ?? null;
}

export function isLocalEnvironment(hostname: string | null | undefined = getBrowserHostname()): boolean {
  const normalizedHostname = normalizeHostname(hostname);

  if (!normalizedHostname) {
    return false;
  }

  if (LOCAL_HOSTNAMES.has(normalizedHostname)) {
    return true;
  }

  return normalizedHostname.endsWith('.local');
}
