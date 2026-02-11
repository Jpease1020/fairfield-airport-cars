import { NextRequest, NextResponse } from 'next/server';
import { getMarketingCustomers } from '@/lib/services/database-service';
import { sendBulkSms, BulkSmsRecipient } from '@/lib/services/twilio-service';

/**
 * GET /api/admin/marketing/sms
 * Fetch all customers available for SMS marketing
 */
export async function GET() {
  try {
    const customers = await getMarketingCustomers();

    return NextResponse.json({
      success: true,
      customers,
      stats: {
        total: customers.length,
        active: customers.filter(c => c.isActive).length,
        inactive: customers.filter(c => !c.isActive).length,
      },
    });
  } catch (error) {
    console.error('[SMS Marketing API] Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/marketing/sms
 * Send SMS campaign to selected customers
 *
 * Body: {
 *   customerIds: string[],  // IDs of customers to send to
 *   message: string         // Message template (supports {{name}} placeholder)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerIds, message } = body;

    // Validate request
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recipients selected' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate message length (SMS is 160 chars, but allow longer for multi-part)
    if (message.length > 1600) {
      return NextResponse.json(
        { success: false, error: 'Message exceeds maximum length (1600 characters)' },
        { status: 400 }
      );
    }

    // Fetch all customers and filter to selected ones
    const allCustomers = await getMarketingCustomers();
    const selectedCustomers = allCustomers.filter(c => customerIds.includes(c.id));

    if (selectedCustomers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid customers found for selected IDs' },
        { status: 400 }
      );
    }

    // Prepare recipients for bulk SMS
    const recipients: BulkSmsRecipient[] = selectedCustomers.map(c => ({
      phone: c.phone,
      name: c.name,
    }));

    console.log(`[SMS Marketing API] Sending campaign to ${recipients.length} recipients`);

    // Send bulk SMS
    const result = await sendBulkSms(recipients, message);

    return NextResponse.json({
      success: true,
      campaign: {
        message,
        recipientCount: result.total,
        sentAt: new Date().toISOString(),
      },
      results: {
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        details: result.results,
      },
    });
  } catch (error) {
    console.error('[SMS Marketing API] Error sending campaign:', error);

    // Handle Twilio configuration errors
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { success: false, error: 'SMS service is not configured. Please check Twilio credentials.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send SMS campaign' },
      { status: 500 }
    );
  }
}
