import { NextRequest, NextResponse } from 'next/server';
import { sendEnhancedTestEmail } from '@/lib/services/email-service';

export async function POST(request: NextRequest) {
  try {
    const { to, bookingId } = await request.json();
    if (!to || !bookingId) {
      return NextResponse.json({ error: 'Missing "to" address or "bookingId"' }, { status: 400 });
    }
    
    // Debug environment variables
    console.log('🔧 API Route Environment Check:');
    console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST ? '✅ Set' : '❌ Missing'}`);
    console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT ? '✅ Set' : '❌ Missing'}`);
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
    console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    
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
