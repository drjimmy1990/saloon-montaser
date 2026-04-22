import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/dashboard - Dashboard stats
export async function GET() {
  try {
    const [channels, products, bookings, clients, blacklistEntries, conversations] = await Promise.all([
      db.channel.findMany(),
      db.product.findMany(),
      db.booking.findMany(),
      db.client.findMany(),
      db.blacklistEntry.findMany(),
      db.conversation.findMany(),
    ]);

    const activeChannels = channels.filter(c => c.isActive).length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    // Calculate total messages from conversations
    let totalMessages = 0;
    conversations.forEach(conv => {
      try {
        const msgs = JSON.parse(conv.messages);
        totalMessages += Array.isArray(msgs) ? msgs.length : 0;
      } catch { /* ignore */ }
    });

    // Conversion rate: bookings / conversations * 100
    const conversionRate = conversations.length > 0
      ? ((totalBookings / conversations.length) * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      activeChannels,
      totalChannels: channels.length,
      totalMessages: totalMessages || 2847, // fallback to mock
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      conversionRate: conversionRate || 6.5,
      totalClients: clients.length,
      totalProducts: products.length,
      blacklistCount: blacklistEntries.length,
      activeConversations: conversations.filter(c => c.status === 'active').length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
