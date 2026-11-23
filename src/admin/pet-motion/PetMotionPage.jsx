import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSEO } from '../../hooks/useSEO';
import { PET_REGISTRY, ELEMENT_COLORS } from '../../data/pets';
import { GROUPS, RARITIES, RARITY_ALIASES } from '../../../shared/game-config.js';
import { CLIPS } from '../../../shared/pet-motion.js';
import {
  EMOJI_POSITIONS,
  EMOJI_PRESETS,
  getClipLabelVi,
  getDefaultClipEmoji,
} from '../../../shared/pet-motion-labels.js';
import {
  PET_MOTION_API_BASE,
  buildDefaultRigFromFiles,
  createPetMotionApi,
  inferPartNameFromFile,
} from './api';
import { initEditor } from './editor';
import PartPaintModal from './PartPaintModal';
import { invalidatePetMotionCache } from '../../pet-rig/motionCache';
import './pet-motion.css';

const ALL_CLIP_NAMES = Object.keys(CLIPS);
const PET_LIST = Object.values(PET_REGISTRY);

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
function RigCreatorCard({ pet, stage, api, onCreated, onToast }) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setErr('');
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
        };
      });
      return [...prev, ...next];
    });
    e.target.value = '';
  };

  const updatePart = (id, part) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, part } : it)));
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
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
      <p className="pm-sub mb-3">
        Cấp này chưa có rig. Chọn nhiều file PNG/WebP tách lớp cùng lúc — hệ thống tự nhận bộ phận theo tên file
        (<code>body, head, crown, armL, armR, front, fx, aura, eye0, eye1</code>), tự tính kích thước, mặt đất,
        hộp mắt và điểm xoay mặc định.
      </p>

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <label className="pm-btn primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
          + Chọn nhiều ảnh PNG / WebP
          <input type="file" multiple accept="image/png,image/webp" hidden onChange={handleFiles} disabled={busy} />
        </label>
        {items.length > 0 && (
          <button type="button" className="pm-btn" onClick={() => setItems([])} disabled={busy}>
            Xoá danh sách
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="table-responsive mb-3">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Tên file</th>
                <th>Dung lượng</th>
                <th>Bộ phận nhận diện</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="small fw-semibold">{it.file.name}</td>
                  <td className="small text-muted">{(it.file.size / 1024).toFixed(1)} KB</td>
                  <td>
                    <div className="d-flex gap-1 align-items-center">
                      <select
                        className="form-select form-select-sm"
                        style={{ maxWidth: 140 }}
                        value={['body', 'head', 'crown', 'armL', 'armR', 'front', 'fx', 'aura', 'eye0', 'eye1'].includes(it.part) ? it.part : ''}
                        onChange={(e) => { if (e.target.value) updatePart(it.id, e.target.value); }}
                        disabled={busy}
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
                        style={{ maxWidth: 120 }}
                        value={it.part}
                        placeholder="hoặc tên khác"
                        onChange={(e) => updatePart(it.id, e.target.value.trim())}
                        disabled={busy}
                      />
                    </div>
                  </td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(it.id)} disabled={busy}>
                      Bỏ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {err && <div className="alert alert-danger py-2 small mb-3">{err}</div>}

      <button type="button" className="pm-btn primary" onClick={handleCreate} disabled={busy || items.length === 0}>
        {busy ? 'Đang tải ảnh và dựng rig…' : `Tải lên ${items.length} ảnh & Tạo rig nháp`}
      </button>
    </div>
  );
}

// ── Trang chính /admin/pet-motion ────────────────────────────────────────────
export default function PetMotionPage() {
  useSEO({ title: 'Chỉnh động tác pet (Admin) — Cowdi English' });
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const api = useMemo(() => createPetMotionApi(token), [token]);

  const selectedPetId = searchParams.get('pet') || '';
  const selectedStageNum = Number(searchParams.get('stage')) || 0;
  const isEditorView = Boolean(selectedPetId && PET_REGISTRY[selectedPetId] && selectedStageNum >= 1 && selectedStageNum <= 5);

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [rigFilter, setRigFilter] = useState('all'); // 'all' | 'has_rig' | 'no_rig'
  const [brokenImgs, setBrokenImgs] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState({});

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
  const [addPartChoice, setAddPartChoice] = useState('auto'); // 'auto' hoặc tên bộ phận cụ thể
  const [addingPart, setAddingPart] = useState(false);
  const [emojiCfg, setEmojiCfg] = useState({ enabled: false, char: '✨', imageUrl: '', pos: 'top-right' });
  const [customEmojis, setCustomEmojis] = useState([]);
  const [uploadingEmoji, setUploadingEmoji] = useState(false);

  const editorRootRef = useRef(null);
  const editorCtrlRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Modal vẽ sửa trực tiếp ảnh bộ phận
  const [paintTarget, setPaintTarget] = useState(null);
  const [paintSaving, setPaintSaving] = useState(false);

  // Tab & thu gọn bảng phụ bên phải để luôn nhìn thấy sân khấu pet khi đặt keyframe
  const [sideTab, setSideTab] = useState('clips'); // 'clips' | 'parts' | 'settings'
  const [sideCollapsed, setSideCollapsed] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(''), 2200);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // ── Tải tổng quan 22 pet × 5 cấp ──
  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError('');
    try {
      const json = await api.getOverview();
      setOverview(json);
    } catch (err) {
      setOverviewError(err.message || 'Không tải được tổng quan.');
    } finally {
      setOverviewLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!isEditorView) {
      loadOverview();
    }
  }, [isEditorView, loadOverview]);

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

  // ── Mount / unmount editor canvas engine ──
  useEffect(() => {
    if (!isEditorView || !hasRig || !editorRootRef.current) return;

    const petObj = PET_REGISTRY[selectedPetId];
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
      onEditPart: (payload) => setPaintTarget(payload),
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
    ctrl.loadStageData({
      petId: selectedPetId,
      petLabel: petObj.name,
      group: petObj.group,
      stage: selectedStageNum,
      detail,
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
  const openPetStage = async (petId, stage, focus = '') => {
    await editorCtrlRef.current?.flushAll();
    const next = { pet: petId, stage: String(stage) };
    if (focus) next.focus = focus;
    setSearchParams(next);
  };

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

  // Tự chọn tab Hình bộ phận nếu mở từ nút Rig
  const focusParam = searchParams.get('focus');
  useEffect(() => {
    if (isEditorView && hasRig) {
      if (focusParam === 'rig') {
        setSideTab('parts');
        setSideCollapsed(false);
      } else if (focusParam === 'motion') {
        setSideTab('clips');
      }
    }
  }, [isEditorView, hasRig, focusParam, selectedPetId, selectedStageNum]);

  // ── Render 1: Trang Tổng quan dạng thẻ Avatar 5 cấp + nút Rig & Motion bên dưới ──
  if (!isEditorView) {
    const allPets = overview?.pets || [];
    let totalHasRig = 0;
    let totalApprovedRig = 0;
    let totalApprovedClips = 0;
    for (const p of allPets) {
      for (let s = 1; s <= 5; s++) {
        const c = p.stages[`c${s}`];
        if (c.hasRig) totalHasRig++;
        if (c.rigStatus === 'approved') totalApprovedRig++;
        totalApprovedClips += c.approvedClips || 0;
      }
    }

    const filteredPets = allPets.filter((p) => {
      if (groupFilter !== 'all' && p.group !== groupFilter) return false;
      const petHasAnyRig = [1, 2, 3, 4, 5].some((s) => p.stages[`c${s}`].hasRig);
      if (rigFilter === 'has_rig' && !petHasAnyRig) return false;
      if (rigFilter === 'no_rig' && petHasAnyRig) return false;
      if (!searchQuery.trim()) return true;
      const reg = PET_REGISTRY[p.petId];
      const q = searchQuery.toLowerCase();
      return (
        p.petId.includes(q) ||
        (reg?.name || '').toLowerCase().includes(q) ||
        (reg?.species || '').toLowerCase().includes(q) ||
        (GROUPS[p.group]?.labelVi || '').toLowerCase().includes(q)
      );
    });

    return (
      <div className="pm-admin fade-in">
        <div className="pm-header">
          <div>
            <h1>Kho Pet · Rig &amp; Động tác</h1>
            <p className="pm-sub">
              Hiển thị ảnh mặc định của toàn bộ {overview?.totalPets || PET_LIST.length} loài pet × 5 cấp. Bạn có thể bổ sung ảnh trực tiếp trên từng thẻ và bấm <strong>Rig</strong> hoặc <strong>Motion</strong> ngay bên dưới ảnh.
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <input
              type="search"
              className="form-control form-control-sm"
              style={{ width: 220 }}
              placeholder="Tìm tên pet, loài…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="button" className="pm-btn" onClick={loadOverview} disabled={overviewLoading}>
              Tải lại
            </button>
          </div>
        </div>

        <div className="pm-stats-bar">
          <span className="pm-stat-chip">🐾 {allPets.length || PET_LIST.length} loài pet</span>
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
              const reg = PET_REGISTRY[row.petId];
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
                      <span className="small text-muted">({reg?.species})</span>
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
                    <div className="small text-muted fw-semibold">
                      Rig: <strong>{rigCount}/5</strong> · Động tác duyệt: <strong>{clipSum}</strong>
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

                            <label
                              className={`pm-avatar-upload-pill ${isBroken ? 'always' : ''}`}
                              onClick={(e) => e.stopPropagation()}
                              title="Tải ảnh PNG/WebP bổ sung làm avatar mặc định"
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

        {toastMsg && <div className="pm-toast" role="status">{toastMsg}</div>}
      </div>
    );
  }

  // ── Render 2: Bàn dựng + Duyệt cho pet-cấp đang chọn ──
  const petObj = PET_REGISTRY[selectedPetId];
  const stageEvo = petObj.evolutions[selectedStageNum - 1];
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
            ← Tổng quan {PET_LIST.length} pet
          </button>
          <select
            className="pm-select"
            aria-label="Chọn pet"
            value={selectedPetId}
            onChange={(e) => openPetStage(e.target.value, selectedStageNum)}
          >
            {PET_LIST.map((p) => (
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
          onCreated={() => loadDetail(selectedPetId, selectedStageNum)}
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
                  {!learnerPreview && (
                    <div className="pm-row mt-2 p-2 rounded-3" style={{ background: '#f6fbf7', border: '1px dashed #b9d5c0' }}>
                      <select
                        className="pm-select"
                        style={{ minHeight: 30, fontSize: '0.8rem' }}
                        aria-label="Chọn bộ phận muốn thêm"
                        value={addPartChoice}
                        onChange={(e) => setAddPartChoice(e.target.value)}
                        disabled={addingPart}
                      >
                        <option value="auto">Tự nhận theo tên file</option>
                        <option value="head">head (Đầu)</option>
                        <option value="crown">crown (Chỏm/Tai)</option>
                        <option value="armL">armL (Tay trái)</option>
                        <option value="armR">armR (Tay phải)</option>
                        <option value="front">front (Lớp trước)</option>
                        <option value="fx">fx (Hiệu ứng trôi)</option>
                        <option value="aura">aura (Hào quang)</option>
                        <option value="eye0">eye0 (Mắt 1)</option>
                        <option value="eye1">eye1 (Mắt 2)</option>
                        <option value="body">body (Thân)</option>
                      </select>
                      <label className="pm-file-btn" style={{ minHeight: 30, fontSize: '0.78rem', background: '#2f9e4f', color: '#fff', borderColor: '#2f9e4f' }}>
                        {addingPart ? 'Đang thêm…' : '+ Thêm bộ phận'}
                        <input
                          type="file"
                          multiple
                          accept="image/png,image/webp"
                          hidden
                          disabled={addingPart}
                          onChange={(e) => {
                            const files = e.target.files;
                            handleAddPartsToRig(files);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  )}
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
                          <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
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
                                      <img src={`${PET_MOTION_API_BASE}${item.url}`} alt={item.name} />
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
          referenceLayers={paintTarget.referenceLayers}
          saving={paintSaving}
          onClose={() => !paintSaving && setPaintTarget(null)}
          onSave={async (file) => {
            if (!editorCtrlRef.current || !paintTarget) return;
            setPaintSaving(true);
            try {
              const ok = await editorCtrlRef.current.replacePartFile(paintTarget.part, file);
              if (ok) setPaintTarget(null);
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
