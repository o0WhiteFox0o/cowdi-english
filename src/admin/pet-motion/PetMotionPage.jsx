import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSEO } from '../../hooks/useSEO';
import { PET_REGISTRY, ELEMENT_COLORS, mergeDynamicPetCatalog } from '../../data/pets';
import { GROUPS, RARITIES, RARITY_ALIASES } from '../../../shared/game-config.js';
import { CLIPS } from '../../../shared/pet-motion.js';
import {
  EMOJI_POSITIONS,
  EMOJI_PRESETS,
  getClipLabelVi,
  getDefaultClipEmoji,
} from '../../../shared/pet-motion-labels.js';
import {
  MAX_PET_IMAGE_BYTES,
  PET_MOTION_API_BASE,
  buildDefaultRigFromFiles,
  createPetMotionApi,
  getStageImageSpec,
  inferPartNameFromFile,
  loadAnyPetSourceToCanvas,
  normalizeApiAssetUrl,
  optimizePartImageFile,
  petSourceToFile,
  readImageDimensions,
} from './api';
import { initEditor } from './editor';
import PartPaintModal from './PartPaintModal';
import PetFormModal from './PetFormModal';
import PetFacingReviewModal from './PetFacingReviewModal';
import StudyPreviewTab from './StudyPreviewTab';
import { invalidatePetMotionCache } from '../../pet-rig/motionCache';
import './pet-motion.css';

const ALL_CLIP_NAMES = Object.keys(CLIPS);
const PET_LIST = Object.values(PET_REGISTRY);
const SUGGEST_PART_ORDER = ['body', 'head', 'armL', 'armR', 'crown', 'front', 'eye0', 'eye1'];
const PART_VI_LABELS = {
  body: 'Thân (body)',
  head: 'Đầu (head)',
  crown: 'Chỏm / Tai (crown)',
  armL: 'Tay trái (armL)',
  armR: 'Tay phải (armR)',
  front: 'Lớp trước (front)',
  fx: 'Hiệu ứng (fx)',
  aura: 'Hào quang (aura)',
  eye0: 'Mắt 1 (eye0)',
  eye1: 'Mắt 2 (eye1)',
};

/**
 * Gom danh sách ảnh hiện có của pet (ưu tiên đúng cấp đang chọn -> các cấp khác C1..C5 cùng pet;
 * nếu loài pet này chưa có bất kỳ ảnh nào ở cả 5 cấp thì bổ sung phôi tham chiếu cùng nhóm + khung trống)
 * để họa sĩ luôn có thể tự cắt bộ phận hoặc vẽ đè lại ngay trong trình duyệt.
 */
function collectPetSuggestedSources(petObj, preferStageNum = 1, allPetsList = PET_LIST, brokenMap = {}) {
  const spec = getStageImageSpec(preferStageNum);
  const sources = [];
  if (petObj) {
    const stageOrder = [1, 2, 3, 4, 5].sort((a, b) => {
      if (a === preferStageNum) return -1;
      if (b === preferStageNum) return 1;
      return Math.abs(a - preferStageNum) - Math.abs(b - preferStageNum);
    });
    for (const s of stageOrder) {
      const stKey = `${petObj.id}/c${s}`;
      if (brokenMap?.[stKey]) continue;
      const evo = petObj.evolutions?.[s - 1];
      const rawImg = evo?.image;
      if (!rawImg) continue;
      const url = rawImg.startsWith('/api/')
        ? `${PET_MOTION_API_BASE}${normalizeApiAssetUrl(rawImg)}`
        : normalizeApiAssetUrl(rawImg);
      sources.push({
        id: `self-c${s}`,
        kind: 'url',
        stage: s,
        isSamePet: true,
        url,
        shortLabel: `${petObj.name} C${s}`,
        label:
          s === preferStageNum
            ? `Ảnh hiện có: ${petObj.name} C${s} · ${evo?.name || `Cấp ${s}`}`
            : `Ảnh cấp khác của ${petObj.name}: C${s} · ${evo?.name || `Cấp ${s}`}`,
      });
    }
  }

  // Nếu cả 5 cấp của pet đều chưa có ảnh (vd Bánh Bao / Nấm Rơm / Pet mới tạo chưa kịp vẽ):
  // gợi ý phôi pet cùng nhóm có sẵn trong hệ thống để họa sĩ mượn tỉ lệ / cắt sửa / vẽ lại.
  if (sources.length === 0 && Array.isArray(allPetsList)) {
    const targetGroup = petObj?.group || 'farm';
    const candidates = [
      ...allPetsList.filter((p) => p.id !== petObj?.id && p.group === targetGroup),
      ...allPetsList.filter((p) => p.id !== petObj?.id && p.group !== targetGroup),
    ];
    for (const other of candidates) {
      if (sources.length >= 4) break;
      const stKey = `${other.id}/c${preferStageNum}`;
      if (brokenMap?.[stKey]) continue;
      const evo = other.evolutions?.[preferStageNum - 1] || other.evolutions?.[0];
      if (!evo?.image) continue;
      const url = evo.image.startsWith('/api/')
        ? `${PET_MOTION_API_BASE}${normalizeApiAssetUrl(evo.image)}`
        : normalizeApiAssetUrl(evo.image);
      sources.push({
        id: `ref-${other.id}-c${preferStageNum}`,
        kind: 'url',
        stage: preferStageNum,
        isSamePet: false,
        url,
        shortLabel: `Mẫu ${other.name} C${preferStageNum}`,
        label: `Phôi tham chiếu (${other.name} C${preferStageNum}) — dùng để vẽ đè / cắt sửa`,
      });
    }
  }

  sources.push({
    id: `blank-${spec.recommended}`,
    kind: 'blank',
    width: spec.recommended,
    height: spec.recommended,
    shortLabel: `Khung trống ${spec.recommended}px`,
    label: `Khung trống chuẩn ${spec.recommended}×${spec.recommended} px (tự vẽ mới từ đầu)`,
  });

  return sources;
}

function fmtClock(date) {
  if (!date) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function downloadJsonFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Khung tạo rig từ nhiều ảnh PNG tách lớp ──────────────────────────────────
function RigCreatorCard({ pet, stage, api, suggestedSources = [], onOpenStudioForItem, onCreated, onToast }) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [suggestIdx, setSuggestIdx] = useState(0);
  const [importingSuggest, setImportingSuggest] = useState(false);
  const [err, setErr] = useState('');

  const spec = getStageImageSpec(stage);
  const selectedSuggest = suggestedSources[suggestIdx] || suggestedSources[0] || null;

  const updateItemFile = useCallback((id, nextFile, width, height) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, file: nextFile, width, height } : it))
    );
  }, []);

  const handleImportSuggestedToTable = async () => {
    if (!selectedSuggest || importingSuggest || busy) return;
    setImportingSuggest(true);
    setErr('');
    try {
      const usedParts = new Set(items.map((x) => x.part));
      const nextPart = SUGGEST_PART_ORDER.find((p) => !usedParts.has(p)) || 'body';
      const { file, width, height } = await petSourceToFile(
        selectedSuggest,
        `${nextPart}.png`,
        api,
        spec.maxEdge
      );
      const newItem = {
        id: `suggest-${nextPart}-${Date.now()}-${Math.random()}`,
        file,
        part: nextPart,
        width,
        height,
      };
      setItems((prev) => [...prev, newItem]);
      onToast(
        `Đã nạp "${selectedSuggest.shortLabel || selectedSuggest.label}" làm bộ phận "${nextPart}". Bấm "✂️ Cắt / Vẽ lại" để tách vùng mong muốn!`
      );
    } catch (e) {
      setErr(e.message || 'Không nạp được ảnh hiện có của pet.');
    } finally {
      setImportingSuggest(false);
    }
  };

  const handleQuickRigAndOpenStudio = async () => {
    if (!selectedSuggest || importingSuggest || busy) return;
    setBusy(true);
    setErr('');
    try {
      const { file } = await petSourceToFile(selectedSuggest, 'body.png', api, spec.maxEdge);
      const rig = await buildDefaultRigFromFiles([{ part: 'body', file }]);
      await api.uploadPart(pet.id, stage, 'body', file);
      await api.saveRig(pet.id, stage, rig);
      onToast(`Đã khởi tạo Rig từ "${selectedSuggest.shortLabel}" — mở Studio để họa sĩ tự cắt / vẽ lại!`);
      await onCreated({ autoOpenPart: 'body' });
    } catch (e) {
      setErr(e.message || 'Không khởi tạo được rig từ ảnh gợi ý.');
    } finally {
      setBusy(false);
    }
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setErr('');

    const dimsList = await Promise.all(
      files.map((f) => readImageDimensions(f).catch(() => ({ width: 0, height: 0 })))
    );

    setItems((prev) => {
      const hasBodyAlready = prev.some((x) => x.part === 'body');
      const next = files.map((file, idx) => {
        let inferred = inferPartNameFromFile(file.name);
        if (!inferred && !hasBodyAlready && prev.length === 0 && idx === 0 && files.length === 1) {
          inferred = 'body';
        }
        return {
          id: `${file.name}-${file.size}-${Math.random()}`,
          file,
          part: inferred || '',
          width: dimsList[idx].width,
          height: dimsList[idx].height,
        };
      });
      return [...prev, ...next];
    });
  };

  const updatePart = (id, part) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, part } : it)));
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const hasOversizeBytes = items.some((it) => it.file.size > MAX_PET_IMAGE_BYTES);
  const hasOversizeDims = items.some((it) => Math.max(it.width || 0, it.height || 0) > spec.maxEdge);
  const bodyRef = items.find((it) => it.part === 'body') || items[0] || null;
  const hasMismatchedCanvas = Boolean(
    bodyRef?.width &&
      items.some((it) => it.width && (it.width !== bodyRef.width || it.height !== bodyRef.height))
  );

  const handleOptimizeAll = async () => {
    if (!items.length || optimizing) return;
    setOptimizing(true);
    setErr('');
    try {
      const next = [];
      for (const it of items) {
        const res = await optimizePartImageFile(it.file, spec.recommended, 0.92);
        next.push({
          ...it,
          file: res.file,
          width: res.width,
          height: res.height,
        });
      }
      setItems(next);
      onToast(`Đã tối ưu ${next.length} ảnh về chuẩn ≤ ${spec.recommended}px (WebP nền trong suốt).`);
    } catch (e) {
      setErr(e.message || 'Không tối ưu được ảnh.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleCreate = async () => {
    if (!items.length) {
      setErr('Vui lòng chọn ít nhất 1 ảnh PNG/WebP (nên có body.png).');
      return;
    }
    const invalid = items.find((it) => !/^[a-z][a-zA-Z0-9_]{0,30}$/.test(it.part));
    if (invalid) {
      setErr(`Tên bộ phận không hợp lệ cho file "${invalid.file.name}". Dùng: body, head, crown, armL, armR, front, fx, aura, eye0, eye1…`);
      return;
    }
    const tooBig = items.find((it) => it.file.size > MAX_PET_IMAGE_BYTES);
    if (tooBig) {
      setErr(
        `File "${tooBig.file.name}" (${(tooBig.file.size / 1024).toFixed(0)} KB) vượt quá giới hạn 2 MB. Hãy bấm "Thu gọn về chuẩn ≤ ${spec.recommended}px (WebP)" bên trên trước khi tải lên.`
      );
      return;
    }

    setBusy(true);
    setErr('');
    try {
      const rig = await buildDefaultRigFromFiles(items);
      for (const it of items) {
        await api.uploadPart(pet.id, stage, it.part, it.file);
      }
      await api.saveRig(pet.id, stage, rig);
      onToast(`Đã tạo rig nháp cho ${pet.name} C${stage} (${items.length} bộ phận).`);
      onCreated();
    } catch (e) {
      setErr(e.message || 'Lỗi tạo rig từ ảnh tách lớp.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pm-card my-3">
      <h5 className="fw-bold mb-1">Tạo rig từ ảnh tách lớp · {pet.name} C{stage}</h5>
      <p className="pm-sub mb-2">
        Cấp này chưa có rig. Chọn nhiều file PNG/WebP tách lớp cùng lúc — hệ thống tự nhận bộ phận theo tên file
        (<code>body, head, crown, armL, armR, front, fx, aura, eye0, eye1</code>), tự tính kích thước, mặt đất,
        hộp mắt và điểm xoay mặc định.
      </p>

      {/* Gợi ý kích thước ảnh chuẩn theo thiết kế PetRig (420×460 @ 2× DPR) */}
      <div className="pm-spec-box mb-3">
        <div className="fw-bold small mb-1">
          📐 Gợi ý kích thước ảnh chuẩn cho {spec.name} (khung hiển thị 420×460 @ 2× Retina)
        </div>
        <div className="pm-spec-grid">
          <span>
            <strong>Kích thước khuyến nghị:</strong>{' '}
            <code>{spec.recommended} × {spec.recommended} px</code>{' '}
            <span className="text-muted">(tối thiểu {spec.minEdge}px · nên ≤ {spec.maxEdge}px)</span>
          </span>
          <span>
            <strong>Định dạng &amp; nền:</strong> <code>WebP</code> (ưu tiên, nhẹ ~80%) hoặc <code>PNG</code> nền trong suốt
          </span>
          <span>
            <strong>Dung lượng tối đa:</strong> <code>≤ 2 MB / file</code>{' '}
            <span className="text-muted">(khuyến nghị 50–250 KB/lớp)</span>
          </span>
          <span>
            <strong>Đồng bộ khung:</strong> mọi lớp cùng cấp (<code>body</code>, <code>head</code>, <code>armL</code>…) nên xuất <strong>cùng kích thước W×H</strong> để tự khớp toạ độ
          </span>
        </div>
      </div>

      {/* Đề xuất lấy ảnh hiện có của pet để họa sĩ tự cắt / tự vẽ lại khi chưa có file tách lớp */}
      {suggestedSources.length > 0 && (
        <div
          className="p-3 rounded-3 mb-3"
          style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
            <div className="fw-bold small" style={{ color: '#92400e' }}>
              ✂️ Chưa có ảnh bộ phận tách rời? Lấy ảnh hiện có của {pet.name} để họa sĩ tự cắt / tự vẽ lại
            </div>
            <span className="pm-badge draft">Khuyên dùng khi thiếu file lẻ</span>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            {selectedSuggest?.url && (
              <img
                src={selectedSuggest.url}
                alt={selectedSuggest.shortLabel}
                style={{
                  width: 52,
                  height: 52,
                  objectFit: 'contain',
                  background: '#fff',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  padding: 3,
                }}
              />
            )}
            <select
              className="form-select form-select-sm"
              style={{ maxWidth: 360, flex: '1 1 220px' }}
              value={suggestIdx}
              disabled={busy || importingSuggest}
              onChange={(e) => setSuggestIdx(Number(e.target.value))}
            >
              {suggestedSources.map((src, idx) => (
                <option key={src.id || idx} value={idx}>
                  {src.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="pm-btn primary"
              disabled={busy || optimizing || importingSuggest}
              onClick={handleQuickRigAndOpenStudio}
              title="Dùng ảnh này tạo ngay bộ phận Thân (body) và mở thẳng Studio để họa sĩ khoanh cắt / vẽ lại"
            >
              {busy ? 'Đang tạo…' : '⚡ Dùng ảnh này & Mở Studio cắt/vẽ ngay'}
            </button>
            <button
              type="button"
              className="pm-btn"
              disabled={busy || optimizing || importingSuggest}
              onClick={handleImportSuggestedToTable}
              title="Nạp ảnh này vào bảng bên dưới (bấm nhiều lần để tạo thêm body, head, armL… rồi bấm Cắt / Vẽ trên từng dòng)"
            >
              {importingSuggest ? 'Đang nạp…' : '📥 + Đưa vào danh sách để tách nhiều lớp'}
            </button>
          </div>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <label className="pm-btn primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
          + Chọn nhiều ảnh PNG / WebP
          <input type="file" multiple accept="image/png,image/webp" hidden onChange={handleFiles} disabled={busy || optimizing} />
        </label>
        {(hasOversizeBytes || hasOversizeDims) && (
          <button
            type="button"
            className="pm-btn warn"
            onClick={handleOptimizeAll}
            disabled={busy || optimizing}
            title={`Thu gọn toàn bộ danh sách về cạnh dài ≤ ${spec.recommended}px dạng WebP nền trong suốt`}
          >
            {optimizing ? 'Đang thu gọn…' : `✨ Thu gọn về chuẩn ≤ ${spec.recommended}px (WebP)`}
          </button>
        )}
        {items.length > 0 && (
          <button type="button" className="pm-btn" onClick={() => setItems([])} disabled={busy || optimizing}>
            Xoá danh sách
          </button>
        )}
      </div>

      {hasMismatchedCanvas && (
        <div className="alert alert-warning py-2 small mb-2">
          ⚠️ Các lớp ảnh đang có kích thước khung <code>W×H</code> khác nhau — nên xuất cùng kích thước khung để các bộ phận tự khớp đúng vị trí.
        </div>
      )}

      {items.length > 0 && (
        <div className="table-responsive mb-3">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Tên file</th>
                <th>Kích thước · Dung lượng</th>
                <th>Bộ phận nhận diện</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const overBytes = it.file.size > MAX_PET_IMAGE_BYTES;
                const overDims = Math.max(it.width || 0, it.height || 0) > spec.maxEdge;
                return (
                  <tr key={it.id}>
                    <td className="small fw-semibold">{it.file.name}</td>
                    <td className="small">
                      <div className="d-flex flex-wrap align-items-center gap-1">
                        {it.width > 0 && (
                          <span className={overDims ? 'text-warning-emphasis fw-bold' : 'text-muted'}>
                            {it.width}×{it.height} px ·
                          </span>
                        )}
                        <span className={overBytes ? 'text-danger fw-bold' : 'text-muted'}>
                          {(it.file.size / 1024).toFixed(1)} KB
                        </span>
                        {overBytes && <span className="pm-badge warn" style={{ background: '#fee2e2', color: '#b91c1c' }}>Vượt 2 MB</span>}
                        {!overBytes && overDims && <span className="pm-badge draft">Nên ≤ {spec.maxEdge}px</span>}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1 align-items-center">
                        <select
                          className="form-select form-select-sm"
                          style={{ minWidth: 165, maxWidth: 195 }}
                          value={['body', 'head', 'crown', 'armL', 'armR', 'front', 'fx', 'aura', 'eye0', 'eye1'].includes(it.part) ? it.part : ''}
                          onChange={(e) => { if (e.target.value) updatePart(it.id, e.target.value); }}
                          disabled={busy || optimizing}
                        >
                          <option value="">Chọn bộ phận…</option>
                          <option value="body">body (Thân)</option>
                          <option value="head">head (Đầu)</option>
                          <option value="crown">crown (Chỏm)</option>
                          <option value="armL">armL (Tay trái)</option>
                          <option value="armR">armR (Tay phải)</option>
                          <option value="front">front (Lớp trước)</option>
                          <option value="fx">fx (Hiệu ứng)</option>
                          <option value="aura">aura (Hào quang)</option>
                          <option value="eye0">eye0 (Mắt 1)</option>
                          <option value="eye1">eye1 (Mắt 2)</option>
                        </select>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={{ maxWidth: 115 }}
                          value={it.part}
                          placeholder="hoặc tên khác"
                          onChange={(e) => updatePart(it.id, e.target.value.trim())}
                          disabled={busy || optimizing}
                        />
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        {onOpenStudioForItem && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            disabled={busy || optimizing}
                            onClick={() => onOpenStudioForItem(it, updateItemFile)}
                            title="Mở Studio khoanh vùng cắt lấy bộ phận hoặc vẽ sửa lại ảnh này trước khi tải lên"
                          >
                            ✂️ Cắt / Vẽ lại
                          </button>
                        )}
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(it.id)} disabled={busy || optimizing}>
                          Bỏ
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {err && <div className="alert alert-danger py-2 small mb-3">{err}</div>}

      <button type="button" className="pm-btn primary" onClick={handleCreate} disabled={busy || optimizing || items.length === 0}>
        {busy ? 'Đang tải ảnh và dựng rig…' : `Tải lên ${items.length} ảnh & Tạo rig nháp`}
      </button>
    </div>
  );
}

// ── Trang chính /admin/pet-motion ────────────────────────────────────────────
export default function PetMotionPage() {
  useSEO({ title: 'Quản lý Pet & Chuyển động (Admin) — Cowdi English' });
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const api = useMemo(() => createPetMotionApi(token), [token]);

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [rigFilter, setRigFilter] = useState('all'); // 'all' | 'has_rig' | 'no_rig'
  const [brokenImgs, setBrokenImgs] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState({});
  const [petModal, setPetModal] = useState({ open: false, mode: 'create', pet: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingPet, setDeletingPet] = useState(false);

  // Danh sách pet động (gộp PET_REGISTRY gốc + pet mới/sửa từ API overview)
  const dynamicPetList = useMemo(() => {
    const map = new Map();
    for (const p of Object.values(PET_REGISTRY)) {
      map.set(p.id, p);
    }
    for (const row of overview?.pets || []) {
      const base = map.get(row.petId);
      const evos = Array.isArray(row.evolutions) && row.evolutions.length === 5
        ? row.evolutions.map((ev, idx) => ({
            ...ev,
            image: row.stages?.[`c${idx + 1}`]?.avatarUrl
              ? `${PET_MOTION_API_BASE}${row.stages[`c${idx + 1}`].avatarUrl}`
              : (ev.image || base?.evolutions?.[idx]?.image || null),
          }))
        : (base?.evolutions || [0, 1, 2, 3, 4].map((stage) => ({
            stage,
            name: `Cấp ${stage + 1}`,
            emoji: stage === 0 ? '🥚' : (row.emoji || '🐾'),
            image: row.stages?.[`c${stage + 1}`]?.avatarUrl
              ? `${PET_MOTION_API_BASE}${row.stages[`c${stage + 1}`].avatarUrl}`
              : null,
          })));
      map.set(row.petId, {
        ...(base || {}),
        id: row.petId,
        name: row.name || base?.name || row.petId,
        species: row.species || base?.species || row.name || row.petId,
        emoji: row.emoji || base?.emoji || '🐾',
        element: row.element || base?.element || 'neutral',
        group: row.group || base?.group || 'farm',
        rarity: row.rarity || base?.rarity || 'common',
        description: row.description ?? base?.description ?? '',
        evolutions: evos,
        isCustom: Boolean(row.isCustom),
      });
    }
    return Array.from(map.values());
  }, [overview]);

  const dynamicPetMap = useMemo(
    () => Object.fromEntries(dynamicPetList.map((p) => [p.id, p])),
    [dynamicPetList]
  );

  const selectedPetId = searchParams.get('pet') || '';
  const selectedStageNum = Number(searchParams.get('stage')) || 0;
  const isPreviewView = searchParams.get('view') === 'preview';
  const isEditorView =
    !isPreviewView &&
    Boolean(selectedPetId && dynamicPetMap[selectedPetId] && selectedStageNum >= 1 && selectedStageNum <= 5);

  // Editor state
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [clip, setClip] = useState('cheer_small');
  const [scope, setScope] = useState('one');
  const [filterUnapproved, setFilterUnapproved] = useState(false);
  const [saveState, setSaveState] = useState({ status: 'idle', message: '', at: null });
  const [toastMsg, setToastMsg] = useState('');
  const [learnerPreview, setLearnerPreview] = useState(false);
  const [learnerData, setLearnerData] = useState(null);

  // Duyệt 1 vòng 1×
  const [approvingPreview, setApprovingPreview] = useState(false);
  const [confirmApproveClip, setConfirmApproveClip] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);

  // Xuất bản bản chung modal
  const [publishDialog, setPublishDialog] = useState(null); // { clip, affected: [], resetApprovals: true }
  const [addPartChoice, setAddPartChoice] = useState('head'); // tên bộ phận cụ thể hoặc 'auto'
  const [addingPart, setAddingPart] = useState(false);
  const [emojiCfg, setEmojiCfg] = useState({ enabled: false, char: '✨', imageUrl: '', pos: 'top-right' });
  const [customEmojis, setCustomEmojis] = useState([]);
  const [uploadingEmoji, setUploadingEmoji] = useState(false);

  const editorRootRef = useRef(null);
  const editorCtrlRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Modal vẽ sửa trực tiếp ảnh bộ phận / cắt từ ảnh hiện có của pet
  const [paintTarget, setPaintTarget] = useState(null);
  const [paintSaving, setPaintSaving] = useState(false);
  const [missingParts, setMissingParts] = useState([]);
  const [suggestSourceIdx, setSuggestSourceIdx] = useState(0);
  const [openingStudio, setOpeningStudio] = useState(false);
  const pendingAutoOpenPartRef = useRef(null);
  const [facingModalOpen, setFacingModalOpen] = useState(false);
  const [savingFacing, setSavingFacing] = useState({});

  // Tab & thu gọn bảng phụ bên phải để luôn nhìn thấy sân khấu pet khi đặt keyframe
  const [sideTab, setSideTab] = useState('clips'); // 'clips' | 'parts' | 'settings'
  const [sideCollapsed, setSideCollapsed] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(''), 2200);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // ── Tải tổng quan toàn bộ pet × 5 cấp ──
  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError('');
    try {
      const json = await api.getOverview();
      if (Array.isArray(json?.pets)) {
        const dynamicPets = json.pets
          .filter((p) => p.name || p.isCustom)
          .map((p) => ({
            id: p.petId,
            name: p.name,
            species: p.species,
            emoji: p.emoji,
            element: p.element,
            group: p.group,
            rarity: p.rarity,
            description: p.description,
            evolutions: p.evolutions,
            unlockCondition: p.unlock,
            isCustom: p.isCustom,
          }));
        const avatars = {};
        const facing = {};
        for (const p of json.pets) {
          for (let s = 1; s <= 5; s++) {
            const st = p.stages?.[`c${s}`];
            if (st?.avatarUrl) avatars[`${p.petId}/c${s}`] = st.avatarUrl;
            if (st?.nativeFacing) {
              facing[`${p.petId}/c${s}`] = {
                nativeFacing: st.nativeFacing,
                facingVerified: Boolean(st.facingVerified),
              };
            }
          }
        }
        mergeDynamicPetCatalog({ pets: dynamicPets, avatars, facing }, PET_MOTION_API_BASE);
      }
      setOverview(json);
    } catch (err) {
      setOverviewError(err.message || 'Không tải được tổng quan.');
    } finally {
      setOverviewLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!isEditorView && !isPreviewView) {
      loadOverview();
    }
  }, [isEditorView, isPreviewView, loadOverview]);

  const handleSaveStageFacing = useCallback(
    async (petId, stageNum, nativeFacing, facingVerified = true) => {
      const key = `${petId}/c${stageNum}`;
      setSavingFacing((prev) => ({ ...prev, [key]: true }));
      try {
        await api.saveFacing(petId, stageNum, { nativeFacing, facingVerified });
        mergeDynamicPetCatalog(
          { facing: { [key]: { nativeFacing, facingVerified } } },
          PET_MOTION_API_BASE
        );
        setOverview((prev) => {
          if (!prev?.pets) return prev;
          return {
            ...prev,
            pets: prev.pets.map((p) =>
              p.petId !== petId
                ? p
                : {
                    ...p,
                    stages: {
                      ...p.stages,
                      [`c${stageNum}`]: {
                        ...p.stages[`c${stageNum}`],
                        nativeFacing,
                        facingVerified,
                      },
                    },
                  }
            ),
          };
        });
        const dirLabel = nativeFacing === 'right' ? 'Phải' : nativeFacing === 'front' ? 'Chính diện' : 'Trái';
        showToast(`Đã xác nhận hướng ${petId.toUpperCase()} C${stageNum}: Gốc nhìn ${dirLabel}`);
      } catch (err) {
        showToast(err.message || 'Không lưu được hướng xoay pet.');
      } finally {
        setSavingFacing((prev) => ({ ...prev, [key]: false }));
      }
    },
    [api, showToast]
  );

  const handleSaveBulkFacing = useCallback(
    async (petId, nativeFacing, facingVerified = true) => {
      const key = `bulk:${petId}`;
      setSavingFacing((prev) => ({ ...prev, [key]: true }));
      try {
        await api.saveFacingBulk(petId, { nativeFacing, facingVerified });
        const facingPatch = {};
        for (let s = 1; s <= 5; s++) {
          facingPatch[`${petId}/c${s}`] = { nativeFacing, facingVerified };
        }
        mergeDynamicPetCatalog({ facing: facingPatch }, PET_MOTION_API_BASE);
        setOverview((prev) => {
          if (!prev?.pets) return prev;
          return {
            ...prev,
            pets: prev.pets.map((p) => {
              if (p.petId !== petId) return p;
              const nextStages = { ...p.stages };
              for (let s = 1; s <= 5; s++) {
                nextStages[`c${s}`] = {
                  ...nextStages[`c${s}`],
                  nativeFacing,
                  facingVerified,
                };
              }
              return { ...p, stages: nextStages };
            }),
          };
        });
        const dirLabel = nativeFacing === 'right' ? 'Phải' : nativeFacing === 'front' ? 'Chính diện' : 'Trái';
        showToast(`Đã áp dụng & xác nhận cả 5 cấp ${petId}: Gốc nhìn ${dirLabel}`);
      } catch (err) {
        showToast(err.message || 'Không lưu được hướng xoay hàng loạt.');
      } finally {
        setSavingFacing((prev) => ({ ...prev, [key]: false }));
      }
    },
    [api, showToast]
  );

  // ── Tải chi tiết pet-cấp ──
  const loadDetail = useCallback(async (petId, stage) => {
    setDetailLoading(true);
    setDetailError('');
    setLearnerPreview(false);
    setLearnerData(null);
    setConfirmApproveClip(null);
    try {
      const json = await api.getDetail(petId, stage);
      setDetail(json);
      return json;
    } catch (err) {
      setDetailError(err.message || 'Không tải được dữ liệu pet-cấp.');
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!isEditorView) {
      setDetail(null);
      return;
    }
    loadDetail(selectedPetId, selectedStageNum);
    api.getCustomEmojis().then((res) => setCustomEmojis(res.emojis || [])).catch(() => {});
  }, [isEditorView, selectedPetId, selectedStageNum, loadDetail, api]);

  const detailMatches = Boolean(
    detail && detail.petId === selectedPetId && detail.stage === selectedStageNum
  );
  const hasRig = Boolean(
    detailMatches && detail.rig?.hasRig && detail.rig?.draftRig?.slots?.length > 0
  );

  // Danh sách nguồn ảnh hiện có của pet đang chọn (để gợi ý cho họa sĩ tự cắt / vẽ lại)
  const currentPetSuggestedSources = useMemo(() => {
    if (!selectedPetId) return [];
    const pObj = dynamicPetMap[selectedPetId] || PET_REGISTRY[selectedPetId];
    return collectPetSuggestedSources(pObj, selectedStageNum || 1, dynamicPetList, brokenImgs);
  }, [selectedPetId, selectedStageNum, dynamicPetMap, dynamicPetList, brokenImgs]);

  useEffect(() => {
    setSuggestSourceIdx(0);
  }, [selectedPetId, selectedStageNum]);

  // Gộp danh sách nguồn ảnh cho Bàn dựng Rig:
  // Ưu tiên 1: Ảnh gốc nguyên vẹn của chính pet & cấp hiện tại (để dù body đã bị cắt gọt vẫn lấy được đầu/tay đầy đủ)
  // Ưu tiên 2: Các lớp đang có sẵn trong rig (như body — hữu ích khi pet tự thêm chưa có ảnh tĩnh cấp đó)
  // Ưu tiên 3: Ảnh các cấp khác C1..C5 cùng pet / phôi tham chiếu / khung trống
  const buildOrderedEditorSources = useCallback(() => {
    const rigPartSources = editorCtrlRef.current?.getLoadedPartSources?.() || [];
    const exactStageSource = currentPetSuggestedSources.find(
      (s) => s.id === `self-c${selectedStageNum}`
    );
    const restPetSources = currentPetSuggestedSources.filter(
      (s) => s.id !== `self-c${selectedStageNum}`
    );
    return [
      ...(exactStageSource
        ? [{ ...exactStageSource, label: `Ảnh gốc ${exactStageSource.shortLabel} (nguyên bản)` }]
        : []),
      ...rigPartSources,
      ...restPetSources,
    ];
  }, [currentPetSuggestedSources, selectedStageNum]);

  // Mở Studio cắt/vẽ cho một bộ phận trong Rig từ nguồn ảnh gợi ý (ảnh pet gốc / body / khung trống)
  const handleOpenSuggestPartStudio = useCallback(
    async ({
      partName,
      sourceItem = null,
      targetSize = null,
      referenceLayers = null,
      isExistingSlot = null,
    }) => {
      let resolvedPart = partName;
      if (!resolvedPart || resolvedPart === 'auto') {
        const nextMissingSlot = ['head', 'armL', 'armR', 'crown', 'eye0', 'eye1', 'front'].find(
          (p) => !editorCtrlRef.current?.hasPartSlot?.(p)
        );
        resolvedPart = nextMissingSlot || 'head';
        setAddPartChoice(resolvedPart);
      }
      if (openingStudio) return;
      const pObj = dynamicPetMap[selectedPetId] || PET_REGISTRY[selectedPetId];
      if (!pObj) return;
      setOpeningStudio(true);
      try {
        const allSources = buildOrderedEditorSources();
        const chosen = sourceItem || allSources[suggestSourceIdx] || allSources[0];
        const frameSize =
          targetSize ||
          detail?.rig?.draftRig?.size || [
            getStageImageSpec(selectedStageNum).recommended,
            getStageImageSpec(selectedStageNum).recommended,
          ];
        const canvasImg = await loadAnyPetSourceToCanvas(chosen, api, frameSize);
        const refs =
          referenceLayers ?? editorCtrlRef.current?.buildReferenceLayersFor?.(resolvedPart) ?? [];
        const slotExists =
          isExistingSlot ?? Boolean(editorCtrlRef.current?.hasPartSlot?.(resolvedPart));

        setPaintTarget({
          mode: slotExists ? 'replace_part' : 'add_part',
          part: resolvedPart,
          partLabel: PART_VI_LABELS[resolvedPart] || resolvedPart,
          petLabel: pObj.name,
          stage: selectedStageNum,
          image: canvasImg,
          referenceLayers: refs,
          initialDirty: true,
          initialTool: chosen?.kind === 'blank' ? 'brush' : 'lasso',
          suggestedSources: allSources,
        });
      } catch (err) {
        showToast(err.message || 'Không mở được ảnh gốc để cắt/vẽ.');
      } finally {
        setOpeningStudio(false);
      }
    },
    [
      openingStudio,
      dynamicPetMap,
      selectedPetId,
      buildOrderedEditorSources,
      suggestSourceIdx,
      detail,
      selectedStageNum,
      api,
      showToast,
    ]
  );

  // Mở Studio cắt/vẽ để tạo ảnh Avatar tĩnh cho một cấp đang "Chưa có ảnh" ngay trên trang Tổng quan
  const handleOpenOverviewAvatarStudio = useCallback(
    async (petObjItem, stageNum) => {
      if (!petObjItem || openingStudio) return;
      setOpeningStudio(true);
      try {
        const spec = getStageImageSpec(stageNum);
        const sources = collectPetSuggestedSources(petObjItem, stageNum, dynamicPetList, brokenImgs);
        const primary = sources[0];
        const canvasImg = await loadAnyPetSourceToCanvas(primary, api, [
          spec.recommended,
          spec.recommended,
        ]);
        setPaintTarget({
          mode: 'avatar',
          petId: petObjItem.id,
          part: `c${stageNum}`,
          partLabel: `Ảnh cấp C${stageNum}`,
          petLabel: petObjItem.name,
          stage: stageNum,
          image: canvasImg,
          referenceLayers: [],
          initialDirty: true,
          suggestedSources: sources,
        });
      } catch (err) {
        showToast(err.message || 'Không mở được trình vẽ ảnh pet.');
      } finally {
        setOpeningStudio(false);
      }
    },
    [openingStudio, dynamicPetList, brokenImgs, api, showToast]
  );

  // ── Mount / unmount editor canvas engine ──
  useEffect(() => {
    if (!isEditorView || !hasRig || !editorRootRef.current) return;

    const petObj = dynamicPetMap[selectedPetId] || PET_REGISTRY[selectedPetId];
    const ctrl = initEditor(editorRootRef.current, api, {
      apiBase: PET_MOTION_API_BASE,
      petId: selectedPetId,
      petLabel: petObj.name,
      group: petObj.group,
      stage: selectedStageNum,
      clip,
      onSaveState: (status, info) => {
        setSaveState({ status, ...info });
      },
      onScopeChange: (s) => setScope(s),
      onEmojiChange: (em) => {
        setEmojiCfg({
          enabled: Boolean(em?.enabled),
          char: em?.imageUrl ? '' : em?.char || getDefaultClipEmoji(clip),
          imageUrl: em?.imageUrl || '',
          pos: em?.pos || 'top-right',
        });
      },
      onToast: showToast,
      onPartsChanged: () => {
        const missing = editorCtrlRef.current?.getMissingParts?.() || [];
        setMissingParts(missing);
        if (missing.length > 0) {
          setAddPartChoice((prev) =>
            missing.some((m) => m.part === prev) ? prev : missing[0].part
          );
        } else {
          setAddPartChoice((prev) => {
            if (prev === 'auto' || !editorCtrlRef.current?.hasPartSlot?.(prev)) return prev;
            const nextSlot = ['head', 'armL', 'armR', 'crown', 'eye0', 'eye1', 'front'].find(
              (p) => !editorCtrlRef.current?.hasPartSlot?.(p)
            );
            return nextSlot || prev;
          });
        }
      },
      onSuggestFromPet: (payload) => {
        const rigPartSources = editorCtrlRef.current?.getLoadedPartSources?.() || [];
        const pCurrent = dynamicPetMap[selectedPetId] || PET_REGISTRY[selectedPetId];
        const petSources = collectPetSuggestedSources(
          pCurrent,
          selectedStageNum || 1,
          dynamicPetList,
          brokenImgs
        );
        const exactStage = petSources.find((s) => s.id === `self-c${selectedStageNum}`);
        const restPet = petSources.filter((s) => s.id !== `self-c${selectedStageNum}`);
        const allSources = [
          ...(exactStage ? [{ ...exactStage, label: `Ảnh gốc ${exactStage.shortLabel} (nguyên bản)` }] : []),
          ...rigPartSources,
          ...restPet,
        ];
        const firstNonBlank = allSources.find((s) => s.kind !== 'blank') || allSources[0];
        loadAnyPetSourceToCanvas(
          firstNonBlank,
          api,
          payload.targetSize || [
            getStageImageSpec(selectedStageNum).recommended,
            getStageImageSpec(selectedStageNum).recommended,
          ]
        )
          .then((canvasImg) => {
            setPaintTarget({
              mode: payload.isExistingSlot ? 'replace_part' : 'add_part',
              part: payload.part,
              partLabel: payload.partLabel,
              petLabel: payload.petLabel,
              stage: payload.stage,
              image: canvasImg,
              referenceLayers: payload.referenceLayers || [],
              initialDirty: true,
              initialTool: firstNonBlank?.kind === 'blank' ? 'brush' : 'lasso',
              suggestedSources: allSources,
            });
          })
          .catch((err) => showToast(err.message || 'Không tải được ảnh gợi ý của pet.'));
      },
      onEditPart: (payload) => {
        const rigPartSources = editorCtrlRef.current?.getLoadedPartSources?.() || [];
        const pCurrent = dynamicPetMap[selectedPetId] || PET_REGISTRY[selectedPetId];
        const petSources = collectPetSuggestedSources(
          pCurrent,
          selectedStageNum || 1,
          dynamicPetList,
          brokenImgs
        );
        setPaintTarget({
          mode: 'replace_part',
          ...payload,
          initialDirty: false,
          suggestedSources: [...rigPartSources, ...petSources],
        });
      },
      onDataMutated: async ({ kind, scopeKey, clipName, updatedAt }) => {
        setDetail((prev) => {
          if (!prev) return prev;
          if (kind === 'rig' || kind === 'part') {
            return {
              ...prev,
              rig: {
                ...prev.rig,
                hasUnpublishedChanges: true,
                updatedAt: updatedAt || prev.rig.updatedAt,
              },
            };
          }
          if (kind === 'clip' || kind === 'clip_reset') {
            const nextClips = {
              shared: { ...prev.clips.shared },
              override: { ...prev.clips.override },
            };
            const target = scopeKey === '' ? nextClips.shared : nextClips.override;
            if (kind === 'clip_reset') {
              delete target[clipName];
            } else {
              target[clipName] = {
                ...(target[clipName] || {}),
                status: 'draft',
                hasUnpublishedChanges: true,
                updatedAt: updatedAt || new Date().toISOString(),
              };
            }
            return { ...prev, clips: nextClips };
          }
          return prev;
        });
      },
    });

    editorCtrlRef.current = ctrl;
    ctrl
      .loadStageData({
        petId: selectedPetId,
        petLabel: petObj.name,
        group: petObj.group,
        stage: selectedStageNum,
        detail,
      })
      .then(() => {
        const autoPart = pendingAutoOpenPartRef.current;
        if (autoPart) {
          pendingAutoOpenPartRef.current = null;
          setSideTab('parts');
          const loadedSources = ctrl.getLoadedPartSources?.() || [];
          const bodyLoaded = loadedSources.find((s) => s.id === `rig-part-${autoPart}`);
          if (bodyLoaded?.img) {
            setPaintTarget({
              mode: 'replace_part',
              part: autoPart,
              partLabel: PART_VI_LABELS[autoPart] || autoPart,
              petLabel: petObj.name,
              stage: selectedStageNum,
              image: bodyLoaded.img,
              referenceLayers: ctrl.buildReferenceLayersFor?.(autoPart) || [],
              initialDirty: false,
              suggestedSources: [...loadedSources, ...currentPetSuggestedSources],
            });
          }
        }
      });

    return () => {
      ctrl.destroy();
      editorCtrlRef.current = null;
    };
    // Chỉ khởi tạo lại khi đổi pet-cấp hoặc khi mới tạo rig xong
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditorView, hasRig, selectedPetId, selectedStageNum, api]);

  // Đồng bộ chọn clip vào editor
  const handleSelectClip = (clipName) => {
    setClip(clipName);
    setConfirmApproveClip(null);
    editorCtrlRef.current?.setClip(clipName);
    const curEm = editorCtrlRef.current?.getEmoji();
    setEmojiCfg({
      enabled: Boolean(curEm?.enabled),
      char: curEm?.imageUrl ? '' : curEm?.char || getDefaultClipEmoji(clipName),
      imageUrl: curEm?.imageUrl || '',
      pos: curEm?.pos || 'top-right',
    });
  };

  const handleUpdateEmoji = (patch) => {
    const next = {
      enabled: emojiCfg.enabled,
      char: emojiCfg.char,
      imageUrl: emojiCfg.imageUrl || '',
      pos: emojiCfg.pos || 'top-right',
      ...patch,
    };
    if (next.enabled && !next.imageUrl && !next.char) {
      next.char = getDefaultClipEmoji(clip);
    }
    setEmojiCfg(next);
    editorCtrlRef.current?.setEmoji(next);
  };

  const handleUploadCustomEmoji = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setUploadingEmoji(true);
    try {
      let lastAdded = null;
      for (const file of list) {
        const res = await api.uploadCustomEmoji(file);
        if (res.emoji) {
          lastAdded = res.emoji;
          setCustomEmojis((prev) => [res.emoji, ...prev.filter((x) => x.id !== res.emoji.id)]);
        }
      }
      if (lastAdded) {
        handleUpdateEmoji({ enabled: true, imageUrl: lastAdded.url, char: '' });
        showToast(`Đã tải lên emoji tự thiết kế "${lastAdded.name}".`);
      }
    } catch (err) {
      showToast(err.message || 'Lỗi tải emoji tự thiết kế.');
    } finally {
      setUploadingEmoji(false);
    }
  };

  const handleDeleteCustomEmoji = async (item) => {
    try {
      await api.deleteCustomEmoji(item.id);
      setCustomEmojis((prev) => prev.filter((x) => x.id !== item.id));
      if (emojiCfg.imageUrl === item.url) {
        handleUpdateEmoji({ imageUrl: '', char: getDefaultClipEmoji(clip) });
      }
      showToast(`Đã xoá emoji "${item.name}".`);
    } catch (err) {
      showToast(err.message || 'Lỗi xoá emoji.');
    }
  };

  // Mở pet-cấp từ thẻ tổng quan hoặc dropdown (focus: 'rig' | 'motion')
  const openPetStage = async (petId, stage, focus = '', clipName = '') => {
    await editorCtrlRef.current?.flushAll();
    const next = { pet: petId, stage: String(stage) };
    if (focus) next.focus = focus;
    if (clipName && CLIPS[clipName]) next.clip = clipName;
    setSearchParams(next);
  };

  // Mở tab Xem trước khi học (mục 5.8)
  const openStudyPreview = async (petId = '', stage = 1) => {
    await editorCtrlRef.current?.flushAll();
    const next = { view: 'preview' };
    if (petId && PET_REGISTRY[petId]) next.pet = petId;
    if (stage >= 1 && stage <= 5) next.stage = String(stage);
    setSearchParams(next);
  };

  const syncPreviewParams = useCallback(
    (petId, stage) => {
      setSearchParams(
        (prev) => {
          if (
            prev.get('view') === 'preview' &&
            prev.get('pet') === petId &&
            prev.get('stage') === String(stage)
          ) {
            return prev;
          }
          return { view: 'preview', pet: petId, stage: String(stage) };
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Bổ sung / thay ảnh avatar tĩnh trực tiếp từ thẻ tổng quan
  const handleUploadStageAvatar = async (petId, stageNum, file) => {
    if (!file) return;
    const key = `${petId}/c${stageNum}`;
    setUploadingAvatar((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await api.uploadAvatar(petId, stageNum, file);
      setBrokenImgs((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setOverview((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pets: prev.pets.map((p) => {
            if (p.petId !== petId) return p;
            return {
              ...p,
              stages: {
                ...p.stages,
                [`c${stageNum}`]: {
                  ...p.stages[`c${stageNum}`],
                  avatarUrl: res.avatarUrl,
                },
              },
            };
          }),
        };
      });
      showToast(`Đã cập nhật ảnh mặc định cho ${PET_REGISTRY[petId]?.name || petId} C${stageNum}.`);
    } catch (err) {
      showToast(err.message || 'Lỗi tải ảnh lên.');
    } finally {
      setUploadingAvatar((prev) => ({ ...prev, [key]: false }));
    }
  };

  const backToOverview = async () => {
    await editorCtrlRef.current?.flushAll();
    setSearchParams({});
  };

  // Bật/tắt chế độ Xem như người học
  const handleToggleLearnerPreview = async () => {
    if (!learnerPreview) {
      await editorCtrlRef.current?.flushAll();
      try {
        const data = await api.getLearnerMotion(selectedPetId);
        setLearnerData(data);
        setLearnerPreview(true);
        await editorCtrlRef.current?.setLearnerPreview(true, data);
      } catch (err) {
        showToast(err.message || 'Không tải được dữ liệu người học.');
      }
    } else {
      setLearnerPreview(false);
      await editorCtrlRef.current?.setLearnerPreview(false, null);
    }
  };

  // Thêm 1 hoặc nhiều bộ phận mới vào rig đang mở
  const handleAddPartsToRig = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || !editorCtrlRef.current) return;
    setAddingPart(true);
    try {
      for (const file of files) {
        const partName =
          addPartChoice === 'auto' || files.length > 1
            ? inferPartNameFromFile(file.name)
            : addPartChoice;
        if (!partName) {
          showToast(`Không nhận diện được tên bộ phận từ "${file.name}". Hãy chọn loại bộ phận cụ thể trước khi tải.`);
          continue;
        }
        await editorCtrlRef.current.addPart(partName, file);
      }
    } finally {
      setAddingPart(false);
    }
  };

  // Duyệt bộ phận + rig
  const handleApproveRig = async () => {
    setActionBusy(true);
    try {
      await editorCtrlRef.current?.flushAll();
      await api.approveRig(selectedPetId, selectedStageNum);
      invalidatePetMotionCache(selectedPetId);
      showToast(`Đã duyệt bộ phận + rig cho ${PET_REGISTRY[selectedPetId].name} C${selectedStageNum}.`);
      const fresh = await loadDetail(selectedPetId, selectedStageNum);
      if (fresh && editorCtrlRef.current) {
        const petObj = PET_REGISTRY[selectedPetId];
        await editorCtrlRef.current.loadStageData({
          petId: selectedPetId,
          petLabel: petObj.name,
          group: petObj.group,
          stage: selectedStageNum,
          detail: fresh,
        });
      }
    } catch (err) {
      showToast(err.message || 'Lỗi duyệt bộ phận.');
    } finally {
      setActionBusy(false);
    }
  };

  // Bấm "Đánh dấu hoàn thiện" -> chạy thử 1 vòng ở 1× trước khi xác nhận
  const handleStartApproveClip = async () => {
    if (!editorCtrlRef.current || approvingPreview) return;
    await editorCtrlRef.current.flushAll();
    setApprovingPreview(true);
    setConfirmApproveClip(null);
    showToast(`Đang chạy thử "${clip}" 1 vòng ở tốc độ 1×…`);
    await editorCtrlRef.current.playOnceAt1x();
    setApprovingPreview(false);
    setConfirmApproveClip(clip);
  };

  const handleConfirmApproveClip = async (approved) => {
    setActionBusy(true);
    try {
      await editorCtrlRef.current?.flushAll();
      await api.approveClip(selectedPetId, selectedStageNum, { clip, approved });
      invalidatePetMotionCache(selectedPetId);
      setConfirmApproveClip(null);
      showToast(
        approved
          ? `Đã hoàn thiện "${clip}" cho ${PET_REGISTRY[selectedPetId].name} C${selectedStageNum}.`
          : `Đã bỏ duyệt "${clip}" cho ${PET_REGISTRY[selectedPetId].name} C${selectedStageNum}.`
      );
      const fresh = await loadDetail(selectedPetId, selectedStageNum);
      if (fresh && editorCtrlRef.current) {
        const petObj = PET_REGISTRY[selectedPetId];
        await editorCtrlRef.current.loadStageData({
          petId: selectedPetId,
          petLabel: petObj.name,
          group: petObj.group,
          stage: selectedStageNum,
          detail: fresh,
        });
      }
    } catch (err) {
      showToast(err.message || 'Lỗi cập nhật trạng thái duyệt.');
    } finally {
      setActionBusy(false);
    }
  };

  // Xuất bản bản chung
  const handleOpenPublishShared = async () => {
    await editorCtrlRef.current?.flushAll();
    try {
      const res = await api.getAffectedBySharedClip(clip);
      setPublishDialog({
        clip,
        affected: res.affectedPetStages || [],
        resetApprovals: true,
      });
    } catch (err) {
      showToast(err.message || 'Không lấy được danh sách pet-cấp bị ảnh hưởng.');
    }
  };

  const handleConfirmPublishShared = async () => {
    if (!publishDialog) return;
    setActionBusy(true);
    try {
      const res = await api.publishClip({
        scope_key: '',
        clip: publishDialog.clip,
        resetApprovals: publishDialog.resetApprovals,
      });
      invalidatePetMotionCache();
      setPublishDialog(null);
      showToast(
        res.resetCount > 0
          ? `Đã xuất bản bản chung "${publishDialog.clip}" và chuyển ${res.resetCount} pet-cấp về chờ duyệt lại.`
          : `Đã xuất bản bản chung "${publishDialog.clip}".`
      );
      const fresh = await loadDetail(selectedPetId, selectedStageNum);
      if (fresh && editorCtrlRef.current) {
        const petObj = PET_REGISTRY[selectedPetId];
        await editorCtrlRef.current.loadStageData({
          petId: selectedPetId,
          petLabel: petObj.name,
          group: petObj.group,
          stage: selectedStageNum,
          detail: fresh,
        });
      }
    } catch (err) {
      showToast(err.message || 'Lỗi xuất bản bản chung.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleExportJson = () => {
    if (!editorCtrlRef.current) return;
    const json = editorCtrlRef.current.exportBackupJson();
    downloadJsonFile(`pet-motion-${selectedPetId}-c${selectedStageNum}.json`, json);
    showToast('Đã tải file sao lưu JSON.');
  };

  const handleReloadAfterConflict = async () => {
    setSaveState({ status: 'idle', message: '' });
    const fresh = await loadDetail(selectedPetId, selectedStageNum);
    if (fresh && editorCtrlRef.current) {
      const petObj = PET_REGISTRY[selectedPetId];
      await editorCtrlRef.current.loadStageData({
        petId: selectedPetId,
        petLabel: petObj.name,
        group: petObj.group,
        stage: selectedStageNum,
        detail: fresh,
      });
      showToast('Đã tải lại bản mới nhất từ server.');
    }
  };

  // Tự chọn tab Hình bộ phận nếu mở từ nút Rig, hoặc nhảy tới đúng clip từ Xem trước khi học
  const focusParam = searchParams.get('focus');
  const clipParam = searchParams.get('clip');
  useEffect(() => {
    if (isEditorView && hasRig) {
      if (focusParam === 'rig') {
        setSideTab('parts');
        setSideCollapsed(false);
      } else if (focusParam === 'motion') {
        setSideTab('clips');
      }
      if (clipParam && CLIPS[clipParam]) {
        setClip(clipParam);
        editorCtrlRef.current?.setClip(clipParam);
      }
    }
  }, [isEditorView, hasRig, focusParam, clipParam, selectedPetId, selectedStageNum]);

  // ── Render 0: Tab "Xem trước khi học" (chỉ quản trị viên, chỉ đọc) ──
  if (isPreviewView) {
    return (
      <StudyPreviewTab
        api={api}
        initialPetId={selectedPetId}
        initialStage={selectedStageNum || 1}
        onBackToOverview={backToOverview}
        onOpenEditor={(pId, st, clipName) =>
          openPetStage(pId, st, clipName ? 'motion' : 'motion', clipName || '')
        }
        onSyncParams={syncPreviewParams}
      />
    );
  }

  // ── Render 1: Trang Tổng quan dạng thẻ Avatar 5 cấp + nút Rig & Motion bên dưới ──
  if (!isEditorView) {
    const allPets = overview?.pets || [];
    let totalHasRig = 0;
    let totalApprovedRig = 0;
    let totalApprovedClips = 0;
    let totalFacingVerified = 0;
    for (const p of allPets) {
      for (let s = 1; s <= 5; s++) {
        const c = p.stages[`c${s}`];
        if (c.hasRig) totalHasRig++;
        if (c.rigStatus === 'approved') totalApprovedRig++;
        if (c.facingVerified) totalFacingVerified++;
        totalApprovedClips += c.approvedClips || 0;
      }
    }

    const filteredPets = allPets.filter((p) => {
      if (groupFilter !== 'all' && p.group !== groupFilter) return false;
      const petHasAnyRig = [1, 2, 3, 4, 5].some((s) => p.stages[`c${s}`].hasRig);
      const petHasUnverifiedFacing = [1, 2, 3, 4, 5].some((s) => !p.stages[`c${s}`].facingVerified);
      if (rigFilter === 'has_rig' && !petHasAnyRig) return false;
      if (rigFilter === 'no_rig' && petHasAnyRig) return false;
      if (rigFilter === 'facing_unverified' && !petHasUnverifiedFacing) return false;
      if (rigFilter === 'facing_verified' && petHasUnverifiedFacing) return false;
      if (!searchQuery.trim()) return true;
      const reg = dynamicPetMap[p.petId] || PET_REGISTRY[p.petId];
      const q = searchQuery.toLowerCase();
      return (
        p.petId.includes(q) ||
        (reg?.name || '').toLowerCase().includes(q) ||
        (reg?.species || '').toLowerCase().includes(q) ||
        (GROUPS[p.group]?.labelVi || '').toLowerCase().includes(q)
      );
    });

    const handleConfirmDeletePet = async () => {
      if (!deleteTarget || deletingPet) return;
      setDeletingPet(true);
      try {
        await api.deletePet(deleteTarget.petId);
        delete PET_REGISTRY[deleteTarget.petId];
        showToast(`Đã xoá pet "${deleteTarget.name || deleteTarget.petId}".`);
        setDeleteTarget(null);
        await loadOverview();
      } catch (err) {
        showToast(err.message || 'Không xoá được pet.');
      } finally {
        setDeletingPet(false);
      }
    };

    return (
      <div className="pm-admin fade-in">
        <div className="pm-header">
          <div>
            <h1>Quản lý Pet · Rig &amp; Động tác</h1>
            <p className="pm-sub">
              Quản lý toàn bộ {overview?.totalPets || dynamicPetList.length} loài pet × 5 cấp: thêm pet mới, sửa thông tin, tải ảnh 5 cấp và chỉnh <strong>Rig</strong> / <strong>Motion</strong> trực tiếp.
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <input
              type="search"
              className="form-control form-control-sm"
              style={{ width: 200 }}
              placeholder="Tìm tên pet, loài…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className="pm-btn primary"
              onClick={() => setPetModal({ open: true, mode: 'create', pet: null })}
              title="Tạo loài pet mới và tải lên ảnh 5 cấp"
            >
              + Thêm Pet mới
            </button>
            <button
              type="button"
              className="pm-btn"
              onClick={() => setFacingModalOpen(true)}
              title="Kiểm tra & xác nhận hướng xoay trái/phải của từng pet trong Đấu trường"
            >
              🧭 Xác nhận hướng ({totalFacingVerified}/{allPets.length * 5 || PET_LIST.length * 5})
            </button>
            <button
              type="button"
              className="pm-btn"
              onClick={() => openStudyPreview('bamboo_spirit', 1)}
              title="Mở phòng thử nghiệm ở nhà, bài học và trận đấu bằng PetRig thật"
            >
              🧪 Xem trước
            </button>
            <button type="button" className="pm-btn" onClick={loadOverview} disabled={overviewLoading}>
              Tải lại
            </button>
          </div>
        </div>

        <div className="pm-stats-bar">
          <span className="pm-stat-chip">🐾 {allPets.length || PET_LIST.length} loài pet</span>
          <span className="pm-stat-chip">🧭 {totalFacingVerified}/{allPets.length * 5 || PET_LIST.length * 5} đã xác nhận hướng</span>
          <span className="pm-stat-chip">🦴 {totalHasRig}/{allPets.length * 5 || PET_LIST.length * 5} cấp có rig</span>
          <span className="pm-stat-chip">✅ {totalApprovedRig} rig đã duyệt</span>
          <span className="pm-stat-chip">🎬 {totalApprovedClips} động tác hoàn thiện</span>
        </div>

        <div className="pm-filter-bar">
          <button
            type="button"
            className={`pm-chip-btn ${groupFilter === 'all' ? 'active' : ''}`}
            onClick={() => setGroupFilter('all')}
          >
            Tất cả nhóm
          </button>
          {Object.entries(GROUPS).map(([key, g]) => (
            <button
              key={key}
              type="button"
              className={`pm-chip-btn ${groupFilter === key ? 'active' : ''}`}
              onClick={() => setGroupFilter(key)}
            >
              {g.labelVi}
            </button>
          ))}
          <span className="ms-auto d-flex gap-1">
            {[
              { id: 'all', label: 'Mọi trạng thái' },
              { id: 'facing_unverified', label: 'Chưa duyệt hướng' },
              { id: 'facing_verified', label: 'Đã duyệt hướng' },
              { id: 'has_rig', label: 'Đã có Rig' },
              { id: 'no_rig', label: 'Chưa có Rig' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`pm-chip-btn ${rigFilter === f.id ? 'active' : ''}`}
                onClick={() => setRigFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </span>
        </div>

        {overviewError && <div className="alert alert-danger">{overviewError}</div>}
        {overviewLoading && !overview ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" />
          </div>
        ) : (
          <div className="pm-deck-list">
            {filteredPets.map((row) => {
              const reg = dynamicPetMap[row.petId] || PET_REGISTRY[row.petId];
              const grpLabel = GROUPS[row.group]?.labelVi || row.group;
              const elem = ELEMENT_COLORS[row.element];
              const rarityKey = RARITY_ALIASES[row.rarity] || row.rarity;
              const rarityLabel = RARITIES[rarityKey]?.labelVi || row.rarity;
              const rigCount = [1, 2, 3, 4, 5].filter((s) => row.stages[`c${s}`].hasRig).length;
              const clipSum = [1, 2, 3, 4, 5].reduce((acc, s) => acc + (row.stages[`c${s}`].approvedClips || 0), 0);

              return (
                <section key={row.petId} className="pm-pet-deck">
                  <div className="pm-pet-deck-head">
                    <div className="pm-pet-deck-title">
                      <span style={{ fontSize: '1.25rem' }}>{reg?.emoji || '🐾'}</span>
                      <h3>{reg?.name || row.petId}</h3>
                      <span className="small text-muted">({reg?.species || row.petId})</span>
                      {row.isCustom && <span className="pm-badge ok">Mới</span>}
                      {elem && (
                        <span
                          className="pm-badge"
                          style={{ background: elem.bg, color: elem.color }}
                        >
                          {elem.name}
                        </span>
                      )}
                      <span className="pm-badge none">{grpLabel}</span>
                      <span className="pm-badge none">{rarityLabel}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="small text-muted fw-semibold">
                        Rig: <strong>{rigCount}/5</strong> · Duyệt: <strong>{clipSum}</strong>
                      </span>
                      <button
                        type="button"
                        className="pm-btn pm-btn-sm"
                        onClick={() => setPetModal({ open: true, mode: 'edit', pet: reg || { id: row.petId, ...row } })}
                        title="Sửa tên, hệ, mô tả và tải lên ảnh 5 cấp"
                      >
                        ✏️ Sửa
                      </button>
                      {row.isCustom && (
                        <button
                          type="button"
                          className="pm-btn pm-btn-sm text-danger"
                          onClick={() => setDeleteTarget({ petId: row.petId, name: reg?.name || row.petId })}
                          title="Xoá pet tự thêm này"
                        >
                          🗑️ Xoá
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pm-stage-grid">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const cell = row.stages[`c${s}`];
                      const evo = reg?.evolutions?.[s - 1];
                      const stageKey = `${row.petId}/c${s}`;
                      const imgSrc = cell.avatarUrl
                        ? `${PET_MOTION_API_BASE}${cell.avatarUrl}`
                        : evo?.image || '';
                      const isBroken = !imgSrc || Boolean(brokenImgs[stageKey]);
                      const isUploading = Boolean(uploadingAvatar[stageKey]);

                      const cardClass =
                        cell.rigStatus === 'approved'
                          ? 'st-approved'
                          : cell.rigStatus === 'draft'
                          ? 'st-draft'
                          : '';

                      const rigBtnClass =
                        cell.rigStatus === 'approved'
                          ? 'ok'
                          : cell.rigStatus === 'draft'
                          ? 'draft'
                          : 'muted';

                      const rigBtnLabel =
                        cell.rigStatus === 'approved'
                          ? '✓ Rig'
                          : cell.rigStatus === 'draft'
                          ? '✎ Rig nháp'
                          : '+ Rig';

                      const motionBtnClass =
                        cell.approvedClips > 0 ? 'ok' : cell.hasRig ? '' : 'muted';

                      return (
                        <div key={s} className={`pm-stage-card ${cardClass}`}>
                          <div className="pm-stage-card-top">
                            <span className="pm-stage-code">C{s}</span>
                            <span className="pm-stage-name" title={evo?.name || `Cấp ${s}`}>
                              {evo?.name || `Cấp ${s}`}
                            </span>
                          </div>

                          <div
                            className="pm-avatar-box"
                            onClick={() => openPetStage(row.petId, s, cell.hasRig ? 'motion' : 'rig')}
                            title={`Mở chỉnh ${reg?.name || row.petId} C${s}`}
                          >
                            {isUploading ? (
                              <div className="spinner-border spinner-border-sm text-success" />
                            ) : !isBroken ? (
                              <img
                                src={imgSrc}
                                alt={evo?.name || `${row.petId} C${s}`}
                                loading="lazy"
                                onError={() =>
                                  setBrokenImgs((prev) => ({ ...prev, [stageKey]: true }))
                                }
                              />
                            ) : (
                              <div className="pm-avatar-empty">
                                <span style={{ fontSize: '1.6rem' }}>{evo?.emoji || reg?.emoji || '🥚'}</span>
                                <span className="small fw-bold">Chưa có ảnh</span>
                              </div>
                            )}

                            {isBroken && !isUploading && (
                              <button
                                type="button"
                                className="pm-btn pm-btn-sm"
                                style={{
                                  position: 'absolute',
                                  top: 6,
                                  right: 6,
                                  minHeight: 24,
                                  padding: '1px 7px',
                                  fontSize: '0.7rem',
                                  background: '#fffbeb',
                                  borderColor: '#f59e0b',
                                  color: '#92400e',
                                  zIndex: 2,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenOverviewAvatarStudio(
                                    reg || { id: row.petId, ...row },
                                    s
                                  );
                                }}
                                title="Lấy ảnh hiện có của pet (từ cấp khác hoặc phôi mẫu) để họa sĩ tự cắt / tự vẽ lại cho cấp này"
                              >
                                {[1, 2, 3, 4, 5].some(
                                  (os) =>
                                    os !== s &&
                                    !brokenImgs[`${row.petId}/c${os}`] &&
                                    (row.stages[`c${os}`]?.avatarUrl || reg?.evolutions?.[os - 1]?.image)
                                )
                                  ? '✂️ Lấy ảnh pet'
                                  : '🎨 Tự vẽ / Mẫu'}
                              </button>
                            )}

                            <label
                              className={`pm-avatar-upload-pill ${isBroken ? 'always' : ''}`}
                              onClick={(e) => e.stopPropagation()}
                              title="Avatar chuẩn: 512×512 px (tỷ lệ 1:1), WebP/PNG nền trong suốt, khuyến nghị ≤ 150 KB (tối đa 2 MB)"
                            >
                              {isBroken ? '+ Bổ sung ảnh' : 'Đổi ảnh'}
                              <input
                                type="file"
                                accept="image/png,image/webp"
                                hidden
                                disabled={isUploading}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  e.target.value = '';
                                  if (f) handleUploadStageAvatar(row.petId, s, f);
                                }}
                              />
                            </label>
                          </div>

                          {/* Hướng xoay gốc & Xác nhận nhanh */}
                          <div
                            className="d-flex align-items-center justify-content-between gap-1 px-1 pb-1"
                            style={{ fontSize: '0.68rem' }}
                            title="Hướng nhìn của ảnh gốc (bấm ⬅ / ⏺ / ➡ để đổi và xác nhận ngay)"
                          >
                            <div className="btn-group btn-group-sm" role="group" aria-label={`Hướng xoay ${row.petId} C${s}`}>
                              {[
                                { val: 'left', icon: '⬅', tip: 'Ảnh gốc nhìn Trái' },
                                { val: 'front', icon: '⏺', tip: 'Chính diện (không lật)' },
                                { val: 'right', icon: '➡', tip: 'Ảnh gốc nhìn Phải' },
                              ].map((opt) => {
                                const isCur = (cell.nativeFacing || 'left') === opt.val;
                                return (
                                  <button
                                    key={opt.val}
                                    type="button"
                                    disabled={Boolean(savingFacing[stageKey])}
                                    title={opt.tip}
                                    className={`btn btn-sm py-0 px-1 ${
                                      isCur
                                        ? cell.facingVerified
                                          ? 'btn-success'
                                          : 'btn-warning text-dark'
                                        : 'btn-outline-secondary'
                                    }`}
                                    style={{ fontSize: '0.68rem', lineHeight: 1.4 }}
                                    onClick={() => handleSaveStageFacing(row.petId, s, opt.val, true)}
                                  >
                                    {opt.icon}
                                  </button>
                                );
                              })}
                            </div>
                            <span
                              className={cell.facingVerified ? 'text-success fw-bold' : 'text-warning fw-bold'}
                              title={cell.facingVerified ? 'Đã xác nhận hướng xoay' : 'Chưa xác nhận hướng xoay — bấm nút hướng để xác nhận'}
                            >
                              {cell.facingVerified ? '✓' : '?'}
                            </span>
                          </div>

                          <div className="pm-card-actions">
                            <button
                              type="button"
                              className={`pm-mini-btn ${rigBtnClass}`}
                              onClick={() => openPetStage(row.petId, s, 'rig')}
                              title="Chỉnh bộ phận & điểm xoay (Rig)"
                            >
                              {rigBtnLabel}
                            </button>
                            <button
                              type="button"
                              className={`pm-mini-btn ${motionBtnClass}`}
                              onClick={() => openPetStage(row.petId, s, 'motion')}
                              title="Chỉnh & duyệt động tác (Motion)"
                            >
                              ▶ {cell.approvedClips}/{cell.totalClips}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {filteredPets.length === 0 && (
              <div className="pm-card text-center py-4 text-muted">
                Không có pet nào khớp bộ lọc hiện tại.
              </div>
            )}
          </div>
        )}

        <PetFormModal
          open={petModal.open}
          mode={petModal.mode}
          initialPet={petModal.pet}
          api={api}
          onClose={() => setPetModal({ open: false, mode: 'create', pet: null })}
          onSaved={() => {
            setBrokenImgs({});
            loadOverview();
          }}
          onToast={showToast}
        />

        <PetFacingReviewModal
          open={facingModalOpen}
          pets={allPets}
          dynamicPetMap={dynamicPetMap}
          savingMap={savingFacing}
          onSaveStage={handleSaveStageFacing}
          onSaveBulk={handleSaveBulkFacing}
          onClose={() => setFacingModalOpen(false)}
        />

        {deleteTarget && (
          <div className="cowdi-mini-modal-backdrop" onClick={() => !deletingPet && setDeleteTarget(null)}>
            <div className="cowdi-mini-modal" style={{ maxWidth: 420 }} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <h5 className="fw-bold mb-2 text-danger">Xoá pet &ldquo;{deleteTarget.name}&rdquo;?</h5>
              <p className="small text-muted mb-3">
                Thao tác này sẽ xoá thông tin pet <code>{deleteTarget.petId}</code> cùng toàn bộ ảnh avatar, rig và động tác nháp/duyệt của pet này. Không thể hoàn tác.
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDeleteTarget(null)} disabled={deletingPet}>
                  Huỷ
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={handleConfirmDeletePet} disabled={deletingPet}>
                  {deletingPet ? 'Đang xoá…' : 'Xác nhận xoá'}
                </button>
              </div>
            </div>
          </div>
        )}

        {paintTarget && (
          <PartPaintModal
            part={paintTarget.part}
            partLabel={paintTarget.partLabel}
            petLabel={paintTarget.petLabel}
            stage={paintTarget.stage}
            image={paintTarget.image}
            referenceLayers={paintTarget.referenceLayers || []}
            initialDirty={Boolean(paintTarget.initialDirty)}
            initialTool={paintTarget.initialTool || 'brush'}
            suggestedSources={paintTarget.suggestedSources || []}
            onLoadSuggestedSource={(srcItem) => loadAnyPetSourceToCanvas(srcItem, api)}
            saving={paintSaving}
            onClose={() => !paintSaving && setPaintTarget(null)}
            onSave={async (file) => {
              if (!paintTarget) return;
              setPaintSaving(true);
              try {
                if (paintTarget.mode === 'avatar') {
                  await handleUploadStageAvatar(paintTarget.petId, paintTarget.stage, file);
                  setPaintTarget(null);
                }
              } finally {
                setPaintSaving(false);
              }
            }}
          />
        )}

        {toastMsg && <div className="pm-toast" role="status">{toastMsg}</div>}
      </div>
    );
  }

  // ── Render 2: Bàn dựng + Duyệt cho pet-cấp đang chọn ──
  const petObj = dynamicPetMap[selectedPetId] || PET_REGISTRY[selectedPetId];
  const stageEvo = petObj?.evolutions?.[selectedStageNum - 1];
  const isClipApproved = Boolean(detail?.approvals?.[clip]?.approved);
  const approvedCount = Object.values(detail?.approvals || {}).filter((a) => a.approved).length;
  const sharedClipEntry = detail?.clips?.shared?.[clip];
  const overrideClipEntry = detail?.clips?.override?.[clip];

  const learnerStage = learnerData?.[`c${selectedStageNum}`] || null;
  const learnerMissingRig = learnerPreview && !learnerStage;
  const learnerMissingClip = learnerPreview && learnerStage && !learnerStage.clips?.[clip];

  const visibleClips = ALL_CLIP_NAMES.filter((name) => {
    if (!filterUnapproved) return true;
    return !detail?.approvals?.[name]?.approved;
  });

  return (
    <div className="pm-admin fade-in">
      {/* Header + thanh chuyển nhanh */}
      <div className="pm-toolbar">
        <div className="pm-row">
          <button type="button" className="pm-btn" onClick={backToOverview}>
            ← Quản lý {dynamicPetList.length} pet
          </button>
          <select
            className="pm-select"
            aria-label="Chọn pet"
            value={selectedPetId}
            onChange={(e) => openPetStage(e.target.value, selectedStageNum)}
          >
            {dynamicPetList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species})
              </option>
            ))}
          </select>
          <select
            className="pm-select"
            aria-label="Chọn cấp tiến hoá"
            value={selectedStageNum}
            onChange={(e) => openPetStage(selectedPetId, Number(e.target.value))}
          >
            {petObj.evolutions.map((ev, idx) => (
              <option key={idx} value={idx + 1}>
                C{idx + 1} · {ev.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pm-row">
          <button
            type="button"
            className="pm-btn"
            onClick={() => openStudyPreview(selectedPetId, selectedStageNum)}
            title="Kiểm thử pet này trong ngữ cảnh Ở nhà, Bài học, Trận đấu (chỉ đọc)"
          >
            🧪 Xem trước khi học
          </button>

          <button
            type="button"
            className={`pm-btn ${learnerPreview ? 'primary' : ''}`}
            aria-pressed={learnerPreview}
            onClick={handleToggleLearnerPreview}
            disabled={!hasRig}
          >
            {learnerPreview ? '👁 Đang xem như người học' : '👁 Xem như người học'}
          </button>

          <span className={`pm-save-pill ${saveState.status}`}>
            {saveState.status === 'saving' && 'Đang lưu…'}
            {saveState.status === 'dirty' && 'Chờ lưu…'}
            {saveState.status === 'saved' && `Đã lưu ${fmtClock(saveState.at)}`}
            {saveState.status === 'error' && `Lỗi lưu: ${saveState.message || ''}`}
            {saveState.status === 'conflict' && 'Xung đột phiên bản'}
            {saveState.status === 'idle' && 'Sẵn sàng'}
          </span>

          {saveState.status === 'error' && saveState.retry && (
            <button type="button" className="pm-btn warn" onClick={saveState.retry}>
              Thử lại
            </button>
          )}
        </div>
      </div>

      {/* Cảnh báo xung đột 2 admin cùng sửa */}
      {saveState.status === 'conflict' && (
        <div className="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
          <span className="small fw-semibold">
            ⚠️ {saveState.message || 'Bản nháp vừa được quản trị viên khác cập nhật.'}
          </span>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={handleReloadAfterConflict}>
              Tải lại bản mới nhất
            </button>
            {saveState.retryForce && (
              <button type="button" className="btn btn-sm btn-warning" onClick={saveState.retryForce}>
                Ghi đè bằng bản của tôi
              </button>
            )}
          </div>
        </div>
      )}

      {detailError && <div className="alert alert-danger">{detailError}</div>}

      {/* CHỈ hiện spinner khi đổi sang pet-cấp khác (KHÔNG unmount canvas khi refresh sau duyệt/lưu!) */}
      {!detailMatches ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
        </div>
      ) : !hasRig ? (
        <RigCreatorCard
          pet={petObj}
          stage={selectedStageNum}
          api={api}
          suggestedSources={currentPetSuggestedSources}
          onOpenStudioForItem={async (item, onUpdateItem) => {
            try {
              const canvasImg = await loadAnyPetSourceToCanvas({ file: item.file }, api);
              setPaintTarget({
                mode: 'rig_creator_item',
                itemId: item.id,
                onUpdateItem,
                part: item.part || 'body',
                partLabel: PART_VI_LABELS[item.part] || item.part || item.file.name,
                petLabel: petObj.name,
                stage: selectedStageNum,
                image: canvasImg,
                referenceLayers: [],
                initialDirty: false,
                suggestedSources: currentPetSuggestedSources,
              });
            } catch (err) {
              showToast(err.message || 'Không mở được ảnh để cắt/vẽ.');
            }
          }}
          onCreated={async (opts) => {
            if (opts?.autoOpenPart) {
              pendingAutoOpenPartRef.current = opts.autoOpenPart;
            }
            await loadDetail(selectedPetId, selectedStageNum);
          }}
          onToast={showToast}
        />
      ) : (
        <div className="pm-editor-shell" ref={editorRootRef}>
          {/* HÀNG 1 (gọn ~360px): Sân khấu Pet (trái) + 3 Tab thu gọn được (phải) */}
          <div className={`pm-editor-grid ${sideCollapsed ? 'side-collapsed' : ''}`}>
            {/* Cột trái trên: Sân khấu + điều khiển phát (KHÔNG nhồi danh sách dài bên dưới để Timeline luôn nhìn thấy cùng Sân khấu) */}
            <div className="pm-card pm-stage-card">
              <div className="pm-stage">
                <canvas data-pm="cv" aria-label="Sân khấu pet, kéo bộ phận để đặt keyframe" />

                {learnerMissingRig && (
                  <div className="pm-stage-fallback">
                    {stageEvo?.image && <img src={stageEvo.image} alt={stageEvo.name} />}
                    <div className="fw-bold text-dark">Chưa duyệt bộ phận (rig)</div>
                    <div className="small text-muted">
                      Người học hiện đang thấy ảnh tĩnh này. Hãy bấm <strong>Duyệt bộ phận</strong> để bật hoạt ảnh.
                    </div>
                  </div>
                )}

                {learnerMissingClip && (
                  <div
                    className="position-absolute top-0 start-0 end-0 p-2 text-center small fw-bold"
                    style={{ background: 'rgba(255,243,220,0.92)', color: '#7c4908', zIndex: 2 }}
                  >
                    Động tác &ldquo;{clip}&rdquo; chưa được duyệt cho {petObj.name} C{selectedStageNum} → người học sẽ không thấy phát động tác này.
                  </div>
                )}
              </div>

              <div className="pm-transport">
                <button type="button" className="pm-btn pm-btn-sm primary" data-pm="play">Dừng</button>
                <button type="button" className="pm-btn pm-btn-sm" data-pm="prevK" title="Keyframe trước">◀ key</button>
                <button type="button" className="pm-btn pm-btn-sm" data-pm="nextK" title="Keyframe sau">key ▶</button>
                <span className="pm-time" data-pm="time">0.00 / 0.00 s</span>
                <select className="pm-select pm-kf-ease" data-pm="speed" aria-label="Tốc độ xem" defaultValue="1">
                  <option value="0.25">0.25×</option>
                  <option value="0.5">0.5×</option>
                  <option value="1">1×</option>
                </select>
                <button type="button" className="pm-btn pm-btn-sm" data-pm="onion" aria-pressed="false">Bóng mờ</button>
                <button type="button" className="pm-btn pm-btn-sm" data-pm="tempo" aria-pressed="false">Nhịp</button>
                <button
                  type="button"
                  className={`pm-btn pm-btn-sm ms-auto ${sideCollapsed ? 'primary' : ''}`}
                  onClick={() => setSideCollapsed((v) => !v)}
                  title="Thu gọn hoặc mở rộng bảng phụ bên phải để tập trung xem pet & đặt keyframe"
                >
                  {sideCollapsed ? '▼ Mở bảng phụ' : '▲ Thu gọn bảng phụ'}
                </button>
              </div>
            </div>

            {/* Cột phải trên: 3 tab gọn bằng đúng chiều cao sân khấu (thu gọn được cùng lúc) */}
            <div className={`pm-card pm-side-card ${sideCollapsed ? 'collapsed' : ''}`}>
              {/* Thanh duyệt rig + nút chuyển 3 tab */}
              <div className="pm-side-top">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2 flex-wrap min-w-0">
                    <strong className="small">{petObj.name} C{selectedStageNum}</strong>
                    <span className={`pm-badge ${detail.rig.status === 'approved' ? 'ok' : 'draft'}`}>
                      {detail.rig.status === 'approved' ? 'Rig đã duyệt ✓' : 'Rig nháp'}
                    </span>
                    {detail.rig.hasUnpublishedChanges && detail.rig.status === 'approved' && (
                      <span className="pm-badge draft">Có nháp mới</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="pm-btn pm-btn-sm primary"
                    onClick={handleApproveRig}
                    disabled={actionBusy || learnerPreview}
                  >
                    Duyệt bộ phận
                  </button>
                </div>

                <div className="pm-side-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sideTab === 'clips'}
                    className={`pm-side-tab ${sideTab === 'clips' ? 'active' : ''}`}
                    onClick={() => { setSideTab('clips'); setSideCollapsed(false); }}
                    title={`Danh sách động tác (${approvedCount}/${ALL_CLIP_NAMES.length} hoàn thiện)`}
                  >
                    🎬 Động tác ({approvedCount}/{ALL_CLIP_NAMES.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sideTab === 'parts'}
                    className={`pm-side-tab ${sideTab === 'parts' ? 'active' : ''}`}
                    onClick={() => { setSideTab('parts'); setSideCollapsed(false); }}
                  >
                    🦴 Bộ phận
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sideTab === 'settings'}
                    className={`pm-side-tab ${sideTab === 'settings' ? 'active' : ''}`}
                    onClick={() => { setSideTab('settings'); setSideCollapsed(false); }}
                  >
                    ⚙️ Cài đặt
                  </button>
                </div>
              </div>

              {/* Nội dung 3 tab (giữ nguyên trong DOM bằng CSS để editor.js luôn thao tác được) */}
              <div className="pm-side-scroll">
                {/* TAB 1: Danh sách 34 động tác + Khung duyệt */}
                <div className={`pm-tab-pane ${sideTab === 'clips' ? 'active' : ''}`}>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="small fw-bold text-muted">
                      Đang chọn: <strong className="text-dark">{getClipLabelVi(clip)}</strong> ({clip})
                    </span>
                    <label className="small d-flex align-items-center gap-1" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filterUnapproved}
                        onChange={(e) => setFilterUnapproved(e.target.checked)}
                      />
                      Chỉ chưa duyệt
                    </label>
                  </div>

                  {/* Khung duyệt gọn ngay phía trên danh sách động tác */}
                  <div className="p-2 rounded-3 mb-2" style={{ background: '#f6fbf7', border: '1px solid #cfe5d4' }}>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-1 flex-wrap small">
                        <span className={`pm-badge ${isClipApproved ? 'ok' : 'draft'}`}>
                          {isClipApproved ? 'Hoàn thiện' : 'Nháp'}
                        </span>
                        {overrideClipEntry?.hasUnpublishedChanges && isClipApproved && (
                          <span className="pm-badge draft">Nháp mới</span>
                        )}
                      </div>
                      <div className="pm-row">
                        <button
                          type="button"
                          className="pm-btn pm-btn-sm primary"
                          onClick={handleStartApproveClip}
                          disabled={actionBusy || approvingPreview || learnerPreview}
                        >
                          {approvingPreview ? 'Đang phát thử 1×…' : '✓ Đánh dấu hoàn thiện'}
                        </button>
                        {isClipApproved && (
                          <button
                            type="button"
                            className="pm-btn pm-btn-sm"
                            onClick={() => handleConfirmApproveClip(false)}
                            disabled={actionBusy || learnerPreview}
                          >
                            Bỏ duyệt
                          </button>
                        )}
                      </div>
                    </div>

                    {confirmApproveClip === clip && (
                      <div className="mt-2 pt-2 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <span className="small fw-semibold text-success">
                          ✓ Đã chạy 1 vòng 1×. Xác nhận cho người học thấy?
                        </span>
                        <div className="pm-row">
                          <button
                            type="button"
                            className="pm-btn pm-btn-sm primary"
                            onClick={() => handleConfirmApproveClip(true)}
                            disabled={actionBusy}
                          >
                            Xác nhận
                          </button>
                          <button type="button" className="pm-btn pm-btn-sm" onClick={() => setConfirmApproveClip(null)}>
                            Huỷ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pm-clip-list">
                    {visibleClips.map((name) => {
                      const ok = Boolean(detail?.approvals?.[name]?.approved);
                      const hasOv = Boolean(detail?.clips?.override?.[name]);
                      const hasSh = Boolean(detail?.clips?.shared?.[name]);
                      const clipEmoji =
                        detail?.clips?.override?.[name]?.draft?.emoji?.enabled
                          ? detail.clips.override[name].draft.emoji.char
                          : detail?.clips?.shared?.[name]?.draft?.emoji?.enabled
                          ? detail.clips.shared[name].draft.emoji.char
                          : '';
                      return (
                        <button
                          key={name}
                          type="button"
                          className={`pm-clip-item ${name === clip ? 'active' : ''}`}
                          onClick={() => handleSelectClip(name)}
                        >
                          <span className="pm-clip-text">
                            <span className="pm-clip-key">
                              {name}
                              {hasOv ? ' ★' : hasSh ? ' •' : ''}
                              {clipEmoji ? ` ${clipEmoji}` : ''}
                            </span>
                            <small className="pm-clip-vi">{getClipLabelVi(name)}</small>
                          </span>
                          <span className={`pm-badge ${ok ? 'ok' : 'draft'}`}>
                            {ok ? 'Hoàn thiện' : 'Nháp'}
                          </span>
                        </button>
                      );
                    })}
                    {visibleClips.length === 0 && (
                      <div className="text-center small text-muted py-3">
                        Tất cả 34 động tác đã hoàn thiện!
                      </div>
                    )}
                  </div>
                </div>

                {/* TAB 2: Hình bộ phận + dời hình / điểm xoay / vẽ sửa */}
                <div className={`pm-tab-pane ${sideTab === 'parts' ? 'active' : ''}`}>
                  <div className="pm-lbl mt-0" data-pm="partsTitle">Hình bộ phận</div>
                  <div className="pm-row mb-2">
                    <span className="small fw-bold text-muted">Kéo pet:</span>
                    <button type="button" className="pm-btn pm-btn-sm" data-pm="mPose" aria-pressed="true">Tạo dáng</button>
                    <button type="button" className="pm-btn pm-btn-sm" data-pm="mMove" aria-pressed="false">Dời hình</button>
                    <button type="button" className="pm-btn pm-btn-sm" data-pm="mPivot" aria-pressed="false">Điểm xoay</button>
                  </div>
                  <div className="pm-parts" data-pm="parts" />
                  {!learnerPreview && (() => {
                    const allEditorSources = buildOrderedEditorSources();
                    const clampedIdx = Math.min(suggestSourceIdx, Math.max(0, allEditorSources.length - 1));
                    const activeSource = allEditorSources[clampedIdx] || null;
                    return (
                      <div
                        className="mt-2 p-2 rounded-3"
                        style={{
                          background: missingParts.length > 0 ? '#fffbeb' : '#f6fbf7',
                          border:
                            missingParts.length > 0
                              ? '1px solid #f59e0b'
                              : '1px dashed #b9d5c0',
                        }}
                      >
                        {missingParts.length > 0 && (
                          <div
                            className="small fw-bold mb-1"
                            style={{ fontSize: '0.74rem', color: '#92400e' }}
                          >
                            ⚠️ Đang thiếu ảnh ({missingParts.map((m) => m.part).join(', ')}) — bấm &ldquo;✂️ Lấy ảnh gốc&rdquo; để cắt / vẽ bù ngay:
                          </div>
                        )}

                        <div className="pm-row">
                          <select
                            className="pm-select"
                            style={{ minHeight: 30, fontSize: '0.8rem', flex: '1 1 135px' }}
                            aria-label="Chọn bộ phận muốn thêm"
                            value={addPartChoice}
                            onChange={(e) => setAddPartChoice(e.target.value)}
                            disabled={addingPart || openingStudio}
                          >
                            <option value="head">head (Đầu)</option>
                            <option value="crown">crown (Chỏm/Tai)</option>
                            <option value="armL">armL (Tay trái)</option>
                            <option value="armR">armR (Tay phải)</option>
                            <option value="eye0">eye0 (Mắt 1)</option>
                            <option value="eye1">eye1 (Mắt 2)</option>
                            <option value="front">front (Lớp trước)</option>
                            <option value="fx">fx (Hiệu ứng trôi)</option>
                            <option value="aura">aura (Hào quang)</option>
                            <option value="body">body (Thân)</option>
                            <option value="auto">Tự nhận theo tên file</option>
                          </select>

                          <button
                            type="button"
                            className="pm-btn pm-btn-sm primary"
                            style={{ minHeight: 30, fontSize: '0.78rem' }}
                            disabled={addingPart || openingStudio}
                            onClick={() =>
                              handleOpenSuggestPartStudio({
                                partName: addPartChoice,
                                sourceItem: activeSource,
                              })
                            }
                            title={`Lấy ảnh gốc / body của ${petObj.name} đưa vào Studio để khoanh cắt lấy bộ phận này (hoặc lưu nguyên bản)`}
                          >
                            {openingStudio ? 'Đang mở…' : '✂️ + Lấy ảnh gốc'}
                          </button>

                          <label
                            className="pm-file-btn"
                            style={{ minHeight: 30, fontSize: '0.78rem' }}
                            title="Tải 1 hoặc nhiều file PNG/WebP tách lớp từ máy tính"
                          >
                            {addingPart ? 'Đang tải…' : '📁 + Tải file'}
                            <input
                              type="file"
                              multiple
                              accept="image/png,image/webp"
                              hidden
                              disabled={addingPart || openingStudio}
                              onChange={(e) => {
                                const files = e.target.files;
                                handleAddPartsToRig(files);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>

                        {allEditorSources.length > 0 && (
                          <div className="d-flex align-items-center gap-1 mt-1">
                            <span className="small text-muted" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                              Nguồn gốc:
                            </span>
                            <select
                              className="pm-select"
                              style={{ minHeight: 26, fontSize: '0.73rem', padding: '1px 6px', flex: '1 1 auto', minWidth: 0 }}
                              aria-label="Chọn nguồn ảnh gốc để lấy sang bộ phận mới"
                              value={clampedIdx}
                              disabled={addingPart || openingStudio}
                              onChange={(e) => setSuggestSourceIdx(Number(e.target.value))}
                            >
                              {allEditorSources.map((src, idx) => (
                                <option key={src.id || idx} value={idx}>
                                  {src.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="w-100 small text-muted mt-1" style={{ fontSize: '0.71rem' }}>
                          📐 Khung rig:{' '}
                          <code>
                            {detail?.rig?.draftRig?.size?.[0] || getStageImageSpec(selectedStageNum).recommended}×
                            {detail?.rig?.draftRig?.size?.[1] || getStageImageSpec(selectedStageNum).recommended} px
                          </code>{' '}
                          · Bấm <b>✂️ + Lấy ảnh gốc</b> để khoanh cắt ngay trên ảnh gốc/body, hoặc <b>📁 + Tải file</b> từ máy.
                        </div>
                      </div>
                    );
                  })()}
                  <div className="pm-nums" data-pm="nums" />
                </div>

                {/* TAB 3: Phạm vi bản chỉnh + Độ dài & Lặp + Emoji + Sao lưu */}
                <div className={`pm-tab-pane ${sideTab === 'settings' ? 'active' : ''}`}>
                  <div className="pm-lbl mt-0">Bản chỉnh áp cho</div>
                  <div className="pm-row">
                    <button type="button" className="pm-btn pm-btn-sm" data-pm="scopeAll" aria-pressed={scope === 'all'}>
                      Mọi pet (chung)
                    </button>
                    <button type="button" className="pm-btn pm-btn-sm" data-pm="scopeOne" aria-pressed={scope === 'one'}>
                      Riêng pet-cấp này
                    </button>
                    {scope === 'all' && sharedClipEntry && (
                      <button
                        type="button"
                        className="pm-btn pm-btn-sm warn"
                        onClick={handleOpenPublishShared}
                        disabled={actionBusy || learnerPreview}
                      >
                        Xuất bản bản chung
                      </button>
                    )}
                  </div>

                  {publishDialog && (
                    <div className="alert alert-light border mt-2 mb-2 p-2">
                      <div className="fw-bold small mb-1">Xuất bản bản chung cho &ldquo;{publishDialog.clip}&rdquo;</div>
                      {publishDialog.affected.length > 0 ? (
                        <>
                          <div className="small text-muted mb-2">
                            Các pet-cấp đang duyệt động tác này ({publishDialog.affected.length}):{' '}
                            <strong>{publishDialog.affected.map((x) => x.petStage).join(', ')}</strong>
                          </div>
                          <div className="form-check small">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="pmResetApp"
                              id="pmResetYes"
                              checked={publishDialog.resetApprovals === true}
                              onChange={() => setPublishDialog((d) => ({ ...d, resetApprovals: true }))}
                            />
                            <label className="form-check-label" htmlFor="pmResetYes">
                              Chuyển các pet-cấp trên về chờ duyệt lại (mặc định)
                            </label>
                          </div>
                          <div className="form-check small mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="pmResetApp"
                              id="pmResetNo"
                              checked={publishDialog.resetApprovals === false}
                              onChange={() => setPublishDialog((d) => ({ ...d, resetApprovals: false }))}
                            />
                            <label className="form-check-label" htmlFor="pmResetNo">
                              Giữ nguyên trạng thái duyệt (áp dụng bản chung mới ngay)
                            </label>
                          </div>
                        </>
                      ) : (
                        <div className="small text-muted mb-2">Chưa có pet-cấp nào đang duyệt động tác này.</div>
                      )}
                      <div className="pm-row">
                        <button type="button" className="pm-btn pm-btn-sm primary" onClick={handleConfirmPublishShared} disabled={actionBusy}>
                          Xác nhận xuất bản
                        </button>
                        <button type="button" className="pm-btn pm-btn-sm" onClick={() => setPublishDialog(null)}>
                          Đóng
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pm-lbl">Độ dài và lặp</div>
                  <div className="pm-row">
                    <input type="number" className="pm-num" data-pm="dur" step="0.05" min="0.2" max="10" aria-label="Độ dài (giây)" />
                    <span className="small">giây</span>
                    <button type="button" className="pm-btn pm-btn-sm" data-pm="loop" aria-pressed="false">Lặp</button>
                    <button type="button" className="pm-btn pm-btn-sm ms-auto" data-pm="resetClip" disabled={learnerPreview}>
                      Về bản gốc
                    </button>
                    <button type="button" className="pm-btn pm-btn-sm" onClick={handleExportJson}>
                      Xuất JSON
                    </button>
                  </div>

                  {/* Biểu cảm Emoji */}
                  <div className="pm-lbl">Emoji biểu cảm (bật/tắt theo động tác)</div>
                  <div className="p-2 rounded-3 mb-1" style={{ background: '#fafdfb', border: '1px solid #dcece0' }}>
                    <div className="pm-row justify-content-between">
                      <label className="small fw-bold d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={emojiCfg.enabled}
                          disabled={learnerPreview}
                          onChange={(e) =>
                            handleUpdateEmoji({
                              enabled: e.target.checked,
                              char: emojiCfg.char || getDefaultClipEmoji(clip),
                            })
                          }
                        />
                        Hiện emoji khi phát ({selectedStageNum === 1 ? 'khuyên dùng C1' : 'tuỳ chọn'})
                      </label>
                      {emojiCfg.enabled && (
                        <select
                          className="pm-select"
                          style={{ minHeight: 28, fontSize: '0.76rem', padding: '2px 6px' }}
                          aria-label="Vị trí emoji"
                          value={emojiCfg.pos}
                          disabled={learnerPreview}
                          onChange={(e) => handleUpdateEmoji({ pos: e.target.value })}
                        >
                          {EMOJI_POSITIONS.map((p) => (
                            <option key={p.id} value={p.id}>{p.labelVi}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {emojiCfg.enabled && (
                      <div className="mt-2">
                        <div className="pm-emoji-grid">
                          {EMOJI_PRESETS.map((em) => (
                            <button
                              key={em}
                              type="button"
                              className={`pm-emoji-btn ${!emojiCfg.imageUrl && emojiCfg.char === em ? 'active' : ''}`}
                              disabled={learnerPreview}
                              onClick={() => handleUpdateEmoji({ char: em, imageUrl: '' })}
                              title={`Chọn ${em}`}
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                        <div className="pm-row mt-2">
                          <span className="small text-muted">Hoặc nhập:</span>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ width: 64, textAlign: 'center', fontSize: '1rem' }}
                            maxLength={8}
                            value={emojiCfg.char}
                            disabled={learnerPreview}
                            onChange={(e) => handleUpdateEmoji({ char: e.target.value, imageUrl: '' })}
                          />
                          <button
                            type="button"
                            className="pm-btn pm-btn-sm"
                            disabled={learnerPreview}
                            onClick={() => handleUpdateEmoji({ char: getDefaultClipEmoji(clip), imageUrl: '' })}
                          >
                            Gợi ý ({getDefaultClipEmoji(clip)})
                          </button>
                        </div>

                        {/* Kho Emoji tự thiết kế (PNG/WebP) */}
                        <div className="mt-2 pt-2 border-top">
                          <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                            <span className="small fw-bold text-muted">Emoji tự thiết kế (PNG/WebP)</span>
                            <label className="pm-file-btn" style={{ minHeight: 26, fontSize: '0.74rem', background: '#2f9e4f', color: '#fff', borderColor: '#2f9e4f' }}>
                              {uploadingEmoji ? 'Đang tải…' : '+ Thêm ảnh'}
                              <input
                                type="file"
                                multiple
                                accept="image/png,image/webp"
                                hidden
                                disabled={learnerPreview || uploadingEmoji}
                                onChange={(e) => {
                                  handleUploadCustomEmoji(e.target.files);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                          <div className="small text-muted mb-2" style={{ fontSize: '0.72rem' }}>
                            📐 Gợi ý: <code>128×128</code> – <code>256×256 px</code> (1:1), nền trong suốt, ≤ 2 MB.
                          </div>
                          {customEmojis.length > 0 ? (
                            <div className="pm-custom-emoji-grid">
                              {customEmojis.map((item) => {
                                const isSel = emojiCfg.imageUrl === item.url;
                                return (
                                  <div key={item.id} className={`pm-custom-emoji-card ${isSel ? 'active' : ''}`}>
                                    <button
                                      type="button"
                                      className="pm-custom-emoji-pick"
                                      disabled={learnerPreview}
                                      onClick={() => handleUpdateEmoji({ enabled: true, imageUrl: item.url, char: '' })}
                                      title={item.name}
                                    >
                                      <img src={`${PET_MOTION_API_BASE}${normalizeApiAssetUrl(item.url)}`} alt={item.name} />
                                    </button>
                                    {!learnerPreview && (
                                      <button
                                        type="button"
                                        className="pm-custom-emoji-del"
                                        onClick={() => handleDeleteCustomEmoji(item)}
                                        title={`Xoá ${item.name}`}
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="small text-muted">
                              Chưa có emoji tự thiết kế. Bấm <strong>+ Thêm ảnh</strong> để tải PNG/WebP nền trong suốt.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG 2: Dòng thời gian Keyframe (trái) NGANG HÀNG 1-1 với Thông số từng bộ phận (phải) */}
          <div className="pm-card pm-keyframe-card">
            <div className="pm-kf-header">
              <div className="pm-tl-bar">
                <button type="button" className="pm-btn pm-btn-sm primary" data-pm="tlAddK" disabled={learnerPreview} title="Đặt keyframe cho kênh đang chọn tại đầu đọc">
                  + Đặt key
                </button>
                <button type="button" className="pm-btn pm-btn-sm" data-pm="tlDelK" disabled={learnerPreview} title="Xoá keyframe đang chọn hoặc dưới đầu đọc">
                  ✕ Xoá key
                </button>
                <button type="button" className="pm-btn pm-btn-sm" data-pm="keyAll" disabled={learnerPreview} title="Đặt key cho tất cả các kênh đang có chuyển động">
                  ◆ Đặt mọi kênh
                </button>
                <button type="button" className="pm-btn pm-btn-sm" data-pm="tlClearCh" disabled={learnerPreview} title="Xoá sạch mọi keyframe trên kênh đang chọn">
                  🗑 Xoá kênh
                </button>
              </div>

              <div className="pm-kf-right-head">
                <div className="pm-key-status" data-pm="keyInfo">
                  Nghiêng thân (rot) · 0.00s
                </div>
                <select className="pm-select pm-kf-ease" data-pm="ease" aria-label="Kiểu chuyển" defaultValue="smooth" title="Kiểu chuyển động từ keyframe này sang keyframe kế tiếp">
                  <option value="smooth">Mượt</option>
                  <option value="linear">Đều</option>
                  <option value="step">Nhảy</option>
                </select>
                <button type="button" className="pm-btn pm-btn-sm" data-pm="delK" title="Xoá keyframe đang chọn">
                  ✕ Xoá
                </button>
              </div>
            </div>

            <div className="pm-kf-split">
              {/* Cột trái: Dòng thời gian (15 hàng × 26px + 22px thước giây) */}
              <div className="pm-tl">
                <canvas data-pm="tl" aria-label="Dòng thời gian keyframe" />
              </div>

              {/* Cột phải: 15 thanh trượt thông số khớp ngang hàng 1-1 với 15 hàng timeline */}
              <div className="pm-chans-panel">
                <div className="pm-chans-head">
                  <span>Thông số tại đầu đọc</span>
                  <span>Giá trị · Key</span>
                </div>
                <div data-pm="chans" />
              </div>
            </div>

            <div className="pm-tl-legend">
              <span><b>Bấm timeline:</b> tua</span>
              <span><b>Kéo ◆ cam:</b> dời key</span>
              <span><b>Bấm đúp:</b> thêm key</span>
              <span><b>Chuột phải ◆</b> hoặc <b>Delete:</b> xoá key</span>
              <span><b>Bấm ◇ / ◆ bên phải:</b> bật/xoá key 1 chạm</span>
              <span><b>Space:</b> chạy/dừng</span>
            </div>
          </div>
        </div>
      )}

      {paintTarget && (
        <PartPaintModal
          part={paintTarget.part}
          partLabel={paintTarget.partLabel}
          petLabel={paintTarget.petLabel}
          stage={paintTarget.stage}
          image={paintTarget.image}
          referenceLayers={paintTarget.referenceLayers || []}
          initialDirty={Boolean(paintTarget.initialDirty)}
          initialTool={paintTarget.initialTool || 'brush'}
          suggestedSources={paintTarget.suggestedSources || []}
          onLoadSuggestedSource={(srcItem) => loadAnyPetSourceToCanvas(srcItem, api)}
          saving={paintSaving}
          onClose={() => !paintSaving && setPaintTarget(null)}
          onSave={async (file) => {
            if (!paintTarget) return;
            setPaintSaving(true);
            try {
              if (paintTarget.mode === 'rig_creator_item' && paintTarget.onUpdateItem) {
                const dims = await readImageDimensions(file).catch(() => ({ width: 512, height: 512 }));
                paintTarget.onUpdateItem(paintTarget.itemId, file, dims.width, dims.height);
                setPaintTarget(null);
                showToast(`Đã cập nhật ảnh cắt/vẽ cho "${paintTarget.partLabel}".`);
              } else if (paintTarget.mode === 'add_part' && editorCtrlRef.current) {
                const ok = await editorCtrlRef.current.addPart(paintTarget.part, file);
                if (ok) setPaintTarget(null);
              } else if (editorCtrlRef.current) {
                const ok = await editorCtrlRef.current.replacePartFile(paintTarget.part, file);
                if (ok) setPaintTarget(null);
              }
            } finally {
              setPaintSaving(false);
            }
          }}
        />
      )}

      {toastMsg && <div className="pm-toast" role="status">{toastMsg}</div>}
    </div>
  );
}
