import { useState, useMemo, useCallback } from 'react';
import { SCREENS, getScreen } from '../../features/lesson/screens/registry';
import { listenItems, speakItems, writeItems, bossItems } from '../../features/lesson/screens/items';
import { getGroup } from '../../data/lessons';
import ScreenHost from '../../features/lesson/screens/ScreenHost';

const FRAMES = [
  { id: 'sm', label: '360 × 640',  w: 360, h: 640 },
  { id: 'md', label: '390 × 844',  w: 390, h: 844 },
  { id: 'lg', label: '800 × 1280', w: 800, h: 820 },
];

function itemsFor(slot, lesson) {
  if (slot === 'listen') return listenItems(lesson);
  if (slot === 'speak')  return speakItems(lesson);
  if (slot === 'write')  return writeItems(lesson, 4);
  if (slot === 'boss')   return bossItems(lesson);
  return [];
}

export default function PreviewTab({
  selectedLesson,
  group,
  seed,
  config,
  previewCode,
  onChangePreviewCode,
}) {
  const [mode, setMode] = useState('single'); // 'single' | 'full'
  const [frameId, setFrameId] = useState('md');
  const [events, setEvents] = useState([]);
  const [runKey, setRunKey] = useState(1);

  const frame = FRAMES.find((f) => f.id === frameId) || FRAMES[1];
  const screenDef = getScreen(previewCode) || SCREENS[0];
  const groupObj = getGroup(group);
  const canRunInfo = useMemo(
    () => (selectedLesson && screenDef ? screenDef.canRun(selectedLesson) : { ok: false, missing: ['chưa chọn bài'] }),
    [selectedLesson, screenDef],
  );
  const singleItems = useMemo(
    () => (selectedLesson && screenDef ? itemsFor(screenDef.slot, selectedLesson) : []),
    [selectedLesson, screenDef],
  );

  const pushEvent = useCallback((type, payload) => {
    setEvents((prev) => [
      { id: `${Date.now()}-${Math.random()}`, time: new Date().toLocaleTimeString('vi-VN'), type, payload },
      ...prev,
    ].slice(0, 60));
  }, []);

  const SingleComp = screenDef?.Component;

  return (
    <div className="d-flex flex-column gap-3">
      {/* Thanh điều khiển Xem trước */}
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="btn-group btn-group-sm" role="group" aria-label="Chế độ xem trước">
            <button
              type="button"
              className={`btn ${mode === 'single' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
              onClick={() => { setMode('single'); setEvents([]); setRunKey((k) => k + 1); }}
            >
              Xem từng màn
            </button>
            <button
              type="button"
              className={`btn ${mode === 'full' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
              onClick={() => { setMode('full'); setEvents([]); setRunKey((k) => k + 1); }}
            >
              ▶ Chơi thử cả bài (sandbox)
            </button>
          </div>

          {mode === 'single' && (
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={screenDef?.code || 'T-01'}
              onChange={(e) => { onChangePreviewCode(e.target.value); setEvents([]); setRunKey((k) => k + 1); }}
            >
              {SCREENS.map((s) => (
                <option key={s.code} value={s.code}>{s.code} · {s.name}</option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => { setEvents([]); setRunKey((k) => k + 1); }}
          >
            ↻ Khởi động lại
          </button>
        </div>

        <div className="btn-group btn-group-sm" role="group" aria-label="Kích thước khung">
          {FRAMES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`btn ${frameId === f.id ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFrameId(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="as-preview-grid">
        {/* Khung điện thoại / máy tính bảng */}
        <div className="as-device-stage">
          <div className="as-device-frame" style={{ width: frame.w, height: frame.h }}>
            <div className="bg-dark text-white px-3 py-1 d-flex justify-content-between small" style={{ fontSize: '0.72rem' }}>
              <span>SANDBOX · {mode === 'full' ? `Cả bài (seed #${seed})` : screenDef?.code}</span>
              <span>{frame.label}</span>
            </div>
            <div className="as-device-body">
              {!selectedLesson ? (
                <p className="text-muted text-center py-5">Chọn một bài học ở thanh trên cùng.</p>
              ) : mode === 'full' ? (
                <ScreenHost
                  key={`full-${selectedLesson.id}-${seed}-${runKey}`}
                  lesson={selectedLesson}
                  group={group}
                  rules={groupObj.rules}
                  config={config}
                  isTester
                  sandbox
                  seedOverride={Number(seed) || 1}
                  onSandboxEvent={(ev) => pushEvent(ev.type, ev.payload)}
                  onExitOverride={() => pushEvent('sandbox_exit', { note: 'Admin thoát sandbox' })}
                />
              ) : SingleComp ? (
                <SingleComp
                  key={`single-${screenDef.code}-${selectedLesson.id}-${runKey}`}
                  lesson={selectedLesson}
                  group={group}
                  items={singleItems}
                  rules={groupObj.rules}
                  seed={Number(seed) || 1}
                  muted={false}
                  sandbox
                  onEvent={pushEvent}
                  onDone={(res) => pushEvent('screen_done', res)}
                  extra={{ wordProgress: {} }}
                />
              ) : (
                <p className="text-muted text-center py-5">Màn chưa có component.</p>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: canRun + luồng sự kiện thời gian thực */}
        <div className="d-flex flex-column gap-3">
          <div className="card shadow-sm">
            <div className="card-body py-2 px-3">
              <div className="fw-bold small mb-1">Kiểm tra `canRun` ({screenDef?.code})</div>
              {canRunInfo.ok ? (
                <div className="text-success small fw-semibold">✓ Đủ dữ liệu trên bài `{selectedLesson?.id}`</div>
              ) : (
                <div className="text-danger small">✗ Thiếu: {canRunInfo.missing.join(', ')}</div>
              )}
              <div className="text-muted mt-1" style={{ fontSize: '0.74rem' }}>
                Chế độ <strong>sandbox = true</strong>: KHÔNG ghi `wordProgress`, `pet.skills`, ví Sữa hay `lessonMixLog`.
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body py-2 px-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold small">Luồng sự kiện `onEvent` ({events.length})</span>
                <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setEvents([])}>
                  Xoá log
                </button>
              </div>
              <div className="as-event-log">
                {events.length === 0 ? (
                  <div className="text-muted">Tương tác trong khung bên trái để xem sự kiện phát ra...</div>
                ) : (
                  events.map((ev) => (
                    <div key={ev.id} className="border-bottom py-1">
                      <span className="text-muted me-1">[{ev.time}]</span>
                      <strong className="text-primary">{ev.type}</strong>
                      <div className="text-muted text-break" style={{ fontSize: '0.72rem' }}>
                        {JSON.stringify(ev.payload)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
