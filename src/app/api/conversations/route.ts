import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/conversations
export async function GET() {
  try {
    const conversations = await db.conversation.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/conversations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const conversation = await db.conversation.create({
      data: {
        channelType: body.channelType,
        clientName: body.clientName,
        clientPhone: body.clientPhone ?? '',
        messages: JSON.stringify(body.messages ?? []),
        status: body.status ?? 'active',
      },
    });
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
