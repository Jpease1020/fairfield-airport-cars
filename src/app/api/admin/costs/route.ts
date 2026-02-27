import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';
import { getCostEntries, addCostEntry, costEntrySchema } from '@/lib/services/cost-entries-service';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const month = request.nextUrl.searchParams.get('month') ?? undefined;
    const entries = await getCostEntries(month);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error('GET admin/costs failed:', err);
    return NextResponse.json({ error: 'Failed to load cost entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const body = await request.json();
    const parsed = costEntrySchema.omit({ id: true, createdAt: true }).parse({
      month: body.month,
      provider: body.provider,
      category: body.category,
      amount: Number(body.amount),
      notes: body.notes ?? undefined,
      invoiceUrl: body.invoiceUrl || body.invoice_url || undefined,
    });
    const entry = await addCostEntry(parsed, 'admin');
    return NextResponse.json({ entry });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid cost entry', details: err }, { status: 400 });
    }
    console.error('POST admin/costs failed:', err);
    return NextResponse.json({ error: 'Failed to add cost entry' }, { status: 500 });
  }
}
