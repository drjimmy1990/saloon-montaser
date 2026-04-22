import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/channels - List all channels
export async function GET() {
  try {
    const channels = await db.channel.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(channels);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}

// POST /api/channels - Create a channel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const channel = await db.channel.create({
      data: {
        name: body.name,
        type: body.type,
        isActive: body.isActive ?? false,
        credentials: JSON.stringify(body.credentials ?? []),
        variables: JSON.stringify(body.variables ?? {}),
        imageSets: JSON.stringify(body.imageSets ?? []),
      },
    });
    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}
