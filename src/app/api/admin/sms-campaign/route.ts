import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { sendSmsCampaign, getSmsCampaignPreflight } from '@/lib/services/sms-campaign-service';

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
