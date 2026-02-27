import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/services/email-service';
import { requireAdmin } from '@/lib/utils/auth-server';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const { to, subject, text } = await request.json();
    if (!to) {
      return NextResponse.json({ error: 'Missing "to" address' }, { status: 400 });
    }
    const ok = await sendTestEmail(to, subject, text).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Unknown SMTP error';
      return { ok: false, msg };
    });
    if (ok && typeof ok === 'object' && 'ok' in ok && (ok as any).ok === false) {
      return NextResponse.json({ error: (ok as any).msg }, { status: 500 });
    }
    if (!ok) return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}
