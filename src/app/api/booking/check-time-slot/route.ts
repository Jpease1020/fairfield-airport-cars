import type { NextRequest } from 'next/server';
import { POST as checkAvailabilityPost } from '@/app/api/booking/check-availability/route';

// Legacy alias retained for backward compatibility. Use /api/booking/check-availability.
export async function POST(request: NextRequest) {
  return checkAvailabilityPost(request);
}
