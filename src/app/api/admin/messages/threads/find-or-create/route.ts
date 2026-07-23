import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/utils/auth-server';
import { normalizePhoneToE164 } from '@/lib/services/twilio-service';
import { findOrCreateThread } from '@/lib/services/sms-thread-service';

const schema = z.object({
  phone: z.string().min(1),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'phone is required' }, { status: 400 });
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhoneToE164(parsed.data.phone);
    } catch {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const name = parsed.data.name?.trim() || null;
    const { threadId, created } = await findOrCreateThread(normalizedPhone, name);

    return NextResponse.json({ threadId, created });
  } catch (error) {
    console.error('Failed to find or create SMS thread:', error);
    return NextResponse.json({ error: 'Failed to start conversation' }, { status: 500 });
  }
}
