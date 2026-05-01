/**
 * server/jobs/schedule-reminder.js
 *
 * Cron mỗi phút: quét bảng study_schedules; nếu thời điểm hiện tại
 * (theo timezone của user) trùng giờ user đã đặt và hôm nay là một
 * trong các ngày user chọn → gửi push reminder.
 *
 * Dedupe bằng last_fired_at: chỉ bắn 1 lần mỗi 23h (tránh trường hợp
 * cron chạy chậm trùng phút trong cùng 1 ngày).
 */
import pool from '../config/database.js';
import { sendPushToUser, isPushReady } from '../config/push.js';
import { pickPetIcon } from '../utils/pet-icon.js';

const CHECK_INTERVAL_MS = 60 * 1000; // 1 phút

const SCHEDULE_MESSAGES = [
  { title: '⏰ Đến giờ học rồi!', body: '{petName} đã sẵn sàng học cùng bạn. 5 phút thôi nhé!' },
  { title: '📚 {petName} đang đợi bạn', body: 'Bật ứng dụng và cùng học một chút nào!' },
  { title: '🐮 Cowdi nhắc nhở!', body: 'Đã đến giờ học hôm nay — duy trì streak cùng {petName} nào!' },
  { title: '✨ Giờ vàng học tập', body: '{petName}: "Học ngay 1 lesson nhỏ thôi, sẽ rất nhanh!"' },
];

function pickMessage(petName, custom) {
  if (custom && custom.trim()) {
    return { title: '⏰ Lời nhắc của bạn', body: custom.trim() };
  }
  const tpl = SCHEDULE_MESSAGES[Math.floor(Math.random() * SCHEDULE_MESSAGES.length)];
  const fill = (s) => s.replace('{petName}', petName || 'Cowdi');
  return { title: fill(tpl.title), body: fill(tpl.body) };
}

/**
 * Trả về { weekday: 0..6, hhmm: "HH:MM" } theo timezone IANA cho trước.
 * Dùng Intl.DateTimeFormat (Node 18+ hỗ trợ đầy đủ).
 */
function nowInTimezone(tz) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const wdShort = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
    const hour = parts.find((p) => p.type === 'hour')?.value || '00';
    const minute = parts.find((p) => p.type === 'minute')?.value || '00';
    const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const weekday = map[wdShort] ?? 1;
    // Node ở 1 số môi trường trả "24" thay "00" → chuẩn hoá
    const hh = hour === '24' ? '00' : hour;
    return { weekday, hhmm: `${hh}:${minute}` };
  } catch {
    // TZ không hợp lệ → fallback UTC
    const d = new Date();
    return {
      weekday: d.getUTCDay(),
      hhmm: `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`,
    };
  }
}

async function runScheduleCheck() {
  if (!isPushReady()) return;

  try {
    const [rows] = await pool.execute(
      `SELECT s.user_id, s.days_of_week, s.time_local, s.timezone, s.message,
              s.last_fired_at, up.pet_data
       FROM study_schedules s
       LEFT JOIN user_progress up ON up.user_id = s.user_id
       WHERE s.enabled = 1`
    );

    if (!rows.length) return;

    let totalSent = 0;
    for (const row of rows) {
      const { weekday, hhmm } = nowInTimezone(row.timezone || 'Asia/Ho_Chi_Minh');

      // Kiểm tra giờ trùng (chính xác đến phút)
      if (hhmm !== row.time_local) continue;

      // Kiểm tra ngày trong tuần
      let days;
      try {
        days = JSON.parse(row.days_of_week || '[]');
      } catch {
        days = [];
      }
      if (!Array.isArray(days) || !days.includes(weekday)) continue;

      // Dedupe: không gửi lại trong vòng 23h
      if (row.last_fired_at) {
        const diffMs = Date.now() - new Date(row.last_fired_at).getTime();
        if (diffMs < 23 * 60 * 60 * 1000) continue;
      }

      const { petName, icon } = pickPetIcon(row.pet_data);
      const msg = pickMessage(petName, row.message);

      const { sent } = await sendPushToUser(row.user_id, {
        title: msg.title,
        body: msg.body,
        icon,
        badge: '/pwa-192x192.png',
        tag: 'study-schedule',
        url: '/practice',
        renotify: true,
      });

      if (sent > 0) {
        totalSent++;
        await pool.execute(
          'UPDATE study_schedules SET last_fired_at = NOW() WHERE user_id = ?',
          [row.user_id]
        );
      }
    }

    if (totalSent > 0) {
      console.log(`⏰ Schedule reminder: gửi ${totalSent} user`);
    }
  } catch (err) {
    console.error('Schedule reminder job error:', err.message);
  }
}

export function startScheduleJob() {
  // Chạy mỗi phút
  setInterval(runScheduleCheck, CHECK_INTERVAL_MS);
  console.log('⏰ Schedule reminder job: scheduled mỗi 1 phút');
}
