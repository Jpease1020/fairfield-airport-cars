/**
 * Generate short, readable booking IDs
 * Format: 6-8 characters, avoiding confusing characters (0/O, 1/I/l)
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed: 0, O, 1, I, l
const ID_LENGTH = 6;

/**
 * Generate a short, readable booking ID
 * @returns A 6-character booking ID (e.g., "ABC123")
 */
export function generateShortBookingId(): string {
  let id = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    id += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return id;
}

/**
 * Format a booking ID for display (adds hyphen for readability)
 * @param id - The booking ID
 * @returns Formatted ID (e.g., "ABC-123")
 */
export function formatBookingId(id: string): string {
  if (id.length <= 6) {
    // For short IDs, add hyphen in middle
    const mid = Math.floor(id.length / 2);
    return `${id.slice(0, mid)}-${id.slice(mid)}`;
  }
  // For longer IDs (legacy), format differently
  if (id.length > 12) {
    return `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6, 9)}`;
  }
  return id;
}

/**
 * Validate a booking ID format
 * @param id - The booking ID to validate
 * @returns True if valid format
 */
export function isValidBookingId(id: string): boolean {
  // Accept both short (6-8 chars) and legacy Firestore IDs (20+ chars)
  return id.length >= 6 && /^[A-Za-z0-9-]+$/.test(id);
}

