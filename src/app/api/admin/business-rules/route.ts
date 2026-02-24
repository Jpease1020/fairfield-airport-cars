import { NextRequest, NextResponse } from 'next/server';
import { getBusinessRules, saveBusinessRules } from '@/lib/business/business-rules';
import { requireAdmin } from '@/lib/utils/auth-server';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const rules = await getBusinessRules();
    const serialized = {
      ...rules,
      updatedAt: rules.updatedAt instanceof Date ? rules.updatedAt.toISOString() : rules.updatedAt,
    };
    return NextResponse.json(serialized);
  } catch (err) {
    console.error('GET business-rules failed:', err);
    return NextResponse.json({ error: 'Failed to load business rules' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req);
    if (!authResult.ok) return authResult.response;

    const body = await req.json();
    await saveBusinessRules({ ...body, updatedBy: 'admin' });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST business-rules failed:', err);
    return NextResponse.json({ error: 'Failed to save business rules' }, { status: 500 });
  }
}
