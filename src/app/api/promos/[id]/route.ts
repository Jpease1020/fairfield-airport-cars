import { NextResponse } from 'next/server';
import { deletePromo } from '@/lib/promo-service';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if(!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await deletePromo(id);
  return NextResponse.json({ success: true });
} 