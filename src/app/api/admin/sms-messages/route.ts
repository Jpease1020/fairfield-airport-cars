import { NextRequest, NextResponse } from 'next/server';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { requireAdmin } from '@/lib/utils/auth-server';

/**
 * GET /api/admin/sms-messages – list recent SMS for admin.
 * Optional query: limit (default 50), direction (inbound|outbound).
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const limitNum = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const direction = searchParams.get('direction');

    const snapshot = await db
      .collection('smsMessages')
      .orderBy('createdAt', 'desc')
      .limit(limitNum)
      .get();
    let items = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const d = doc.data();
      const createdAt = d.createdAt;
      return {
        id: doc.id,
        from: d.from,
        to: d.to,
        body: d.body,
        direction: d.direction,
        twilioMessageSid: d.twilioMessageSid,
        createdAt: createdAt?.toDate?.()?.toISOString?.() ?? (typeof createdAt === 'string' ? createdAt : null),
      };
    });
    if (direction === 'inbound' || direction === 'outbound') {
      items = items.filter((i: { direction: string }) => i.direction === direction);
    }
    return NextResponse.json({ messages: items });
  } catch (error) {
    console.error('Failed to fetch SMS messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
