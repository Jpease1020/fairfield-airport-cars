import { NextResponse } from 'next/server';
import { listPromoCodes, addPromoCode } from '@/lib/services/promo-service';

export async function GET() {
  const promos = await listPromoCodes();
  return NextResponse.json(promos);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.code || !body.type || !body.value) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const id = await addPromoCode({
    code: body.code.toUpperCase(),
    type: body.type,
    value: body.value,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    usageLimit: body.usageLimit ?? undefined,
    usageCount: 0,
    createdAt: new Date(),
  });
  return NextResponse.json({ id });
} 