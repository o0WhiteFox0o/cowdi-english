import { useMemo, useState } from 'react';
import { getDuelQuizPool, isPlayableDuelQuestion } from '../../data/quiz/duel-quiz-pool';
import { speakWord, stopSpeaking } from '../../utils/speech';

const CAT_LABELS = {
  vocabulary: { label: 'Từ vựng', badge: 'bg-primary' },
  grammar: { label: 'Ngữ pháp', badge: 'bg-info text-dark' },
  sentences: { label: 'Câu / Ngữ cảnh', badge: 'bg-secondary' },
  listening: { label: 'Nghe (TTS)', badge: 'bg-success' },
};

const PAGE_SIZE = 25;

export default function AdminQuizInspector() {
  const pool = useMemo(() => getDuelQuizPool(), []);
  const [catFilter, setCatFilter] = useState('all');
  const [audioFilter, setAudioFilter] = useState('all'); // all | has_audio | no_audio
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [speakingIdx, setSpeakingIdx] = useState(null);

  const stats = useMemo(() => {
    const byCat = { vocabulary: 0, grammar: 0, sentences: 0, listening: 0 };
    let withAudio = 0;
    let invalidCount = 0;
    let listeningMissingAudio = 0;
    for (const q of pool) {
      byCat[q.category] = (byCat[q.category] || 0) + 1;
      if (q.speak) withAudio++;
      if (!isPlayableDuelQuestion(q)) invalidCount++;
      if (q.category === 'listening' && !q.speak) listeningMissingAudio++;
    }
    return {
      total: pool.length,
      byCat,
      withAudio,
      invalidCount,
      listeningMissingAudio,
    };
  }, [pool]);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return pool.filter((q) => {
      if (catFilter !== 'all' && q.category !== catFilter) return false;
      if (audioFilter === 'has_audio' && !q.speak) return false;
      if (audioFilter === 'no_audio' && q.speak) return false;
      if (kw) {
        const hay = `${q.question} ${(q.options || []).join(' ')} ${q.speak || ''} ${q.source || ''}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [pool, catFilter, audioFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSpeak = (text, idx) => {
    if (!text) return;
    stopSpeaking();
    setSpeakingIdx(idx);
    speakWord(text, {
      rate: 0.9,
      onEnd: () => setSpeakingIdx((cur) => (cur === idx ? null : cur)),
    }).catch(() => setSpeakingIdx(null));
  };

  return (
    <div className="fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-1">⚔️ Kiểm tra Ngân hàng Câu hỏi Đấu trường</h4>
          <p className="text-muted small mb-0">
            Rà soát toàn bộ câu hỏi thực tế được bốc vào Đấu trường, kiểm tra nhãn loại câu, đáp án đúng và bấm nghe thử TTS trực tiếp.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className={`badge px-3 py-2 ${stats.invalidCount === 0 && stats.listeningMissingAudio === 0 ? 'bg-success' : 'bg-danger'}`}>
            {stats.invalidCount === 0 && stats.listeningMissingAudio === 0
              ? '✅ 0 câu lỗi · 0 câu Nghe mất tiếng'
              : `⚠️ ${stats.invalidCount} câu lỗi · ${stats.listeningMissingAudio} câu nghe mất tiếng`}
          </span>
        </div>
      </div>

      {/* KPI tổng quan pool */}
      <div className="row g-2 mb-3">
        {[
          { label: 'Tổng pool Đấu trường', val: stats.total, color: '#2563eb' },
          { label: 'Từ vựng', val: stats.byCat.vocabulary, color: '#0d6efd' },
          { label: 'Ngữ pháp', val: stats.byCat.grammar, color: '#0891b2' },
          { label: 'Câu / Ngữ cảnh', val: stats.byCat.sentences, color: '#64748b' },
          { label: 'Nghe (TTS)', val: stats.byCat.listening, color: '#16a34a' },
          { label: 'Có nút Nghe (speak)', val: stats.withAudio, color: '#9333ea' },
        ].map((k) => (
          <div key={k.label} className="col-6 col-md-4 col-lg-2">
            <div className="cowdi-card p-2 text-center">
              <div className="fw-bold fs-4" style={{ color: k.color }}>{k.val.toLocaleString()}</div>
              <div className="small text-muted">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bộ lọc */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2 px-3 d-flex flex-wrap gap-2 align-items-center">
          <input
            type="search"
            className="form-control form-control-sm"
            style={{ maxWidth: 260 }}
            placeholder="Tìm câu hỏi, đáp án, nguồn bài..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Tất cả loại câu ({stats.total})</option>
            <option value="vocabulary">Từ vựng ({stats.byCat.vocabulary})</option>
            <option value="grammar">Ngữ pháp ({stats.byCat.grammar})</option>
            <option value="sentences">Câu / Ngữ cảnh ({stats.byCat.sentences})</option>
            <option value="listening">Nghe ({stats.byCat.listening})</option>
          </select>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={audioFilter}
            onChange={(e) => { setAudioFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Mọi trạng thái loa</option>
            <option value="has_audio">🔊 Có văn bản đọc ({stats.withAudio})</option>
            <option value="no_audio">Không có âm thanh ({stats.total - stats.withAudio})</option>
          </select>
          <span className="ms-auto small text-muted">
            Khớp: <strong>{filtered.length.toLocaleString()}</strong> câu
          </span>
        </div>
      </div>

      {/* Bảng câu hỏi */}
      <div className="cowdi-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.84rem' }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: 110 }}>Loại / Nguồn</th>
                <th>Câu hỏi &amp; Nội dung đọc</th>
                <th>4 Đáp án (xanh = đúng)</th>
                <th style={{ width: 95 }} className="text-end">Thử đọc</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((q, i) => {
                const rowId = (safePage - 1) * PAGE_SIZE + i;
                const catInfo = CAT_LABELS[q.category] || { label: q.category, badge: 'bg-dark' };
                return (
                  <tr key={`${q.source}-${rowId}`}>
                    <td>
                      <span className={`badge ${catInfo.badge} mb-1`}>{catInfo.label}</span>
                      <div className="text-muted text-truncate" style={{ fontSize: '0.7rem', maxWidth: 110 }} title={q.source || ''}>
                        {q.source || q.level}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold">{q.question}</div>
                      {q.speak && (
                        <div className="small text-primary mt-1">
                          🔊 <em>&ldquo;{q.speak}&rdquo;</em>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(q.options || []).map((opt, idx) => (
                          <span
                            key={idx}
                            className={`badge ${
                              idx === q.correct
                                ? 'bg-success-subtle text-success border border-success-subtle'
                                : 'bg-light text-dark border'
                            }`}
                            style={{ fontWeight: idx === q.correct ? 700 : 500 }}
                          >
                            {String.fromCharCode(65 + idx)}. {opt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-end">
                      {q.speak ? (
                        <button
                          type="button"
                          className={`btn btn-sm ${speakingIdx === rowId ? 'btn-primary' : 'btn-outline-primary'}`}
                          style={{ fontSize: '0.74rem' }}
                          onClick={() => handleSpeak(q.speak, rowId)}
                        >
                          {speakingIdx === rowId ? '🔊 Đang đọc' : '🔊 Nghe'}
                        </button>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted">
                    Không có câu hỏi nào khớp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Trước
          </button>
          <span className="small fw-semibold">Trang {safePage} / {totalPages}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
