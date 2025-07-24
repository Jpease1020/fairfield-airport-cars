import { NextResponse } from 'next/server';
import { deletePromo } from '@/lib/services/promo-service';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if(!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await deletePromo(id);
  return NextResponse.json({ success: true });
} 