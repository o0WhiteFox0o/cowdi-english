import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePet } from '../../hooks/usePet';
import { PET_REGISTRY } from '../../data/pets';

/**
 * Banner thông báo lời mời thách đấu bạn bè (toàn app).
 * Poll nhẹ mỗi 4 giây khi người dùng đã đăng nhập.
 */
export default function FriendDuelInviteBanner() {
  const { user, token, authFetch } = useAuth();
  const { petData } = usePet();
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const loadIncoming = useCallback(async () => {
    if (!token || !user) return;
    try {
      const res = await authFetch('/api/arena/friend-room/incoming');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.rooms)) {
        setInvites(data.rooms);
      }
    } catch { /* ignore */ }
  }, [token, user, authFetch]);

  useEffect(() => {
    if (!token || !user) {
      setInvites([]);
      return undefined;
    }
    loadIncoming();
    const timer = setInterval(loadIncoming, 2000);
    return () => clearInterval(timer);
  }, [token, user, loadIncoming]);

  if (!token || !user || invites.length === 0) return null;

  const inv = invites[0];
  const pet = petData?.collection?.[petData?.activePetId];
  const petSnap = pet ? {
    speciesId: pet.speciesId || 'cowdi',
    evolution: pet.evolution ?? 0,
    skills: pet.skills || {},
    element: PET_REGISTRY[pet.speciesId]?.element || 'neutral',
    group: PET_REGISTRY[pet.speciesId]?.group || 'farm',
  } : null;

  async function handleRespond(accept) {
    setBusyId(inv.roomId);
    try {
      const res = await authFetch(`/api/arena/friend-room/${inv.roomId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ accept, petSnapshot: petSnap }),
      });
      const data = await res.json();
      if (res.ok && accept && data?.room) {
        setInvites((prev) => prev.filter((x) => x.roomId !== inv.roomId));
        navigate(`/duel?roomId=${encodeURIComponent(inv.roomId)}`);
      } else {
        setInvites((prev) => prev.filter((x) => x.roomId !== inv.roomId));
      }
    } catch {
      setInvites((prev) => prev.filter((x) => x.roomId !== inv.roomId));
    }
    setBusyId(null);
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 2050,
        maxWidth: 340,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      }}
      className="card border-primary bg-white p-3"
    >
      <div className="fw-bold text-primary mb-1">
        ⚔️ Lời mời Đấu trường từ {inv.challenger?.displayName || 'Bạn bè'}
      </div>
      <div className="small text-muted mb-2">
        {inv.hasTicket
          ? 'Trận Xếp hạng 1 vé (100% thưởng Sữa & LP)'
          : 'Trận Giao hữu 0 vé (không tính LP, không thưởng)'}
      </div>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm btn-cowdi-primary fw-bold flex-fill"
          disabled={busyId === inv.roomId}
          onClick={() => handleRespond(true)}
        >
          {busyId === inv.roomId ? 'Đang vào...' : '✅ Đồng ý vào phòng'}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          disabled={busyId === inv.roomId}
          onClick={() => handleRespond(false)}
        >
          Từ chối
        </button>
      </div>
    </div>
  );
}
