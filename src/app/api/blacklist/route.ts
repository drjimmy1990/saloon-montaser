import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/blacklist
export async function GET() {
  try {
    const entries = await db.blacklistEntry.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blacklist' }, { status: 500 });
  }
}

// POST /api/blacklist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = await db.blacklistEntry.create({
      data: {
        identifier: body.identifier,
        identifierType: body.identifierType ?? 'phone',
        reason: body.reason ?? '',
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blacklist entry' }, { status: 500 });
  }
}
