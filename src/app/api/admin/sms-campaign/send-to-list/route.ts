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
        // Client-reported opt-in status at send time (from the contact directory the admin
        // reviewed) — recorded here so there's a server-side account of the decision made,
        // since this endpoint deliberately allows sending to non-opted-in numbers.
        optedIn: z.boolean().optional().default(false),
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
    const optedInCount = recipients.filter((r) => r.optedIn).length;
    const notOptedInCount = recipients.length - optedInCount;

    if (dryRun) {
      return NextResponse.json({ dryRun: true, recipientCount: normalizedRecipients.length, optedInCount, notOptedInCount });
    }

    const sendResult = await sendSmsToList(normalizedRecipients, messageTemplate);
    console.log(
      `[SMS Marketing] Sent to list: ${optedInCount} opted-in, ${notOptedInCount} not opted-in of ${recipients.length} total.`
    );
    return NextResponse.json({ success: true, sendResult, optedInCount, notOptedInCount });
  } catch (error) {
    console.error('Failed to send SMS to list:', error);
    const message = error instanceof Error ? error.message : 'Failed to send SMS campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
