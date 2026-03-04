import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

const requestSchema = z.object({
  query: z.string().min(3).max(256),
});

const LOCATION_BIAS = 'rectangle:40.5,-74.5|42.0,-72.5';

interface PlacesApiResponse {
  status?: string;
  candidates?: Array<{
    formatted_address?: string;
    place_id?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
  error_message?: string;
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    bucket: 'api:places:autocomplete',
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const raw = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'query is required (3-256 chars)' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 });
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input', parsed.data.query);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'formatted_address,geometry,place_id');
  url.searchParams.set('locationbias', LOCATION_BIAS);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString(), { method: 'GET' });
  if (!response.ok) {
    return NextResponse.json({ error: 'Places API unavailable' }, { status: 503 });
  }

  const payload = (await response.json().catch(() => ({}))) as PlacesApiResponse;
  const candidates = Array.isArray(payload.candidates)
    ? payload.candidates
        .filter(
          (candidate) =>
            typeof candidate.formatted_address === 'string' &&
            typeof candidate.place_id === 'string' &&
            typeof candidate.geometry?.location?.lat === 'number' &&
            typeof candidate.geometry?.location?.lng === 'number'
        )
        .slice(0, 5)
        .map((candidate) => ({
          address: candidate.formatted_address as string,
          coordinates: {
            lat: candidate.geometry?.location?.lat as number,
            lng: candidate.geometry?.location?.lng as number,
          },
          placeId: candidate.place_id as string,
        }))
    : [];

  if (payload.status !== 'OK') {
    return NextResponse.json({
      candidates: [],
      status: payload.status ?? 'UNKNOWN',
      error: payload.error_message,
    });
  }

  return NextResponse.json({ candidates });
}
