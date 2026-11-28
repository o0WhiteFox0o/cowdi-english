import { useMemo, useState } from 'react';
import { PET_REGISTRY } from '../../data/pets';
import { shouldFlipPetHorizontal } from '../../../shared/pet-facing.js';
import { PET_MOTION_API_BASE, normalizeApiAssetUrl } from './api';

const FACING_OPTIONS = [
  { value: 'left', label: '⬅️ Gốc nhìn Trái', hint: 'Sẽ lật khi đứng phe mình (bên trái)' },
  { value: 'right', label: '➡️ Gốc nhìn Phải', hint: 'Sẽ lật khi đứng đối thủ (bên phải)' },
  { value: 'front', label: '⏺️ Chính diện', hint: 'Không lật ngang ở bất kỳ bên nào' },
];

export default function PetFacingReviewModal({
  open,
  pets = [],
  dynamicPetMap = {},
  savingMap = {},
  onSaveStage,
  onSaveBulk,
  onClose,
}) {
  const [filterMode, setFilterMode] = useState('unverified'); // 'unverified' | 'all'
  const [search, setSearch] = useState('');

  const items = useMemo(() => {
    const out = [];
    const q = search.trim().toLowerCase();
    for (const row of pets) {
      const reg = dynamicPetMap[row.petId] || PET_REGISTRY[row.petId];
      const petName = reg?.name || row.name || row.petId;
      if (q && !petName.toLowerCase().includes(q) && !row.petId.includes(q)) continue;
      for (let s = 1; s <= 5; s++) {
        const cell = row.stages?.[`c${s}`];
        if (!cell) continue;
        if (filterMode === 'unverified' && cell.facingVerified) continue;
        const evo = reg?.evolutions?.[s - 1];
        const rawImg = cell.avatarUrl
          ? `${PET_MOTION_API_BASE}${normalizeApiAssetUrl(cell.avatarUrl)}`
          : evo?.image || '';
        out.push({
          key: `${row.petId}/c${s}`,
          petId: row.petId,
          petName,
          stage: s,
          stageName: evo?.name || `Cấp ${s}`,
          emoji: evo?.emoji || reg?.emoji || '🐾',
          imgSrc: rawImg,
          nativeFacing: cell.nativeFacing || 'left',
          facingVerified: Boolean(cell.facingVerified),
        });
      }
    }
    return out;
  }, [pets, dynamicPetMap, filterMode, search]);

  if (!open) return null;

  const totalStages = pets.length * 5;
  const verifiedCount = pets.reduce(
    (sum, p) => sum + [1, 2, 3, 4, 5].filter((s) => p.stages?.[`c${s}`]?.facingVerified).length,
    0
  );

  return (
    <div
      className="cowdi-mini-modal-backdrop"
      style={{ zIndex: 1060 }}
      onClick={onClose}
    >
      <div
        className="cowdi-mini-modal"
        style={{
          maxWidth: 980,
          width: '96vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2 bg-light">
          <div>
            <h5 className="fw-bold mb-0">🧭 Xác nhận hướng xoay Pet trong Đấu trường</h5>
            <div className="small text-muted">
              Đã xác nhận: <strong className="text-success">{verifiedCount}/{totalStages}</strong> cấp ·
              Mục tiêu: đứng <strong>bên Trái</strong> phải nhìn sang <strong>Phải →</strong>, đứng <strong>bên Phải</strong> phải nhìn sang <strong>Trái ←</strong>.
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <input
              type="search"
              className="form-control form-control-sm"
              style={{ width: 170 }}
              placeholder="Tìm tên pet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className={`pm-chip-btn ${filterMode === 'unverified' ? 'active' : ''}`}
              onClick={() => setFilterMode('unverified')}
            >
              Chưa duyệt ({totalStages - verifiedCount})
            </button>
            <button
              type="button"
              className={`pm-chip-btn ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              Tất cả ({totalStages})
            </button>
            <button type="button" className="btn-close" aria-label="Đóng" onClick={onClose} />
          </div>
        </div>

        <div className="p-3" style={{ overflowY: 'auto', flex: 1 }}>
          {items.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: '2rem' }}>🎉</div>
              <div className="fw-bold mt-2">
                {filterMode === 'unverified'
                  ? 'Tất cả các cấp pet đã được xác nhận hướng xoay!'
                  : 'Không tìm thấy pet khớp bộ lọc.'}
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {items.map((item) => {
                const isSaving = Boolean(savingMap[item.key] || savingMap[`bulk:${item.petId}`]);
                const flipLeftSide = shouldFlipPetHorizontal(item.nativeFacing, 'right');
                const flipRightSide = shouldFlipPetHorizontal(item.nativeFacing, 'left');

                return (
                  <div key={item.key} className="col-md-6">
                    <div
                      className={`border rounded-3 p-3 h-100 ${
                        item.facingVerified ? 'border-success bg-white' : 'border-warning bg-light'
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                        <div className="fw-bold">
                          {item.petName} <span className="badge bg-dark">C{item.stage}</span>{' '}
                          <span className="small text-muted fw-normal">{item.stageName}</span>
                        </div>
                        <span
                          className={`badge ${
                            item.facingVerified ? 'bg-success' : 'bg-warning text-dark'
                          }`}
                        >
                          {item.facingVerified ? '✓ Đã xác nhận' : 'Chưa xác nhận'}
                        </span>
                      </div>

                      {/* Mini Arena preview 2 bên */}
                      <div
                        className="rounded-3 p-2 mb-2 d-flex align-items-center justify-content-around"
                        style={{
                          background: 'linear-gradient(180deg, #bae6fd 0%, #dbeafe 55%, #bbf7d0 55%, #86efac 100%)',
                          minHeight: 112,
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        <div className="text-center">
                          <div className="small fw-bold text-dark mb-1" style={{ fontSize: '0.7rem' }}>
                            Phe mình (→ nhìn phải)
                          </div>
                          {item.imgSrc ? (
                            <img
                              src={item.imgSrc}
                              alt={`${item.petName} left`}
                              style={{
                                width: 74,
                                height: 74,
                                objectFit: 'contain',
                                transform: flipLeftSide ? 'scaleX(-1)' : undefined,
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '2.2rem' }}>{item.emoji}</span>
                          )}
                        </div>
                        <div className="fw-black text-danger small px-1">VS</div>
                        <div className="text-center">
                          <div className="small fw-bold text-dark mb-1" style={{ fontSize: '0.7rem' }}>
                            Đối thủ (← nhìn trái)
                          </div>
                          {item.imgSrc ? (
                            <img
                              src={item.imgSrc}
                              alt={`${item.petName} right`}
                              style={{
                                width: 74,
                                height: 74,
                                objectFit: 'contain',
                                transform: flipRightSide ? 'scaleX(-1)' : undefined,
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '2.2rem' }}>{item.emoji}</span>
                          )}
                        </div>
                      </div>

                      {/* Chọn hướng gốc & Xác nhận */}
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {FACING_OPTIONS.map((opt) => {
                          const active = item.nativeFacing === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isSaving}
                              title={opt.hint}
                              className={`btn btn-sm flex-grow-1 ${
                                active ? 'btn-primary fw-bold' : 'btn-outline-secondary'
                              }`}
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => onSaveStage(item.petId, item.stage, opt.value, true)}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          className="btn btn-link btn-sm p-0 text-decoration-none"
                          style={{ fontSize: '0.74rem' }}
                          onClick={() => onSaveBulk(item.petId, item.nativeFacing, true)}
                          title={`Áp dụng hướng "${item.nativeFacing}" và xác nhận cả 5 cấp của ${item.petName}`}
                        >
                          Áp dụng cho cả 5 cấp {item.petName}
                        </button>
                        {!item.facingVerified && (
                          <button
                            type="button"
                            disabled={isSaving}
                            className="btn btn-sm btn-success fw-bold"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => onSaveStage(item.petId, item.stage, item.nativeFacing, true)}
                          >
                            {isSaving ? 'Đang lưu...' : '✓ Giữ & Xác nhận'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
