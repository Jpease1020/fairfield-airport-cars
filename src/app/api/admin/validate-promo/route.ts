import { NextResponse } from 'next/server';
import { listPromoCodes } from '@/lib/services/promo-service';

export async function POST(req: Request) {
  const { code, fare } = await req.json();
  if (!code || typeof fare !== 'number') {
    return NextResponse.json({ error: 'code and fare required' }, { status: 400 });
  }
  const promos = await listPromoCodes();
  const promo = promos.find((p) => p.code === code.toUpperCase());
  if (!promo) return NextResponse.json({ valid: false });
  const now = new Date();
  if (promo.expiresAt && new Date(promo.expiresAt) < now)
    return NextResponse.json({ valid: false, error: 'expired' });
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit)
    return NextResponse.json({ valid: false, error: 'limit reached' });

  const discount = promo.type === 'percent' ? (fare * promo.value) / 100 : promo.value;
  const newFare = Math.max(fare - discount, 0);
  return NextResponse.json({ valid: true, discount, newFare, promo });
} 