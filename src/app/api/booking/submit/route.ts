import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/utils/auth-server';
import { submitBookingRequestSchema } from '@/lib/contracts/booking-api';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import {
  BookingApiError,
  submitBookingOrchestration,
} from '@/lib/services/booking-orchestrator';

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    bucket: 'api:booking:submit',
    limit: 20,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;

  const raw = await request.json().catch(() => ({}));
  const parsed = submitBookingRequestSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const submittedPickupDateTimeRaw =
    typeof (raw as { trip?: { pickupDateTime?: unknown } })?.trip?.pickupDateTime === 'string'
      ? (raw as { trip?: { pickupDateTime?: string } }).trip?.pickupDateTime
      : undefined;

  try {
    const authContext = await getAuthContext(request);
    const response = await submitBookingOrchestration({
      payload: parsed.data,
      submittedPickupDateTimeRaw,
      authUserId: authContext?.uid ?? null,
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof BookingApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
    return NextResponse.json(
      {
        error: 'Failed to create booking',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
