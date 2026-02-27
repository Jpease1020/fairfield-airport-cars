import { NextRequest, NextResponse } from 'next/server';
import { sendEnhancedTestEmail } from '@/lib/services/email-service';
import { requireAdmin } from '@/lib/utils/auth-server';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const { to, bookingId } = await request.json();
    if (!to || !bookingId) {
      return NextResponse.json({ error: 'Missing "to" address or "bookingId"' }, { status: 400 });
    }
    
    const ok = await sendEnhancedTestEmail(to, bookingId).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Unknown SMTP error';
      return { ok: false, msg };
    });
    
    if (ok && typeof ok === 'object' && 'ok' in ok && (ok as any).ok === false) {
      return NextResponse.json({ error: (ok as any).msg }, { status: 500 });
    }
    
    if (!ok) return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    
    return NextResponse.json({ success: true, message: 'Enhanced test email sent successfully' });
  } catch (error) {
    console.error('Enhanced test email error:', error);
    return NextResponse.json({ error: 'Failed to send enhanced test email' }, { status: 500 });
  }
}
