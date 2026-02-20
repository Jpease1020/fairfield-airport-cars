import { NextResponse } from 'next/server';
import { saveBusinessRules, DEFAULT_BUSINESS_RULES } from '@/lib/business/business-rules';

export async function POST() {
  try {
    await saveBusinessRules({ ...DEFAULT_BUSINESS_RULES, updatedBy: 'admin-restore' });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Restore business-rules failed:', err);
    return NextResponse.json({ error: 'Failed to restore defaults' }, { status: 500 });
  }
}
