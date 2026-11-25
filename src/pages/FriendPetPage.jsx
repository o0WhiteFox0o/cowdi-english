import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PET_REGISTRY, getEvolutionInfo, ELEMENT_COLORS } from '../data/pets';
import { COSMETIC_MAP } from '../../shared/cosmetics-data';
import { getPathById } from '../data/path';
import { PetAvatar } from '../pet-rig/PetAvatar';

const GROUP_LABELS = {
  beginner: 'Mới học (Starter)',
  intermediate: 'Trung bình',
  exam: 'Luyện thi',
};

/**
 * FR-VIS-01: Trang thăm pet của bạn bè (chỉ xem).
 * Chỉ hiển thị các trường BR-08: biệt danh, pet chính (cấp, trang phục), nhóm học, lộ trình đang học.
 */
export default function FriendPetPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, token, authFetch } = useAuth();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch(`/api/friends/${userId}/pet`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(data.messageVi || data.error || 'Không thể thăm pet của người này.');
          return;
        }
        setProfile(data);
      } catch {
        if (!cancelled) setError('Không kết nối được máy chủ.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, userId, authFetch]);

  if (!user) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: 480 }}>
        <p className="text-muted">Vui lòng đăng nhập để thăm pet của bạn bè.</p>
        <Link to="/friends" className="btn btn-cowdi-primary btn-sm">Quay lại</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-cowdi-primary" role="status" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: 500 }}>
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="fs-1 mb-2">🔒</div>
          <h5 className="fw-bold mb-2">Không thể thăm pet</h5>
          <p className="text-muted small mb-3">{error || 'Người dùng không thuộc danh sách bạn bè.'}</p>
          <button className="btn btn-cowdi-primary btn-sm" onClick={() => navigate('/friends')}>
            ← Về trang Bạn bè
          </button>
        </div>
      </div>
    );
  }

  const species = PET_REGISTRY[profile.petId] || PET_REGISTRY.cowdi;
  const evo = getEvolutionInfo(profile.petId || 'cowdi', profile.petEvolution || 0);
  const elem = ELEMENT_COLORS[species?.element] || ELEMENT_COLORS.neutral;
  const pathObj = profile.activePath ? getPathById(profile.activePath) : null;
  const cosmetics = profile.cosmetics || {};
  const roomItem = cosmetics.room ? COSMETIC_MAP[cosmetics.room] : null;
  const effectItem = cosmetics.effect ? COSMETIC_MAP[cosmetics.effect] : null;

  return (
    <div className="container py-3" style={{ maxWidth: 640 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <Link to="/friends" className="btn btn-sm btn-light border">
          🤝 Danh sách bạn bè
        </Link>
      </div>

      <div
        className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3"
        style={{ background: roomItem?.bgStyle || 'linear-gradient(135deg, #FFF8EC 0%, #E8F5E9 100%)' }}
      >
        <div className="card-body text-center p-4">
          <div className="badge bg-white text-dark border mb-2 px-3 py-2 rounded-pill">
            🐾 Pet của <strong>{profile.nickname}</strong> (chỉ xem)
          </div>

          <div className="d-flex justify-content-center my-3" style={{ minHeight: 200 }}>
            <PetAvatar
              petId={profile.petId || 'cowdi'}
              stage={(profile.petEvolution || 0) + 1}
              fallbackSrc={evo?.image || '/assets/images/pets/Cowdi/Cowdi_egg.webp'}
              size={200}
              alt={species?.name || 'Pet'}
            />
          </div>

          <h4 className="fw-bold mb-1">
            {species?.name || 'Cowdi'}{' '}
            <span className="badge bg-dark">C{(profile.petEvolution || 0) + 1}</span>
          </h4>

          <div className="d-flex justify-content-center flex-wrap gap-2 mt-2">
            {elem && (
              <span className="badge rounded-pill" style={{ background: elem.bg || '#eee', color: elem.color || '#333' }}>
                Hệ {elem.name}
              </span>
            )}
            {roomItem && (
              <span className="badge bg-white text-dark border">
                {roomItem.emoji || '🖼️'} Nền: {roomItem.name}
              </span>
            )}
            {effectItem && (
              <span className="badge bg-white text-dark border">
                {effectItem.emoji || '✨'} Hào quang: {effectItem.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Thông tin học tập tối thiểu (BR-08) */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
        <div className="row g-2 small">
          <div className="col-6">
            <div className="text-muted">Nhóm học</div>
            <div className="fw-semibold">
              {profile.learnerGroup ? (GROUP_LABELS[profile.learnerGroup] || profile.learnerGroup) : 'Chưa chọn'}
            </div>
          </div>
          <div className="col-6">
            <div className="text-muted">Lộ trình đang học</div>
            <div className="fw-semibold">
              {pathObj ? `${pathObj.icon || ''} ${pathObj.title}` : 'Chưa chọn'}
            </div>
          </div>
          {profile.lastActiveDate && (
            <div className="col-12 mt-2 pt-2 border-top text-muted">
              📅 Ngày học gần nhất: <strong>{Number.isNaN(new Date(profile.lastActiveDate).getTime()) ? profile.lastActiveDate : new Date(profile.lastActiveDate).toLocaleDateString('vi-VN')}</strong>
            </div>
          )}
        </div>
      </div>

      {/* FR-VIS-02 & FR-VIS-03: Thách đấu bạn bè (không tính LP) */}
      <div className="card border-0 shadow-sm rounded-4 p-3">
        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div>
            <div className="fw-bold">⚔️ Thách đấu giao hữu với {profile.nickname}</div>
            <div className="text-muted small">
              Dùng bộ câu hỏi Duel — trận bạn bè không cộng/trừ điểm xếp hạng (LP).
            </div>
          </div>
          <button
            className="btn btn-cowdi-primary"
            onClick={() => navigate(`/duel?opponentId=${profile.userId}&opponentNick=${encodeURIComponent(profile.nickname)}`)}
          >
            ⚔️ Thách đấu
          </button>
        </div>
      </div>
    </div>
  );
}
