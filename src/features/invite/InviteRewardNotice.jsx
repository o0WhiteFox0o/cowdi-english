import { useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/layout/Toast';

/**
 * FR-RWD-05: Hiển thị thông báo 1 lần trong app cho thưởng mời bạn:
 * - Người mời: "Bạn nhận 💎 +3 nhờ <biệt danh>"
 * - Người được mời: "Quà chào mừng 🥛 +500"
 * - Mốc vé gacha / danh hiệu
 */
export default function InviteRewardNotice() {
  const { user, token, authFetch } = useAuth();
  const showToast = useToast();
  const checkedTokenRef = useRef(null);

  useEffect(() => {
    if (!user || !token || checkedTokenRef.current === token) return;
    checkedTokenRef.current = token;
    let cancelled = false;

    (async () => {
      try {
        const res = await authFetch('/api/me/invite-notifications');
        if (!res.ok || cancelled) return;
        const payload = await res.json();
        const items = Array.isArray(payload?.items) ? payload.items : [];
        if (items.length === 0 || cancelled) return;

        const ids = [];
        for (const item of items) {
          ids.push(item.id);
          const d = item.data || {};
          if (item.kind === 'invite_activated') {
            showToast(`Bạn nhận 💎 +${d.gem || 3} nhờ ${d.fromNickname || 'bạn mới'}!`, 'success');
          } else if (item.kind === 'invite_welcome') {
            showToast(`Quà chào mừng 🥛 +${d.milk || 500} Sữa!`, 'success');
          } else if (item.kind === 'invite_milestone') {
            const titlePart = d.titleVi ? ` + danh hiệu "${d.titleVi}"` : '';
            showToast(`🎉 Mốc ${d.milestone} bạn học thật: +${d.tickets || 1} Vé gacha (sắp dùng được)${titlePart}!`, 'success');
          }
        }

        await authFetch('/api/me/invite-notifications/seen', {
          method: 'POST',
          body: JSON.stringify({ ids }),
        }).catch(() => {});
      } catch {
        // Im lặng khi offline
      }
    })();

    return () => { cancelled = true; };
  }, [user, token, authFetch, showToast]);

  return null;
}
