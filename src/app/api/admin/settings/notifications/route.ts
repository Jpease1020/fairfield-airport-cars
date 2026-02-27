import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { getNotificationsConfig, saveNotificationsConfig } from '@/lib/business/admin-config';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;
    const config = await getNotificationsConfig();
    return NextResponse.json(config);
  } catch (err) {
    console.error('GET admin/settings/notifications failed:', err);
    return NextResponse.json({ error: 'Failed to load notifications config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req);
    if (!authResult.ok) return authResult.response;
    const body = await req.json();
    await saveNotificationsConfig({
      adminPhones: Array.isArray(body.adminPhones) ? body.adminPhones : undefined,
      adminEmails: Array.isArray(body.adminEmails) ? body.adminEmails : undefined,
      channels: body.channels,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST admin/settings/notifications failed:', err);
    return NextResponse.json({ error: 'Failed to save notifications config' }, { status: 500 });
  }
}
