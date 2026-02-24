import { NextRequest, NextResponse } from 'next/server';
import { saveBusinessRules, DEFAULT_BUSINESS_RULES } from '@/lib/business/business-rules';
import { requireAdmin } from '@/lib/utils/auth-server';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    await saveBusinessRules({ ...DEFAULT_BUSINESS_RULES, updatedBy: 'admin-restore' });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Restore business-rules failed:', err);
    return NextResponse.json({ error: 'Failed to restore defaults' }, { status: 500 });
  }
}
