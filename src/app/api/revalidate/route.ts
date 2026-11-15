import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const TAG_PATTERN = /^[a-z0-9:_-]{1,128}$/i;

function secretMatches(received: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !received) return false;

  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Called by the Laravel backend whenever catalog data changes.
export async function POST(req: NextRequest) {
  if (!secretMatches(req.headers.get('x-revalidate-secret'))) {
    return NextResponse.json({ revalidated: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const tags: unknown = body?.tags;

  if (
    !Array.isArray(tags) ||
    tags.length === 0 ||
    tags.length > 50 ||
    !tags.every((tag): tag is string => typeof tag === 'string' && TAG_PATTERN.test(tag))
  ) {
    return NextResponse.json({ revalidated: false, error: 'Invalid tags' }, { status: 422 });
  }

  tags.forEach((tag) => revalidateTag(tag));

  return NextResponse.json({ revalidated: true, tags });
}
