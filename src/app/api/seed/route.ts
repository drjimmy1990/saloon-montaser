import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/seed - Seed the database with initial data
export async function POST() {
  try {
    // Clear existing data
    await db.blacklistEntry.deleteMany();
    await db.conversation.deleteMany();
    await db.booking.deleteMany();
    await db.client.deleteMany();
    await db.product.deleteMany();
    await db.channel.deleteMany();

    // Seed Channels
    const whatsapp = await db.channel.create({
      data: {
        name: 'WhatsApp Business',
        type: 'whatsapp',
        isActive: true,
        credentials: JSON.stringify([
          { key: 'API_KEY', value: 'wh_api_xxxxx1234' },
          { key: 'PHONE_NUMBER_ID', value: '1234567890' },
          { key: 'BUSINESS_ACCOUNT_ID', value: 'BIZ_001' },
        ]),
        variables: JSON.stringify({
          response_delay: '3',
          greeting_message: 'مرحباً بك! كيف يمكنني مساعدتك؟',
          language: 'ar',
        }),
        imageSets: JSON.stringify([
          { name: 'Testimonials', images: ['https://example.com/review1.jpg', 'https://example.com/review2.jpg'] },
          { name: 'Before/After', images: ['https://example.com/before1.jpg', 'https://example.com/after1.jpg'] },
        ]),
      },
    });

    const facebook = await db.channel.create({
      data: {
        name: 'Facebook Messenger',
        type: 'facebook',
        isActive: true,
        credentials: JSON.stringify([
          { key: 'PAGE_ACCESS_TOKEN', value: 'fb_token_xxxxx5678' },
          { key: 'APP_SECRET', value: 'fb_secret_xxxx' },
        ]),
        variables: JSON.stringify({
          response_delay: '2',
          greeting_message: 'أهلاً وسهلاً! كيف يمكننا مساعدتك اليوم؟',
        }),
        imageSets: JSON.stringify([
          { name: 'Promotions', images: ['https://example.com/promo1.jpg'] },
        ]),
      },
    });

    const instagram = await db.channel.create({
      data: {
        name: 'Instagram Direct',
        type: 'instagram',
        isActive: false,
        credentials: JSON.stringify([
          { key: 'ACCESS_TOKEN', value: 'ig_token_xxxxx9012' },
        ]),
        variables: JSON.stringify({
          response_delay: '5',
          greeting_message: 'مرحباً! شكراً لتواصلك معنا 💫',
        }),
        imageSets: JSON.stringify([
          { name: 'Gallery', images: ['https://example.com/gallery1.jpg'] },
        ]),
      },
    });

    // Seed Products
    const products = await Promise.all([
      db.product.create({
        data: {
          name: 'Facial Treatment',
          nameAr: 'علاج البشرة',
          description: 'Deep cleansing facial with premium products',
          descriptionAr: 'تنظيف عميق للبشرة باستخدام منتجات فاخرة',
          price: 250,
          image: '',
          isAvailable: true,
          category: 'Skincare',
        },
      }),
      db.product.create({
        data: {
          name: 'Hair Coloring',
          nameAr: 'صبغة الشعر',
          description: 'Professional hair coloring with top brands',
          descriptionAr: 'صبغة شعر احترافية بأفضل الماركات',
          price: 350,
          image: '',
          isAvailable: true,
          category: 'Hair',
        },
      }),
      db.product.create({
        data: {
          name: 'Manicure',
          nameAr: 'مناكير',
          description: 'Classic manicure with nail art options',
          descriptionAr: 'مناكير كلاسيكي مع خيارات رسم الأظافر',
          price: 120,
          image: '',
          isAvailable: true,
          category: 'Nails',
        },
      }),
      db.product.create({
        data: {
          name: 'Pedicure',
          nameAr: 'بديكير',
          description: 'Relaxing pedicure with massage',
          descriptionAr: 'بديكير مريح مع تدليك',
          price: 150,
          image: '',
          isAvailable: false,
          category: 'Nails',
        },
      }),
      db.product.create({
        data: {
          name: 'Bridal Makeup',
          nameAr: 'مكياج عروس',
          description: 'Full bridal makeup package with trial session',
          descriptionAr: 'باقة مكياج عروس كاملة مع جلسة تجريبية',
          price: 800,
          image: '',
          isAvailable: true,
          category: 'Makeup',
        },
      }),
      db.product.create({
        data: {
          name: 'Keratin Treatment',
          nameAr: 'علاج الكيراتين',
          description: 'Smooth and straighten hair with keratin',
          descriptionAr: 'تنعيم وفرد الشعر بالكيراتين',
          price: 600,
          image: '',
          isAvailable: true,
          category: 'Hair',
        },
      }),
    ]);

    // Seed Clients
    const clients = await Promise.all([
      db.client.create({ data: { name: 'أحمد الراشد', phone: '+966501234567', address: 'الرياض، حي النزهة', notes: 'عميل VIP' } }),
      db.client.create({ data: { name: 'سارة منصور', phone: '+966502345678', address: 'جدة، حي الروضة', notes: '' } }),
      db.client.create({ data: { name: 'خالد بن ناصر', phone: '+966503456789', address: 'الدمام، حي الفيصلية', notes: 'حساسية من منتجات معينة' } }),
      db.client.create({ data: { name: 'فاطمة حسن', phone: '+966504567890', address: 'مكة، حي العزيزية', notes: '' } }),
      db.client.create({ data: { name: 'عمر الفارسي', phone: '+966505678901', address: 'المدينة، حي السلام', notes: 'يفضل مواعيد المساء' } }),
      db.client.create({ data: { name: 'ليلى المكتوم', phone: '+966506789012', address: 'الرياض، حي الملقا', notes: '' } }),
    ]);

    // Seed Bookings
    const bookings = await Promise.all([
      db.booking.create({
        data: {
          clientName: 'أحمد الراشد',
          clientPhone: '+966501234567',
          clientAddress: 'الرياض، حي النزهة',
          serviceSummary: 'علاج البشرة + صبغة الشعر',
          channelType: 'whatsapp',
          status: 'confirmed',
        },
      }),
      db.booking.create({
        data: {
          clientName: 'سارة منصور',
          clientPhone: '+966502345678',
          clientAddress: 'جدة، حي الروضة',
          serviceSummary: 'مكياج عروس',
          channelType: 'instagram',
          status: 'pending',
        },
      }),
      db.booking.create({
        data: {
          clientName: 'خالد بن ناصر',
          clientPhone: '+966503456789',
          clientAddress: 'الدمام، حي الفيصلية',
          serviceSummary: 'مناكير + بديكير',
          channelType: 'facebook',
          status: 'completed',
        },
      }),
      db.booking.create({
        data: {
          clientName: 'فاطمة حسن',
          clientPhone: '+966504567890',
          clientAddress: 'مكة، حي العزيزية',
          serviceSummary: 'علاج الكيراتين',
          channelType: 'whatsapp',
          status: 'pending',
        },
      }),
      db.booking.create({
        data: {
          clientName: 'عمر الفارسي',
          clientPhone: '+966505678901',
          clientAddress: 'المدينة، حي السلام',
          serviceSummary: 'علاج البشرة',
          channelType: 'facebook',
          status: 'cancelled',
        },
      }),
      db.booking.create({
        data: {
          clientName: 'ليلى المكتوم',
          clientPhone: '+966506789012',
          clientAddress: 'الرياض، حي الملقا',
          serviceSummary: 'مكياج عروس + مناكير',
          channelType: 'instagram',
          status: 'confirmed',
        },
      }),
      db.booking.create({
        data: {
          clientName: 'نورة السالم',
          clientPhone: '+966507890123',
          clientAddress: 'الرياض، حي الورود',
          serviceSummary: 'صبغة الشعر',
          channelType: 'whatsapp',
          status: 'pending',
        },
      }),
      db.booking.create({
        data: {
          clientName: 'محمد العتيبي',
          clientPhone: '+966508901234',
          clientAddress: 'جدة، حي الحمراء',
          serviceSummary: 'علاج الكيراتين + قص شعر',
          channelType: 'whatsapp',
          status: 'confirmed',
        },
      }),
    ]);

    // Seed Blacklist
    const blacklist = await Promise.all([
      db.blacklistEntry.create({ data: { identifier: '+966509998877', identifierType: 'phone', reason: 'رسائل مزعجة متكررة' } }),
      db.blacklistEntry.create({ data: { identifier: '+966509998876', identifierType: 'phone', reason: 'سلوك غير لائق' } }),
      db.blacklistEntry.create({ data: { identifier: 'user_spam_001', identifierType: 'id', reason: 'حساب وهمي' } }),
      db.blacklistEntry.create({ data: { identifier: 'user_abuse_002', identifierType: 'id', reason: 'إساءة استخدام البوت' } }),
    ]);

    // Seed Conversations
    const conversations = await Promise.all([
      db.conversation.create({
        data: {
          channelType: 'whatsapp',
          clientName: 'أحمد الراشد',
          clientPhone: '+966501234567',
          messages: JSON.stringify([
            { sender: 'user', text: 'السلام عليكم، أبغى أحجز موعد لعلاج البشرة', time: '10:30 AM' },
            { sender: 'bot', text: 'وعليكم السلام! أهلاً بك 😊 عندنا علاج البشرة العميق بسعر 250 ريال. متى تفضل الموعد؟', time: '10:30 AM' },
            { sender: 'user', text: 'الأسبوع القادم يوم الثلاثاء', time: '10:31 AM' },
            { sender: 'bot', text: 'تم حجز موعدك ليوم الثلاثاء القادم الساعة 4 مساءً. هل تحتاج أي خدمات إضافية؟', time: '10:31 AM' },
            { sender: 'user', text: 'نعم، أبغى صبغة شعر أيضاً', time: '10:32 AM' },
            { sender: 'bot', text: 'ممتاز! أضفنا صبغة الشعر (350 ريال) لحجزك. الإجمالي: 600 ريال. نلتقي الثلاثاء! 🎉', time: '10:32 AM' },
          ]),
          status: 'active',
        },
      }),
      db.conversation.create({
        data: {
          channelType: 'facebook',
          clientName: 'خالد بن ناصر',
          clientPhone: '+966503456789',
          messages: JSON.stringify([
            { sender: 'user', text: 'مرحبا، هل عندكم مناكير؟', time: '2:15 PM' },
            { sender: 'bot', text: 'أهلاً خالد! نعم عندنا مناكير كلاسيكي 120 ريال مع خيارات رسم الأظافر. هل تريد حجز؟', time: '2:15 PM' },
            { sender: 'user', text: 'نعم مع بديكير أيضاً', time: '2:16 PM' },
            { sender: 'bot', text: 'رائع! مناكير + بديكير بسعر 270 ريال. أي يوم يناسبك؟', time: '2:16 PM' },
          ]),
          status: 'active',
        },
      }),
      db.conversation.create({
        data: {
          channelType: 'instagram',
          clientName: 'سارة منصور',
          clientPhone: '+966502345678',
          messages: JSON.stringify([
            { sender: 'user', text: 'أبغى حجز لمكياج عروس 💄', time: '11:00 AM' },
            { sender: 'bot', text: 'تهانينا! 🎊 مكياج العروس لدينا يشمل جلسة تجريبية بسعر 800 ريال. متى المناسبة؟', time: '11:00 AM' },
            { sender: 'user', text: 'بعد شهر', time: '11:01 AM' },
            { sender: 'bot', text: 'سنحتاج لجلسة تجريبية قبلها بأسبوعين. هل يوم الأحد القادم مناسب للتجريبية؟', time: '11:01 AM' },
            { sender: 'agent', text: 'أهلاً سارة! أنا نورة من فريقنا، سأساعدك في ترتيب كل شيء شخصياً 😊', time: '11:05 AM' },
          ]),
          status: 'active',
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Database seeded successfully',
      counts: {
        channels: 3,
        products: products.length,
        clients: clients.length,
        bookings: bookings.length,
        blacklist: blacklist.length,
        conversations: conversations.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
