import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { getContactDirectory } from '@/lib/services/sms-campaign-service';

const parsePositiveInt = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const { searchParams } = new URL(request.url);
    const bookingScanLimit = parsePositiveInt(searchParams.get('bookingScanLimit'));

    const directory = await getContactDirectory({ bookingScanLimit });
    return NextResponse.json(directory);
  } catch (error) {
    console.error('Failed to build SMS contact directory:', error);
    return NextResponse.json({ error: 'Failed to load contacts' }, { status: 500 });
  }
}
