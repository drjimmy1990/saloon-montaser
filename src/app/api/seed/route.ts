import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

// POST /api/seed - Seed the database with initial data
export async function POST() {
  try {
    const supabase = getServiceRoleClient();

    // Clear existing data (Note: In production this is dangerous, but we keep it for seeding)
    await Promise.all([
      supabase.from('Booking').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('Client').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('Product').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('Channel').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ]);

    // Seed Channels
    const { data: channels } = await supabase.from('Channel').insert([
      {
        name: 'WhatsApp Business',
        type: 'whatsapp',
        isActive: true,
        credentials: [
          { key: 'API_KEY', value: 'wh_api_xxxxx1234' },
          { key: 'PHONE_NUMBER_ID', value: '1234567890' },
          { key: 'BUSINESS_ACCOUNT_ID', value: 'BIZ_001' },
        ],
        variables: {
          response_delay: '3',
          greeting_message: 'مرحباً بك! كيف يمكنني مساعدتك؟',
          language: 'ar',
        },
        imageSets: [
          { name: 'Testimonials', images: ['https://example.com/review1.jpg', 'https://example.com/review2.jpg'] },
          { name: 'Before/After', images: ['https://example.com/before1.jpg', 'https://example.com/after1.jpg'] },
        ],
      },
      {
        name: 'Facebook Messenger',
        type: 'facebook',
        isActive: true,
        credentials: [
          { key: 'PAGE_ACCESS_TOKEN', value: 'fb_token_xxxxx5678' },
          { key: 'APP_SECRET', value: 'fb_secret_xxxx' },
        ],
        variables: {
          response_delay: '2',
          greeting_message: 'أهلاً وسهلاً! كيف يمكننا مساعدتك اليوم؟',
        },
        imageSets: [
          { name: 'Promotions', images: ['https://example.com/promo1.jpg'] },
        ],
      },
      {
        name: 'Instagram Direct',
        type: 'instagram',
        isActive: false,
        credentials: [
          { key: 'ACCESS_TOKEN', value: 'ig_token_xxxxx9012' },
        ],
        variables: {
          response_delay: '5',
          greeting_message: 'مرحباً! شكراً لتواصلك معنا 💫',
        },
        imageSets: [
          { name: 'Gallery', images: ['https://example.com/gallery1.jpg'] },
        ],
      }
    ]).select();

    // Seed Products
    const { data: products } = await supabase.from('Product').insert([
      {
        name: 'Facial Treatment',
        nameAr: 'علاج البشرة',
        description: 'Deep cleansing facial with premium products',
        descriptionAr: 'تنظيف عميق للبشرة باستخدام منتجات فاخرة',
        price: 250,
        image: '',
        isAvailable: true,
        category: 'Skincare',
      },
      {
        name: 'Hair Coloring',
        nameAr: 'صبغة الشعر',
        description: 'Professional hair coloring with top brands',
        descriptionAr: 'صبغة شعر احترافية بأفضل الماركات',
        price: 350,
        image: '',
        isAvailable: true,
        category: 'Hair',
      },
      {
        name: 'Manicure',
        nameAr: 'مناكير',
        description: 'Classic manicure with nail art options',
        descriptionAr: 'مناكير كلاسيكي مع خيارات رسم الأظافر',
        price: 120,
        image: '',
        isAvailable: true,
        category: 'Nails',
      },
      {
        name: 'Pedicure',
        nameAr: 'بديكير',
        description: 'Relaxing pedicure with massage',
        descriptionAr: 'بديكير مريح مع تدليك',
        price: 150,
        image: '',
        isAvailable: false,
        category: 'Nails',
      },
      {
        name: 'Bridal Makeup',
        nameAr: 'مكياج عروس',
        description: 'Full bridal makeup package with trial session',
        descriptionAr: 'باقة مكياج عروس كاملة مع جلسة تجريبية',
        price: 800,
        image: '',
        isAvailable: true,
        category: 'Makeup',
      },
      {
        name: 'Keratin Treatment',
        nameAr: 'علاج الكيراتين',
        description: 'Smooth and straighten hair with keratin',
        descriptionAr: 'تنعيم وفرد الشعر بالكيراتين',
        price: 600,
        image: '',
        isAvailable: true,
        category: 'Hair',
      }
    ]).select();

    // Seed Clients
    const { data: clients } = await supabase.from('Client').insert([
      { name: 'أحمد الراشد', phone: '+966501234567', address: 'الرياض، حي النزهة', notes: 'عميل VIP' },
      { name: 'سارة منصور', phone: '+966502345678', address: 'جدة، حي الروضة', notes: '' },
      { name: 'خالد بن ناصر', phone: '+966503456789', address: 'الدمام، حي الفيصلية', notes: 'حساسية من منتجات معينة' },
      { name: 'فاطمة حسن', phone: '+966504567890', address: 'مكة، حي العزيزية', notes: '' },
      { name: 'عمر الفارسي', phone: '+966505678901', address: 'المدينة، حي السلام', notes: 'يفضل مواعيد المساء' },
      { name: 'ليلى المكتوم', phone: '+966506789012', address: 'الرياض، حي الملقا', notes: '' },
    ]).select();

    // Seed Bookings
    const { data: bookings } = await supabase.from('Booking').insert([
      {
        clientName: 'أحمد الراشد',
        clientPhone: '+966501234567',
        clientAddress: 'الرياض، حي النزهة',
        serviceSummary: 'علاج البشرة + صبغة الشعر',
        channelType: 'whatsapp',
        status: 'confirmed',
      },
      {
        clientName: 'سارة منصور',
        clientPhone: '+966502345678',
        clientAddress: 'جدة، حي الروضة',
        serviceSummary: 'مكياج عروس',
        channelType: 'instagram',
        status: 'pending',
      },
      {
        clientName: 'خالد بن ناصر',
        clientPhone: '+966503456789',
        clientAddress: 'الدمام، حي الفيصلية',
        serviceSummary: 'مناكير + بديكير',
        channelType: 'facebook',
        status: 'completed',
      },
      {
        clientName: 'فاطمة حسن',
        clientPhone: '+966504567890',
        clientAddress: 'مكة، حي العزيزية',
        serviceSummary: 'علاج الكيراتين',
        channelType: 'whatsapp',
        status: 'pending',
      },
      {
        clientName: 'عمر الفارسي',
        clientPhone: '+966505678901',
        clientAddress: 'المدينة، حي السلام',
        serviceSummary: 'علاج البشرة',
        channelType: 'facebook',
        status: 'cancelled',
      },
      {
        clientName: 'ليلى المكتوم',
        clientPhone: '+966506789012',
        clientAddress: 'الرياض، حي الملقا',
        serviceSummary: 'مكياج عروس + مناكير',
        channelType: 'instagram',
        status: 'confirmed',
      },
      {
        clientName: 'نورة السالم',
        clientPhone: '+966507890123',
        clientAddress: 'الرياض، حي الورود',
        serviceSummary: 'صبغة الشعر',
        channelType: 'whatsapp',
        status: 'pending',
      },
      {
        clientName: 'محمد العتيبي',
        clientPhone: '+966508901234',
        clientAddress: 'جدة، حي الحمراء',
        serviceSummary: 'علاج الكيراتين + قص شعر',
        channelType: 'whatsapp',
        status: 'confirmed',
      },
    ]).select();

    return NextResponse.json({
      message: 'Database seeded successfully',
      counts: {
        channels: channels?.length || 0,
        products: products?.length || 0,
        clients: clients?.length || 0,
        bookings: bookings?.length || 0,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
