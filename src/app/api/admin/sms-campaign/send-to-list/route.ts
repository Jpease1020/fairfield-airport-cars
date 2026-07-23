import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/utils/auth-server';
import { sendSmsToList } from '@/lib/services/sms-campaign-service';

const schema = z.object({
  recipients: z
    .array(
      z.object({
        phone: z.string().min(1),
        name: z.string().optional().default(''),
      })
    )
    .min(1),
  messageTemplate: z.string().min(1),
  dryRun: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const json = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'recipients and messageTemplate are required' }, { status: 400 });
    }

    const { recipients, messageTemplate, dryRun } = parsed.data;
    const normalizedRecipients = recipients.map((r) => ({ phone: r.phone, name: r.name || 'there' }));

    if (dryRun) {
      return NextResponse.json({ dryRun: true, recipientCount: normalizedRecipients.length });
    }

    const sendResult = await sendSmsToList(normalizedRecipients, messageTemplate);
    return NextResponse.json({ success: true, sendResult });
  } catch (error) {
    console.error('Failed to send SMS to list:', error);
    const message = error instanceof Error ? error.message : 'Failed to send SMS campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
