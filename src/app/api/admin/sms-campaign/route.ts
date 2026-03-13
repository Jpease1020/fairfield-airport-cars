import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { sendSmsCampaign, getSmsCampaignPreflight } from '@/lib/services/sms-campaign-service';
import { sendBulkSms } from '@/lib/services/twilio-service';

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
    const activeWithinDays = parsePositiveInt(searchParams.get('activeWithinDays'));
    const bookingScanLimit = parsePositiveInt(searchParams.get('bookingScanLimit'));

    const preflight = await getSmsCampaignPreflight({
      activeWithinDays,
      bookingScanLimit,
    });

    return NextResponse.json({
      preflight: {
        scannedBookings: preflight.scannedBookings,
        uniqueContacts: preflight.uniqueContacts,
        optedInContacts: preflight.optedInContacts,
        invalidPhoneContacts: preflight.invalidPhoneContacts,
        excludedNoPhone: preflight.excludedNoPhone,
        excludedOptedOut: preflight.excludedOptedOut,
        recipients: preflight.recipients,
      },
    });
  } catch (error) {
    console.error('SMS campaign preflight failed:', error);
    return NextResponse.json({ error: 'Failed to generate SMS campaign preflight' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const body = await request.json().catch(() => ({}));
    const messageTemplate = typeof body?.messageTemplate === 'string' ? body.messageTemplate.trim() : '';
    if (!messageTemplate) {
      return NextResponse.json({ error: 'messageTemplate is required' }, { status: 400 });
    }

    const activeWithinDays = typeof body?.activeWithinDays === 'number' ? Math.floor(body.activeWithinDays) : undefined;
    const bookingScanLimit = typeof body?.bookingScanLimit === 'number' ? Math.floor(body.bookingScanLimit) : undefined;
    const dryRun = body?.dryRun === true;
    const selectedPhones: string[] | undefined = Array.isArray(body?.selectedPhones) ? body.selectedPhones : undefined;

    if (dryRun) {
      const preflight = await getSmsCampaignPreflight({
        activeWithinDays,
        bookingScanLimit,
      });
      return NextResponse.json({
        dryRun: true,
        preflight: {
          scannedBookings: preflight.scannedBookings,
          uniqueContacts: preflight.uniqueContacts,
          optedInContacts: preflight.optedInContacts,
          invalidPhoneContacts: preflight.invalidPhoneContacts,
          excludedNoPhone: preflight.excludedNoPhone,
          excludedOptedOut: preflight.excludedOptedOut,
          recipients: preflight.recipients,
        },
      });
    }

    // If specific phones are selected, send only to those recipients
    if (selectedPhones && selectedPhones.length > 0) {
      const preflight = await getSmsCampaignPreflight({ activeWithinDays, bookingScanLimit });
      const phoneSet = new Set(selectedPhones);
      const filteredRecipients = preflight.internalRecipients
        .filter((r) => phoneSet.has(r.phone))
        .map((r) => ({ name: r.name, phone: r.phone }));

      if (filteredRecipients.length === 0) {
        return NextResponse.json({ error: 'No valid recipients in selection' }, { status: 400 });
      }

      const sendResult = await sendBulkSms(filteredRecipients, messageTemplate, { includeOptOutNotice: true });
      return NextResponse.json({
        success: true,
        preflight: {
          scannedBookings: preflight.scannedBookings,
          uniqueContacts: preflight.uniqueContacts,
          optedInContacts: filteredRecipients.length,
        },
        sendResult,
      });
    }

    const campaignResult = await sendSmsCampaign(messageTemplate, {
      activeWithinDays,
      bookingScanLimit,
    });

    return NextResponse.json({
      success: true,
      preflight: {
        scannedBookings: campaignResult.preflight.scannedBookings,
        uniqueContacts: campaignResult.preflight.uniqueContacts,
        optedInContacts: campaignResult.preflight.optedInContacts,
        invalidPhoneContacts: campaignResult.preflight.invalidPhoneContacts,
        excludedNoPhone: campaignResult.preflight.excludedNoPhone,
        excludedOptedOut: campaignResult.preflight.excludedOptedOut,
      },
      sendResult: campaignResult.sendResult,
    });
  } catch (error) {
    console.error('SMS campaign send failed:', error);
    return NextResponse.json({ error: 'Failed to send SMS campaign' }, { status: 500 });
  }
}
