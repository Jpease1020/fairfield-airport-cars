/**
 * Cache-busting utilities
 * Helps ensure users get the latest version of the site
 */

/**
 * Get current build version for cache-busting
 * Uses Vercel build ID, git commit SHA, or timestamp
 */
export function getCacheBustVersion(): string {
  // Prefer Vercel build ID (changes on every deployment)
  if (process.env.NEXT_PUBLIC_BUILD_ID) {
    return process.env.NEXT_PUBLIC_BUILD_ID;
  }
  
  // Fall back to git commit SHA (first 7 characters)
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7);
  }
  
  // Last resort: timestamp (for local development)
  return Date.now().toString();
}

/**
 * Add cache-busting query parameter to a URL
 * @param url - The URL to add cache-busting to
 * @returns URL with version query parameter
 */
export function addCacheBust(url: string): string {
  const version = getCacheBustVersion();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}`;
}

/**
 * Check if URL has cache-busting parameter
 */
export function hasCacheBust(url: string): boolean {
  return url.includes('?v=') || url.includes('&v=');
}

