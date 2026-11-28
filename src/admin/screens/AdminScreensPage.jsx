import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useScreenConfig } from '../../hooks/useScreenConfig';
import { useToast } from '../../components/layout/Toast';
import { ALL_LESSONS } from '../../data/lessons';
import { SCREENS } from '../../features/lesson/screens/registry';
import { SCREEN_CONFIG } from '../../data/config/screens';
import CatalogTab from './CatalogTab';
import MatrixTab from './MatrixTab';
import MixTesterTab from './MixTesterTab';
import PreviewTab from './PreviewTab';
import IntrosTab from './IntrosTab';
import { TestersTab, LogTab } from './TestersAndLogTabs';
import './admin-screens.css';

const TABS = [
  { id: 'catalog', label: 'Danh mục' },
  { id: 'matrix',  label: 'Ma trận dữ liệu' },
  { id: 'mix',     label: 'Trộn thử' },
  { id: 'preview', label: 'Xem trước' },
  { id: 'intros',  label: 'Kho dẫn nhập' },
  { id: 'testers', label: 'Tài khoản thử' },
  { id: 'log',     label: 'Nhật ký' },
];

/**
 * Trang Admin `/admin/screens` (GEMINI-SCREEN-SYSTEM-PHASE2 §3).
 * Bảo vệ bởi <RequireAdmin> ở client và requireAuth + requireAdmin ở server.
 */
export default function AdminScreensPage() {
  const { authFetch } = useAuth();
  const { refresh: refreshClientConfig } = useScreenConfig();
  const showToast = useToast();

  // Danh sách bài học áp dụng Hệ thống Màn học (loại trừ 12 bài picture nhóm Mới học)
  const nonPictureLessons = useMemo(
    () => ALL_LESSONS.filter((l) => l.format !== 'picture'),
    [],
  );

  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedLessonId, setSelectedLessonId] = useState(() => nonPictureLessons[0]?.id || '');
  const [group, setGroup] = useState('intermediate');
  const [seed, setSeed] = useState(42);
  const [previewCode, setPreviewCode] = useState('T-08');

  const [snapshot, setSnapshot] = useState({
    screens: [],
    weights: SCREEN_CONFIG.weights,
    supportedCodes: SCREENS.map((s) => s.code),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const supportedCodesClient = useMemo(() => SCREENS.map((s) => s.code), []);

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = `?supported=${encodeURIComponent(supportedCodesClient.join(','))}`;
      const res = await authFetch(`/api/admin/screens${qs}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || `Lỗi tải cấu hình (${res.status})`);
        return;
      }
      const data = await res.json();
      setSnapshot({
        screens: data.screens || [],
        weights: data.weights || SCREEN_CONFIG.weights,
        supportedCodes: data.supportedCodes || supportedCodesClient,
      });
    } catch {
      setError('Không kết nối được server — dùng cấu hình tĩnh dự phòng.');
    } finally {
      setLoading(false);
    }
  }, [authFetch, supportedCodesClient]);

  useEffect(() => { loadSnapshot(); }, [loadSnapshot]);

  const selectedLesson = useMemo(
    () => nonPictureLessons.find((l) => l.id === selectedLessonId) || nonPictureLessons[0] || null,
    [nonPictureLessons, selectedLessonId],
  );

  // Build config object từ snapshot server cho Tab Trộn thử & Xem trước
  const liveConfig = useMemo(() => {
    const status = { ...SCREEN_CONFIG.status };
    for (const r of snapshot.screens) status[r.code] = r.status;
    return { status, weights: snapshot.weights || SCREEN_CONFIG.weights };
  }, [snapshot]);

  const handleUpdateStatus = async (code, status, note) => {
    const res = await authFetch(`/api/admin/screens/${encodeURIComponent(code)}`, {
      method: 'PUT',
      body: JSON.stringify({ status, note, supportedCodes: supportedCodesClient }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Lỗi cập nhật trạng thái màn.', 'danger');
      return;
    }
    showToast(`Đã cập nhật ${code} → ${status}`, 'success');
    await loadSnapshot();
    refreshClientConfig();
  };

  const handleUpdateWeight = async (groupId, friendly, focus) => {
    const res = await authFetch(`/api/admin/screen-weights/${encodeURIComponent(groupId)}`, {
      method: 'PUT',
      body: JSON.stringify({ friendly, focus }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Trọng số không hợp lệ.', 'danger');
      return;
    }
    showToast(`Đã lưu trọng số nhóm ${groupId}`, 'success');
    await loadSnapshot();
    refreshClientConfig();
  };

  return (
    <div className="fade-in">
      {/* Thanh điều hướng Admin Portal */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 border-bottom pb-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Link className="btn btn-sm btn-outline-secondary" to="/admin">
            ← Admin Portal
          </Link>
          <h4 className="fw-bold mb-0">🎛️ Kiểm tra Màn học</h4>
          <span className="badge bg-primary-subtle text-primary">Đợt 3</span>
        </div>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={loadSnapshot} disabled={loading}>
          ↻ Tải lại cấu hình
        </button>
      </div>

      {error && <div className="alert alert-warning py-2 px-3 small mb-3">{error}</div>}

      {/* Thanh chọn Bài · Nhóm · Seed · Trộn thử */}
      <div className="as-topbar mb-3">
        <div className="as-field" style={{ flex: '2 1 260px' }}>
          <label htmlFor="as-lesson-select">Bài học ({nonPictureLessons.length} bài)</label>
          <select
            id="as-lesson-select"
            className="form-select form-select-sm"
            value={selectedLesson?.id || ''}
            onChange={(e) => setSelectedLessonId(e.target.value)}
          >
            {nonPictureLessons.map((l) => (
              <option key={l.id} value={l.id}>{l.id} — {l.title}</option>
            ))}
          </select>
        </div>

        <div className="as-field">
          <label htmlFor="as-group-select">Nhóm học</label>
          <select
            id="as-group-select"
            className="form-select form-select-sm"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="beginner">Mới học (beginner)</option>
            <option value="intermediate">Trung bình (intermediate)</option>
            <option value="exam">Luyện thi (exam)</option>
          </select>
        </div>

        <div className="as-field" style={{ maxWidth: 130 }}>
          <label htmlFor="as-seed-input">Seed</label>
          <input
            id="as-seed-input"
            type="number"
            className="form-control form-control-sm"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value) || 1)}
          />
        </div>

        <button
          type="button"
          className="btn btn-sm btn-cowdi-primary"
          onClick={() => {
            setSeed((s) => (Number(s) || 0) + 1);
            setActiveTab('mix');
          }}
        >
          🎲 Trộn thử
        </button>
      </div>

      {/* 6 Tab chính (Tab Kho dẫn nhập Đợt 3 & Thống kê Đợt 4 ẩn sẵn) */}
      <ul className="nav nav-tabs mb-3 flex-nowrap overflow-auto">
        {TABS.map((t) => (
          <li className="nav-item" key={t.id}>
            <button
              type="button"
              className={`nav-link fw-semibold text-nowrap ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === 'catalog' && (
        <CatalogTab
          selectedLesson={selectedLesson}
          allLessons={nonPictureLessons}
          serverScreens={snapshot.screens}
          weights={snapshot.weights}
          supportedCodes={snapshot.supportedCodes}
          onUpdateStatus={handleUpdateStatus}
          onUpdateWeight={handleUpdateWeight}
          onPreviewCode={(code) => {
            setPreviewCode(code);
            setActiveTab('preview');
          }}
        />
      )}

      {activeTab === 'matrix' && (
        <MatrixTab allLessons={nonPictureLessons} />
      )}

      {activeTab === 'mix' && (
        <MixTesterTab
          selectedLesson={selectedLesson}
          group={group}
          seed={seed}
          onChangeSeed={setSeed}
          config={liveConfig}
        />
      )}

      {activeTab === 'preview' && (
        <PreviewTab
          selectedLesson={selectedLesson}
          group={group}
          seed={seed}
          config={liveConfig}
          previewCode={previewCode}
          onChangePreviewCode={setPreviewCode}
        />
      )}

      {activeTab === 'intros' && (
        <IntrosTab authFetch={authFetch} onNotify={showToast} />
      )}

      {activeTab === 'testers' && (
        <TestersTab authFetch={authFetch} onNotify={showToast} />
      )}

      {activeTab === 'log' && (
        <LogTab authFetch={authFetch} />
      )}
    </div>
  );
}
