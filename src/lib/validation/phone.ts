// Shared by both the client-facing phase validator (validate-phase/route.ts) and the final
// submit contract (booking-api.ts) so a direct API call can't submit a phone number the UI
// would have rejected.
export function isValidUSPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 10) return true;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) return true;
  return false;
}
