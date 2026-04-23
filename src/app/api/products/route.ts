import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

// GET /api/products
export async function GET() {
  try {
    const supabase = getServiceRoleClient();
    const { data: products, error } = await supabase
      .from('Product')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return NextResponse.json(products || []);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getServiceRoleClient();
    const { data: product, error } = await supabase
      .from('Product')
      .insert({
        name: body.name,
        description: body.description ?? '',
        price: body.price ?? 0,
        images: body.images ?? [],
        isAvailable: body.isAvailable ?? true,
        category: body.category ?? '',
        notes: body.notes ?? '',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
