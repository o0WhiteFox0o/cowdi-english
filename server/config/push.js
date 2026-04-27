/**
 * server/config/push.js
 * Web Push helper: setup VAPID + sendPushToUser().
 * Tự động xử lý subscription expired (410/404) → xoá khỏi DB.
 */
import webpush from 'web-push';
import pool from './database.js';

const PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT     = process.env.VAPID_SUBJECT || 'mailto:admin@cowdi.net';

let pushReady = false;
if (PUBLIC_KEY && PRIVATE_KEY) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
  pushReady = true;
  console.log('🔔 Web Push: ready (VAPID configured)');
} else {
  console.warn('⚠️  Web Push: tắt — thiếu VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY trong .env');
  console.warn('   Sinh key: cd server && node scripts/generate-vapid-keys.js');
}

export const isPushReady = () => pushReady;
export const getPublicKey = () => PUBLIC_KEY || '';

/**
 * Gửi push notification tới TẤT CẢ thiết bị của user.
 * @param {number} userId
 * @param {object} payload  { title, body, icon, badge, tag, url, actions? }
 * @returns {Promise<{sent:number, failed:number}>}
 */
export async function sendPushToUser(userId, payload) {
  if (!pushReady) return { sent: 0, failed: 0 };

  const [subs] = await pool.execute(
    'SELECT id, endpoint, p256dh, auth_key FROM push_subscriptions WHERE user_id = ?',
    [userId]
  );
  if (!subs.length) return { sent: 0, failed: 0 };

  let sent = 0, failed = 0;
  const data = JSON.stringify(payload);

  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth_key },
        },
        data
      );
      sent++;
      // update last_used (best-effort, non-blocking)
      pool.execute('UPDATE push_subscriptions SET last_used = NOW() WHERE id = ?', [sub.id])
        .catch(() => {});
    } catch (err) {
      failed++;
      // Subscription expired → cleanup
      if (err.statusCode === 404 || err.statusCode === 410) {
        await pool.execute('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]).catch(() => {});
      } else {
        console.error(`Push error user=${userId} sub=${sub.id}:`, err.statusCode || err.message);
      }
    }
  }));

  return { sent, failed };
}
