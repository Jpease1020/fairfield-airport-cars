import { NextRequest, NextResponse } from 'next/server';
import { getPricingConfig, savePricingConfig } from '@/lib/business/pricing-config';
import { requireAdmin } from '@/lib/utils/auth-server';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const config = await getPricingConfig();
    const serialized = {
      ...config,
      updatedAt: config.updatedAt instanceof Date ? config.updatedAt.toISOString() : config.updatedAt,
    };
    return NextResponse.json(serialized);
  } catch (err) {
    console.error('GET pricing failed:', err);
    return NextResponse.json({ error: 'Failed to load pricing config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req);
    if (!authResult.ok) return authResult.response;

    const body = await req.json();
    await savePricingConfig({ ...body, updatedBy: 'admin' });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST pricing failed:', err);
    return NextResponse.json({ error: 'Failed to save pricing config' }, { status: 500 });
  }
}
