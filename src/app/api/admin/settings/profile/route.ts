import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { getBusinessProfile, saveBusinessProfile } from '@/lib/business/admin-config';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;
    const profile = await getBusinessProfile();
    return NextResponse.json(profile);
  } catch (err) {
    console.error('GET admin/settings/profile failed:', err);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req);
    if (!authResult.ok) return authResult.response;
    const body = await req.json();
    await saveBusinessProfile({
      businessName: body.businessName,
      primaryPhone: body.primaryPhone,
      primaryEmail: body.primaryEmail,
      websiteUrl: body.websiteUrl || '',
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST admin/settings/profile failed:', err);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
