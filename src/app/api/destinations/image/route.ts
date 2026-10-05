import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDestinationImage } from '@/lib/destination-images';

const QuerySchema = z.object({
  q: z.string().min(1).max(150),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  const parsed = QuerySchema.safeParse({ q });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Query parameter q is required (1-150 chars)' }, { status: 400 });
  }

  const result = await getDestinationImage(parsed.data.q);
  return NextResponse.json(result);
}
