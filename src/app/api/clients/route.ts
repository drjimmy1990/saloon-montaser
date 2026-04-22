import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/clients
export async function GET() {
  try {
    const clients = await db.client.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// POST /api/clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = await db.client.create({
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address ?? '',
        notes: body.notes ?? '',
      },
    });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
