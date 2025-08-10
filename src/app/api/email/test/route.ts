import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/services/email-service';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text } = await request.json();
    if (!to) {
      return NextResponse.json({ error: 'Missing "to" address' }, { status: 400 });
    }
    const ok = await sendTestEmail(to, subject, text);
    if (!ok) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}


