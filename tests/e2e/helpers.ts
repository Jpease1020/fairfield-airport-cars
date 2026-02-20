/**
 * E2E helpers: guards so we never create data in prod.
 */

/**
 * True only when the target URL is local (localhost or 127.0.0.1).
 * Use this to skip any test that creates or mutates database records
 * when running against prod/preview.
 */
export function isLocalTarget(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * Effective base URL for the run (env or default).
 * Use with isLocalTarget() to decide whether DB-creating tests are allowed.
 */
export function getEffectiveBaseUrl(): string {
  return (
    process.env.E2E_BASE_URL ||
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  );
}
