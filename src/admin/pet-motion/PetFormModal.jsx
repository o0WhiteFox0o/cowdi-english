import { useEffect, useState } from 'react';
import { ELEMENT_COLORS } from '../../data/pets';
import { GROUPS, RARITIES } from '../../../shared/game-config.js';
import { getStageImageSpec, optimizePartImageFile } from './api';

const STAGE_PREFIX = ['Trứng', 'Baby', 'Junior', 'Super', 'Legendary'];

function slugifyPetId(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
}

/**
 * Popup Tạo mới / Chỉnh sửa thông tin Pet + Upload ảnh 5 cấp C1–C5.
 * Gọn trong 1 khung modal, không bắt cuộn dài.
 */
export default function PetFormModal({
  open,
  mode = 'create',
  initialPet = null,
  api,
  onClose,
  onSaved,
  onToast,
}) {
  const isEdit = mode === 'edit' && Boolean(initialPet);

  const [petId, setPetId] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [emoji, setEmoji] = useState('🐾');
  const [element, setElement] = useState('neutral');
  const [group, setGroup] = useState('farm');
  const [rarity, setRarity] = useState('common');
  const [description, setDescription] = useState('');
  const [stageNames, setStageNames] = useState(['', '', '', '', '']);
  const [stageFiles, setStageFiles] = useState([null, null, null, null, null]);
  const [stagePreviews, setStagePreviews] = useState(['', '', '', '', '']);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setErr('');
    setBusy(false);
    setStageFiles([null, null, null, null, null]);
    if (isEdit && initialPet) {
      setPetId(initialPet.id || initialPet.petId || '');
      setIdTouched(true);
      setName(initialPet.name || '');
      setSpecies(initialPet.species || '');
      setEmoji(initialPet.emoji || '🐾');
      setElement(initialPet.element || 'neutral');
      setGroup(initialPet.group || 'farm');
      setRarity(initialPet.rarity === 'starter' ? 'common' : (initialPet.rarity || 'common'));
      setDescription(initialPet.description || '');
      setStageNames(
        [0, 1, 2, 3, 4].map((idx) => initialPet.evolutions?.[idx]?.name || `${STAGE_PREFIX[idx]} ${initialPet.name || ''}`.trim())
      );
      setStagePreviews(
        [0, 1, 2, 3, 4].map((idx) => initialPet.evolutions?.[idx]?.image || '')
      );
    } else {
      setPetId('');
      setIdTouched(false);
      setName('');
      setSpecies('');
      setEmoji('🐾');
      setElement('wood');
      setGroup('herb');
      setRarity('rare');
      setDescription('');
      setStageNames(['', '', '', '', '']);
      setStagePreviews(['', '', '', '', '']);
    }
  }, [open, isEdit, initialPet]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const handleNameChange = (val) => {
    setName(val);
    if (!isEdit && !idTouched) {
      setPetId(slugifyPetId(val));
    }
  };

  const handlePickStageFile = (idx, file) => {
    if (!file) return;
    setStageFiles((prev) => {
      const next = [...prev];
      next[idx] = file;
      return next;
    });
    const url = URL.createObjectURL(file);
    setStagePreviews((prev) => {
      const next = [...prev];
      next[idx] = url;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    const cleanId = petId.trim().toLowerCase();
    if (!isEdit && !/^[a-z][a-z0-9_]{1,31}$/.test(cleanId)) {
      setErr('Mã pet chỉ gồm chữ thường a-z, số 0-9, gạch dưới (2–32 ký tự, bắt đầu bằng chữ cái).');
      return;
    }
    if (!name.trim()) {
      setErr('Vui lòng nhập tên hiển thị cho pet.');
      return;
    }

    const evolutions = [0, 1, 2, 3, 4].map((stage) => ({
      stage,
      name: stageNames[stage]?.trim() || `${STAGE_PREFIX[stage]} ${name.trim()}`,
      emoji: stage === 0 ? '🥚' : (emoji.trim() || '🐾'),
      image: initialPet?.evolutions?.[stage]?.image || null,
    }));

    const payload = {
      petId: cleanId,
      name: name.trim(),
      species: species.trim() || name.trim(),
      emoji: emoji.trim() || '🐾',
      element,
      group,
      rarity,
      description: description.trim(),
      evolutions,
      isActive: true,
    };

    setBusy(true);
    try {
      if (isEdit) {
        await api.updatePet(cleanId, payload);
      } else {
        await api.createPet(payload);
      }

      let uploadedCount = 0;
      for (let i = 0; i < 5; i++) {
        const rawFile = stageFiles[i];
        if (!rawFile) continue;
        const stageNum = i + 1;
        let fileToUpload = rawFile;
        if (autoOptimize) {
          const spec = getStageImageSpec(stageNum);
          const opt = await optimizePartImageFile(rawFile, spec.recommended, 0.9);
          fileToUpload = opt.file;
        }
        await api.uploadAvatar(cleanId, stageNum, fileToUpload);
        uploadedCount++;
      }

      onToast?.(
        isEdit
          ? `Đã cập nhật pet "${name.trim()}"${uploadedCount ? ` và tải lên ${uploadedCount} ảnh cấp` : ''}.`
          : `Đã thêm pet mới "${name.trim()}" (${cleanId})${uploadedCount ? ` kèm ${uploadedCount} ảnh cấp` : ''}!`
      );
      onSaved?.(cleanId);
      onClose();
    } catch (error) {
      setErr(error?.message || 'Không thể lưu thông tin pet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cowdi-mini-modal-backdrop" onClick={() => !busy && onClose()}>
      <div
        className="cowdi-mini-modal"
        style={{ maxWidth: 680 }}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Chỉnh sửa thông tin Pet' : 'Thêm Pet mới'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
          <div>
            <h5 className="fw-bold mb-0">
              {isEdit ? `✏️ Chỉnh sửa Pet: ${initialPet?.name || petId}` : '✨ Thêm Pet mới vào hệ thống'}
            </h5>
            <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
              Chuẩn mỹ thuật STD-ART-STYLE v1.1: nền trong suốt, viền #000000, bóng đất #A297AB.
            </div>
          </div>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose} disabled={busy} aria-label="Đóng">
            ✕
          </button>
        </div>

        {err && <div className="alert alert-danger py-2 px-3 small mb-2">{err}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-2 mb-2">
            <div className="col-12 col-sm-5">
              <label className="form-label small fw-bold mb-1">Tên hiển thị *</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="VD: Bánh Mì"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                disabled={busy}
              />
            </div>
            <div className="col-8 col-sm-5">
              <label className="form-label small fw-bold mb-1">Mã Pet (ID) *</label>
              <input
                type="text"
                className="form-control form-control-sm font-monospace"
                placeholder="vd: banh_mi"
                value={petId}
                onChange={(e) => { setIdTouched(true); setPetId(e.target.value.toLowerCase()); }}
                disabled={isEdit || busy}
                required
              />
            </div>
            <div className="col-4 col-sm-2">
              <label className="form-label small fw-bold mb-1">Emoji</label>
              <input
                type="text"
                className="form-control form-control-sm text-center"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={8}
                disabled={busy}
              />
            </div>
          </div>

          <div className="row g-2 mb-2">
            <div className="col-12 col-sm-4">
              <label className="form-label small fw-bold mb-1">Loài / Chủng loại</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="VD: Bánh mì giòn"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="col-4 col-sm-3">
              <label className="form-label small fw-bold mb-1">Hệ (10 hệ)</label>
              <select className="form-select form-select-sm" value={element} onChange={(e) => setElement(e.target.value)} disabled={busy}>
                {Object.entries(ELEMENT_COLORS).map(([k, el]) => (
                  <option key={k} value={k}>{el.name}</option>
                ))}
              </select>
            </div>
            <div className="col-4 col-sm-3">
              <label className="form-label small fw-bold mb-1">Nhóm kỹ năng</label>
              <select className="form-select form-select-sm" value={group} onChange={(e) => setGroup(e.target.value)} disabled={busy}>
                {Object.entries(GROUPS).map(([k, g]) => (
                  <option key={k} value={k}>{g.labelVi}</option>
                ))}
              </select>
            </div>
            <div className="col-4 col-sm-2">
              <label className="form-label small fw-bold mb-1">Độ hiếm</label>
              <select className="form-select form-select-sm" value={rarity} onChange={(e) => setRarity(e.target.value)} disabled={busy}>
                {Object.entries(RARITIES).map(([k, r]) => (
                  <option key={k} value={k}>{r.labelVi}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Mô tả ngắn</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Tính cách, vai trò đồng hành cùng học viên…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={busy}
            />
          </div>

          {/* Upload 5 cấp tiến hóa C1-C5 */}
          <div className="p-2 rounded-3 mb-2" style={{ background: '#f6fbf7', border: '1px dashed #b9d5c0' }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-2">
              <span className="small fw-bold text-success">🖼️ Ảnh &amp; Tên 5 cấp tiến hoá (C1–C5 · PNG/WebP)</span>
              <label className="form-check form-check-inline mb-0 small text-muted">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={autoOptimize}
                  onChange={(e) => setAutoOptimize(e.target.checked)}
                  disabled={busy}
                />
                Tự nén WebP chuẩn (512/640px)
              </label>
            </div>
            <div className="row g-2">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div key={idx} className="col-6 col-sm">
                  <div className="border rounded-3 bg-white p-1 text-center h-100 d-flex flex-column gap-1">
                    <div className="small fw-bold text-muted" style={{ fontSize: '0.72rem' }}>C{idx + 1} · {STAGE_PREFIX[idx]}</div>
                    <label
                      className="d-flex align-items-center justify-content-center rounded bg-light"
                      style={{ height: 64, cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                      title="Bấm chọn ảnh PNG/WebP"
                    >
                      {stagePreviews[idx] ? (
                        <img src={stagePreviews[idx]} alt={`C${idx + 1}`} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                      ) : (
                        <span className="small text-muted" style={{ fontSize: '0.72rem' }}>+ Ảnh</span>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/webp"
                        hidden
                        disabled={busy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) handlePickStageFile(idx, f);
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm px-1 py-0"
                      style={{ fontSize: '0.74rem' }}
                      placeholder={`${STAGE_PREFIX[idx]} ${name || 'Pet'}`}
                      value={stageNames[idx]}
                      onChange={(e) => setStageNames((prev) => { const n = [...prev]; n[idx] = e.target.value; return n; })}
                      disabled={busy}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose} disabled={busy}>
              Huỷ
            </button>
            <button type="submit" className="btn btn-sm btn-cowdi-primary px-4" disabled={busy}>
              {busy ? 'Đang lưu & tải ảnh…' : isEdit ? 'Lưu thay đổi' : '+ Tạo Pet mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
