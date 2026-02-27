import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { requireAdmin } from '@/lib/utils/auth-server';

/**
 * PATCH /api/admin/payments/[id] – update reconciliation notes (admin only).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });

    const body = await request.json();
    const notes = typeof body.reconciliationNotes === 'string' ? body.reconciliationNotes.trim().slice(0, 500) : undefined;

    const db = getAdminDb();
    const ref = db.collection('payments').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    await ref.update({
      reconciliationNotes: notes ?? null,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, reconciliationNotes: notes ?? null });
  } catch (err) {
    console.error('PATCH admin/payments/[id] failed:', err);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}
