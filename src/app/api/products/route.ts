import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products
export async function GET() {
  try {
    const products = await db.product.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await db.product.create({
      data: {
        name: body.name,
        nameAr: body.nameAr ?? '',
        description: body.description ?? '',
        descriptionAr: body.descriptionAr ?? '',
        price: body.price ?? 0,
        image: body.image ?? '',
        isAvailable: body.isAvailable ?? true,
        category: body.category ?? '',
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
