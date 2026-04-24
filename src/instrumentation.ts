export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron');
    const { getServiceRoleClient } = await import('@/lib/supabase');

    // Every day at midnight: mark past pending bookings as completed
    cron.default.schedule('0 0 * * *', async () => {
      try {
        const supabase = getServiceRoleClient();
        const now = new Date().toISOString();

        const { data, error } = await supabase
          .from('Booking')
          .update({ status: 'completed' })
          .eq('status', 'pending')
          .lt('bookingDate', now)
          .select('id');

        if (error) throw error;

        console.log(`[cron] Completed ${data?.length ?? 0} past pending bookings`);
      } catch (error) {
        console.error('[cron] Failed to update bookings:', error);
      }
    });

    console.log('[cron] Booking auto-complete scheduled (daily at midnight)');
  }
}
