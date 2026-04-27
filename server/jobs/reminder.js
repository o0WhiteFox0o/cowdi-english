/**
 * server/jobs/reminder.js
 * Scheduled job: gửi push "🔥 Streak sắp đứt" cho user inactive nhưng có streak ≥ 3.
 * Chạy mỗi giờ, dedupe bằng last_reminder_at (chỉ 1 lần / 20h).
 *
 * Quy tắc gửi:
 *   - User có push_enabled = 1
 *   - User có streak ≥ 3
 *   - last_seen_at cách hiện tại 18-26 giờ (gần đứt streak)
 *   - last_reminder_at NULL hoặc cách hiện tại > 20h (chống spam)
 */
import pool from '../config/database.js';
import { sendPushToUser, isPushReady } from '../config/push.js';
import { pickPetIcon } from '../utils/pet-icon.js';

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 giờ

const REMINDER_MESSAGES = [
  { title: 'Pet của bạn đang nhớ bạn 🥺', body: '{petName} đợi bạn học hôm nay! Streak {streak} ngày sắp đứt 🔥' },
  { title: '🔥 Streak {streak} ngày sắp đứt!', body: 'Vào học 5 phút thôi để giữ lửa cùng {petName} nhé!' },
  { title: '{petName} đói kiến thức rồi 📚', body: 'Cho {petName} ăn 1 bài quiz nhỏ để giữ streak {streak} ngày!' },
  { title: '🐮 Cowdi nhắc nhẹ!', body: '{petName} đang chờ bạn. Học 1 lesson để streak {streak} không reset 💪' },
];

function pickMessage(petName, streak) {
  const tpl = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
  const fill = (s) => s.replace('{petName}', petName || 'Cowdi').replace('{streak}', streak);
  return { title: fill(tpl.title), body: fill(tpl.body) };
}

async function runReminderCheck() {
  if (!isPushReady()) return;

  try {
    const [users] = await pool.execute(
      `SELECT u.id, u.last_seen_at, up.streak, up.pet_data, up.nickname
       FROM users u
       JOIN user_progress up ON up.user_id = u.id
       WHERE up.push_enabled = 1
         AND up.streak >= 3
         AND u.last_seen_at IS NOT NULL
         AND TIMESTAMPDIFF(HOUR, u.last_seen_at, NOW()) BETWEEN 18 AND 26
         AND (up.last_reminder_at IS NULL
              OR TIMESTAMPDIFF(HOUR, up.last_reminder_at, NOW()) >= 20)
       LIMIT 500`
    );

    if (!users.length) return;

    let totalSent = 0;
    for (const user of users) {
      const { petName, icon } = pickPetIcon(user.pet_data);
      const msg = pickMessage(petName, user.streak);

      const { sent } = await sendPushToUser(user.id, {
        title: msg.title,
        body: msg.body,
        icon,
        badge: '/pwa-192x192.png',
        tag: 'streak-reminder',
        url: '/practice',
        renotify: false,
      });

      if (sent > 0) {
        totalSent++;
        await pool.execute(
          'UPDATE user_progress SET last_reminder_at = NOW() WHERE user_id = ?',
          [user.id]
        );
      }
    }

    if (totalSent > 0) {
      console.log(`🔔 Streak reminder: gửi ${totalSent}/${users.length} user`);
    }
  } catch (err) {
    console.error('Reminder job error:', err.message);
  }
}

export function startReminderJob() {
  // Chạy lần đầu sau 5 phút (đợi server ổn định), sau đó mỗi giờ
  setTimeout(runReminderCheck, 5 * 60 * 1000);
  setInterval(runReminderCheck, CHECK_INTERVAL_MS);
  console.log('⏰ Reminder job: scheduled mỗi 1 giờ');
}
