// ════════════════════════════════════════════════════════════════
// PlacementTest — Kiểm tra đầu vào 5 phút (/placement, SDD-LEARNING-GROUPS §5.2)
// 3 tầng × 6 câu đa dạng 5 dạng bài:
//   🎧 Nghe hiểu · 📖 Từ vựng/Hình ảnh · ⚡ Đúng/Sai · 🔤 Ghép chữ · 🧩 Xếp câu
// Đạt ≥5/6 lên tầng tiếp; không lộ đáp án đúng lúc làm; không thưởng Sữa/Gem.
// ════════════════════════════════════════════════════════════════
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BEGINNER_UNITS, INTERMEDIATE_UNITS } from '../../data/lessons';
import { useUser } from '../../hooks/useUser';
import { usePet } from '../../hooks/usePet';
import { PetAvatar } from '../../pet-rig/PetAvatar';
import { speakWord, stopSpeaking } from '../../utils/speech';
import { resolveWordImage } from '../../utils/imageOverrides';
import {
  buildPlacementTierQuestions,
  evaluatePlacementAnswer,
  getQuestionAudio,
  isListeningQuestion,
} from './placementBuilder';
import Icon from '../../components/Icon';
import Emoji from '../../components/Emoji';
import '../../styles/arena.css';

export { getQuestionAudio, isListeningQuestion };

const TIERS = [
  { id: 'A', label: 'Tầng 1 · Nền tảng cơ bản', desc: 'Hình ảnh, phát âm, đúng/sai & ghép từ đầu tiên' },
  { id: 'B', label: 'Tầng 2 · Sơ trung cấp', desc: 'Nghe hiểu, từ vựng, ghép chữ & xếp câu giao tiếp' },
  { id: 'C', label: 'Tầng 3 · Giao tiếp & Ứng dụng', desc: 'Tình huống thực tế, nghe câu & cấu trúc nâng cao' },
];

function hasSpeechSupport() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export default function PlacementTest({ isNewUserOnboarding = false, onSkip }) {
  const navigate = useNavigate();
  const { userData, savePlacementResult, setLearningGroup } = useUser();
  const { getActivePetWithDecay } = usePet();
  const activePet = getActivePetWithDecay?.() || null;

  const [started, setStarted] = useState(false);
  const [tierIdx, setTierIdx] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [tierCorrect, setTierCorrect] = useState(0);
  const [tierScores, setTierScores] = useState({ A: 0, B: 0, C: 0 });
  const [result, setResult] = useState(null);

  // State cho 2 dạng tương tác ghép chữ (spell-tiles) & xếp câu (sentence-order)
  const [selectedTileIds, setSelectedTileIds] = useState([]);

  const handleSkipOrBack = () => {
    stopSpeaking();
    if (onSkip) {
      onSkip();
    } else if (!userData.learnerGroup) {
      navigate('/learning-path?pickGroup=1');
    } else {
      navigate('/learning-path');
    }
  };

  const speak = useCallback((text, rate = 0.85) => {
    if (!hasSpeechSupport() || !text) return;
    speakWord(text, { rate, lang: 'en-US' }).catch(() => {});
  }, []);

  const currentQ = started && !result ? questions[qIdx] : null;
  const currentAudio = getQuestionAudio(currentQ);

  // Reset trạng thái ghép chữ / xếp câu mỗi khi sang câu mới
  useEffect(() => {
    setSelectedTileIds([]);
  }, [tierIdx, qIdx, started]);

  // Tự động phát 1 lần khi sang câu có âm thanh (nghe hiểu / ghép chữ / đúng sai)
  useEffect(() => {
    if (!currentQ || !currentAudio) {
      stopSpeaking();
      return undefined;
    }
    // Tự phát cho câu Nghe hiểu và câu Ghép chữ
    if (currentQ.format === 'listen-pick' || currentQ.format === 'spell-tiles' || currentQ.audioText) {
      const timer = setTimeout(() => speak(currentAudio, 0.85), 220);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
    return () => stopSpeaking();
  }, [started, tierIdx, qIdx, result, currentQ, currentAudio, speak]);

  const playableStarterIds = useMemo(
    () => BEGINNER_UNITS.filter((u) => !u.comingSoon && u.lessons.length > 0).map((u) => u.id),
    []
  );

  const startTest = () => {
    const qsA = buildPlacementTierQuestions('A', { ttsAvailable: hasSpeechSupport() });
    setStarted(true);
    setTierIdx(0);
    setQuestions(qsA);
    setQIdx(0);
    setTierCorrect(0);
    setTierScores({ A: 0, B: 0, C: 0 });
    setResult(null);
    setSelectedTileIds([]);
  };

  const finalizePlacement = (finalTierScores, passedA, passedB, passedC) => {
    stopSpeaking();
    let group = 'beginner';
    let activePath = 'beginner';
    let placedUnits = [];
    let summary = 'Bắt đầu từ nhóm Mới học (Starter) để xây nền vững chắc nhé!';

    if (passedC) {
      group = 'intermediate';
      activePath = 'intermediate';
      placedUnits = [...playableStarterIds, ...INTERMEDIATE_UNITS.map((u) => u.id)];
      summary = 'Xuất sắc! Bạn đã vượt toàn bộ lộ trình Trung bình, mở khoá Nâng cao C1–C2 và sẵn sàng cho nhóm Luyện thi!';
    } else if (passedB) {
      group = 'intermediate';
      activePath = 'intermediate';
      placedUnits = [...playableStarterIds, 'int-u1', 'int-u2', 'int-u3', 'int-u4'];
      summary = 'Rất tốt! Bạn vào nhóm Trung bình và bắt đầu ngay từ Unit 5 (Giao tiếp hằng ngày).';
    } else if (passedA) {
      group = 'intermediate';
      activePath = 'intermediate';
      placedUnits = [...playableStarterIds];
      summary = 'Bạn đã nắm phần khởi đầu! Bắt đầu từ nhóm Trung bình (Unit 1 · Làm quen).';
    }

    const placementRecord = {
      date: new Date().toISOString(),
      tierScores: finalTierScores,
      result: { group, activePath, placedUnits },
    };

    savePlacementResult(placementRecord, placedUnits, group, activePath);
    setResult({ group, activePath, placedUnits, summary, passedC, tierScores: finalTierScores });
  };

  const submitAnswer = (userAnswer) => {
    stopSpeaking();
    const q = questions[qIdx];
    const isCorrect = evaluatePlacementAnswer(q, userAnswer);
    const nextCorrect = isCorrect ? tierCorrect + 1 : tierCorrect;

    if (qIdx + 1 < questions.length) {
      setTierCorrect(nextCorrect);
      setQIdx((i) => i + 1);
      return;
    }

    // Kết thúc tầng hiện tại
    const tierId = TIERS[tierIdx].id;
    const nextScores = { ...tierScores, [tierId]: nextCorrect };
    setTierScores(nextScores);

    const passedThisTier = nextCorrect >= 5;
    if (passedThisTier && tierIdx + 1 < TIERS.length) {
      const nextIdx = tierIdx + 1;
      setTierIdx(nextIdx);
      setQuestions(buildPlacementTierQuestions(TIERS[nextIdx].id, { ttsAvailable: hasSpeechSupport() }));
      setQIdx(0);
      setTierCorrect(0);
    } else {
      finalizePlacement(
        nextScores,
        nextScores.A >= 5,
        nextScores.A >= 5 && nextScores.B >= 5,
        nextScores.A >= 5 && nextScores.B >= 5 && nextScores.C >= 5
      );
    }
  };

  // ── Màn giới thiệu ──
  if (!started) {
    const showSkipToPicker = isNewUserOnboarding || !userData.learnerGroup;
    return (
      <div className="fade-in py-4 text-center" style={{ maxWidth: 660, margin: '0 auto' }}>
        <div
          className="card shadow-sm p-4"
          style={{ borderRadius: 20, background: '#FFFDF7', border: '2px solid #F0E2C4' }}
        >
          <div className="d-flex justify-content-center mb-2">
            {activePet?.speciesId ? (
              <PetAvatar
                petId={activePet.speciesId}
                stage={(activePet.evolution ?? 0) + 1}
                mode="home"
                canvasBubble={false}
                style={{ width: 96, height: 96 }}
              />
            ) : (
              <div style={{ fontSize: '3.5rem' }}>🧭</div>
            )}
          </div>
          <h2 className="fw-bold mt-1" style={{ color: '#4A3420' }}>
            {showSkipToPicker ? 'Chào mừng bạn đến Cowdi! Kiểm tra đầu vào nhé' : 'Kiểm tra đầu vào (5 phút)'}
          </h2>
          <p className="text-muted mb-3">
            Tối đa <strong>3 tầng × 6 câu</strong> với nhiều dạng bài tương tác nhanh để Cowdi xếp đúng lộ trình hợp trình độ nhất. Đạt ≥5/6 câu tự động lên tầng tiếp theo.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
            {['🎧 Nghe hiểu', '📖 Hình ảnh & Từ vựng', '⚡ Đúng hay Sai', '🔤 Ghép chữ', '🧩 Xếp câu'].map((tag) => (
              <span
                key={tag}
                className="badge rounded-pill px-3 py-2"
                style={{ background: '#FFF8E7', color: '#4A3420', border: '1px solid #F0E2C4', fontSize: '0.82rem' }}
              >
                {tag}
              </span>
            ))}
          </div>

          <ul className="list-unstyled small text-muted mb-4">
            <li>• Không trừ điểm, không áp lực — phù hợp cả người mới bắt đầu</li>
            <li>• Làm lại bất cứ lúc nào — chỉ mở thêm bài, không khoá lại tiến độ đã có</li>
          </ul>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <button type="button" className="btn btn-cowdi-primary btn-lg px-4 fw-bold" onClick={startTest}>
              Bắt đầu kiểm tra (5 phút) →
            </button>
            <button type="button" className="btn btn-outline-secondary btn-lg" onClick={handleSkipOrBack}>
              {showSkipToPicker ? 'Bỏ qua, tự chọn nhóm học →' : 'Quay lại'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Màn kết quả ──
  if (result) {
    return (
      <div className="fade-in py-4 text-center" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div
          className="card shadow-sm p-4"
          style={{ borderRadius: 20, background: '#FFFDF7', border: '2px solid #F0E2C4' }}
        >
          <div style={{ fontSize: '4rem' }}><Icon name="trophy" size={76} /></div>
          <h2 className="fw-bold mt-2">Kết quả xếp lớp của bạn</h2>
          <p className="lead text-muted mb-3">{result.summary}</p>
          <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
            <span className="badge bg-light text-dark border px-3 py-2">Tầng 1: {result.tierScores.A}/6</span>
            {result.tierScores.A >= 5 && (
              <span className="badge bg-light text-dark border px-3 py-2">Tầng 2: {result.tierScores.B}/6</span>
            )}
            {result.tierScores.B >= 5 && (
              <span className="badge bg-light text-dark border px-3 py-2">Tầng 3: {result.tierScores.C}/6</span>
            )}
          </div>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <button
              type="button"
              className="btn btn-cowdi-primary btn-lg px-4"
              onClick={() => navigate(`/learning-path?tab=${result.activePath}`)}
            >
              Vào lộ trình ngay →
            </button>
            {result.passedC && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => {
                    setLearningGroup('intermediate', 'advanced');
                    navigate('/learning-path?tab=advanced');
                  }}
                >
                  Học Nâng cao C1–C2
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-lg"
                  onClick={() => {
                    setLearningGroup('exam', 'ielts');
                    navigate('/learning-path?tab=ielts');
                  }}
                >
                  Chuyển sang Luyện thi
                </button>
              </>
            )}
            <button type="button" className="btn btn-outline-secondary" onClick={startTest}>
              Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Đang làm bài ──
  const tier = TIERS[tierIdx];
  const q = questions[qIdx];
  if (!q) return null;
  const audioText = getQuestionAudio(q);
  const wordImg = q.statementWord
    ? resolveWordImage(q.statementWord)
    : q.targetWord
      ? resolveWordImage(q.targetWord)
      : q.promptWord?.word
        ? resolveWordImage(q.promptWord.word)
        : null;

  // Xây dựng giá trị hiện tại cho dạng Ghép chữ / Xếp câu
  const tileLookup = new Map((q.tiles || []).map((t) => [t.id, t]));
  const selectedTiles = selectedTileIds.map((id) => tileLookup.get(id)).filter(Boolean);

  const toggleTile = (tileId) => {
    setSelectedTileIds((prev) =>
      prev.includes(tileId) ? prev.filter((id) => id !== tileId) : [...prev, tileId]
    );
  };

  return (
    <div
      className="fade-in quiz-viewport-stage p-3 rounded-4"
      style={{
        maxWidth: 740,
        margin: '0 auto',
        background: '#FFF8E7',
        border: '2px solid #F0E2C4',
      }}
    >
      {/* Thanh trên cùng */}
      <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-2">
        <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={handleSkipOrBack}>
          {isNewUserOnboarding || !userData.learnerGroup ? '✕ Bỏ qua' : '✕ Thoát'}
        </button>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1">{tier.label}</span>
          <span className="badge bg-white text-dark border rounded-pill px-2 py-1">
            Câu {qIdx + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="progress mb-3" style={{ height: 7, borderRadius: 999 }}>
        <div
          className="progress-bar progress-bar-cowdi"
          style={{ width: `${((qIdx + 1) / questions.length) * 100}%`, transition: 'width 0.25s' }}
        />
      </div>

      {/* Thẻ đề bài */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 16 }}>
        <div className="card-body text-center p-3 p-sm-4">
          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
            <span
              className="badge rounded-pill px-3 py-1"
              style={{ background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700 }}
            >
              {q.skillLabel || '📖 Trắc nghiệm'}
            </span>
            {audioText && (
              <div className="d-flex gap-1">
                <button
                  type="button"
                  className="btn btn-cowdi-primary btn-sm rounded-pill px-3 fw-bold"
                  onClick={() => speak(audioText, 0.85)}
                >
                  <Icon name="sound" size={15} /> Nghe
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill px-2"
                  onClick={() => speak(audioText, 0.55)}
                  title="Nghe chậm"
                >
                  🐢
                </button>
              </div>
            )}
          </div>

          {/* Minh hoạ (ảnh server / swatch / emoji) */}
          {q.promptWord && q.kind !== 'listen-pick-image' && (
            <div className="mb-2 d-flex justify-content-center align-items-center" style={{ minHeight: 60 }}>
              {q.promptWord.swatch ? (
                <span
                  aria-label="Màu mẫu"
                  style={{
                    display: 'inline-block',
                    width: 68,
                    height: 68,
                    borderRadius: 16,
                    backgroundColor: q.promptWord.swatch,
                    border: '2px solid rgba(15, 23, 42, 0.16)',
                  }}
                />
              ) : wordImg ? (
                <img src={wordImg} alt={q.promptWord.word || ''} style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 12 }} />
              ) : (
                <Emoji e={q.promptWord.emoji || '🖼️'} size={48} />
              )}
            </div>
          )}

          {(q.format === 'true-false' || q.format === 'spell-tiles') && (wordImg || q.illustration) && (
            <div className="mb-2 d-flex justify-content-center">
              {wordImg ? (
                <img src={wordImg} alt="" style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 12 }} />
              ) : (
                <Emoji e={q.illustration} size={46} />
              )}
            </div>
          )}

          <p className="fs-5 fw-bold mb-1" style={{ color: '#334155' }}>
            {q.question}
          </p>

          {q.format === 'true-false' && (
            <div className="mt-2 d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-light border">
              <strong className="fs-5 text-primary">{q.statementWord}</strong>
              <span className="text-muted">=</span>
              <strong className="fs-5 text-success">{q.statementMeaning}</strong>
            </div>
          )}
        </div>
      </div>

      {/* ── Dạng 1: Đúng / Sai nhanh (giống F-11) ── */}
      {q.format === 'true-false' && (
        <div className="row g-3">
          <div className="col-6">
            <button
              type="button"
              className="btn w-100 py-3 fw-bold fs-5 rounded-4 shadow-sm"
              style={{ background: '#ECFDF5', color: '#065F46', border: '2px solid #34D399' }}
              onClick={() => submitAnswer(0)}
            >
              ✅ Đúng
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className="btn w-100 py-3 fw-bold fs-5 rounded-4 shadow-sm"
              style={{ background: '#FEF2F2', color: '#991B1B', border: '2px solid #F87171' }}
              onClick={() => submitAnswer(1)}
            >
              ❌ Sai
            </button>
          </div>
        </div>
      )}

      {/* ── Dạng 2: Ghép chữ cái (giống F-02) ── */}
      {q.format === 'spell-tiles' && (
        <div className="card border-0 shadow-sm p-3" style={{ borderRadius: 16 }}>
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
            {Array.from({ length: q.targetWord.length }).map((_, slotIdx) => {
              const tile = selectedTiles[slotIdx];
              return (
                <button
                  key={slotIdx}
                  type="button"
                  disabled={!tile}
                  onClick={() => tile && toggleTile(tile.id)}
                  className="btn fw-bold fs-5 d-flex align-items-center justify-content-center"
                  style={{
                    width: 46,
                    height: 50,
                    borderRadius: 12,
                    background: tile ? '#EFF6FF' : '#F8FAFC',
                    color: '#1E3A8A',
                    border: tile ? '2px solid #3B82F6' : '2px dashed #CBD5E1',
                  }}
                >
                  {tile ? tile.ch : ''}
                </button>
              );
            })}
          </div>

          <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
            {(q.tiles || []).map((t) => {
              const used = selectedTileIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={used}
                  onClick={() => toggleTile(t.id)}
                  className="btn fw-bold fs-5"
                  style={{
                    width: 46,
                    height: 48,
                    borderRadius: 12,
                    background: used ? '#E2E8F0' : '#FFFFFF',
                    color: used ? '#94A3B8' : '#334155',
                    border: '2px solid #CBD5E1',
                    opacity: used ? 0.45 : 1,
                  }}
                >
                  {t.ch}
                </button>
              );
            })}
          </div>

          <div className="d-flex justify-content-between align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              disabled={selectedTileIds.length === 0}
              onClick={() => setSelectedTileIds([])}
            >
              ↺ Xoá chọn lại
            </button>
            <button
              type="button"
              className="btn btn-cowdi-primary fw-bold rounded-pill px-4"
              disabled={selectedTiles.length < q.targetWord.length}
              onClick={() => submitAnswer(selectedTiles.map((t) => t.ch).join(''))}
            >
              Xác nhận →
            </button>
          </div>
        </div>
      )}

      {/* ── Dạng 3: Xếp thứ tự câu (giống F-09 / T-08) ── */}
      {q.format === 'sentence-order' && (
        <div className="card border-0 shadow-sm p-3" style={{ borderRadius: 16 }}>
          <div
            className="p-3 rounded-3 mb-3 d-flex flex-wrap gap-2 align-items-center justify-content-center"
            style={{ minHeight: 62, background: '#F8FAFC', border: '2px dashed #CBD5E1' }}
          >
            {selectedTiles.length === 0 ? (
              <span className="text-muted small">Chạm các từ bên dưới để xếp thành câu đúng...</span>
            ) : (
              selectedTiles.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTile(t.id)}
                  className="btn btn-sm fw-bold rounded-pill px-3"
                  style={{ background: '#EFF6FF', color: '#1E3A8A', border: '1.5px solid #3B82F6' }}
                >
                  {t.text}
                </button>
              ))
            )}
          </div>

          <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
            {(q.tiles || []).map((t) => {
              const used = selectedTileIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={used}
                  onClick={() => toggleTile(t.id)}
                  className="btn btn-sm fw-bold rounded-pill px-3 py-2"
                  style={{
                    background: used ? '#E2E8F0' : '#FFFFFF',
                    color: used ? '#94A3B8' : '#334155',
                    border: '1.5px solid #CBD5E1',
                    opacity: used ? 0.45 : 1,
                  }}
                >
                  {t.text}
                </button>
              );
            })}
          </div>

          <div className="d-flex justify-content-between align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              disabled={selectedTileIds.length === 0}
              onClick={() => setSelectedTileIds([])}
            >
              ↺ Xếp lại
            </button>
            <button
              type="button"
              className="btn btn-cowdi-primary fw-bold rounded-pill px-4"
              disabled={selectedTiles.length < (q.tiles?.length || 0)}
              onClick={() => submitAnswer(selectedTiles.map((t) => t.text).join(' '))}
            >
              Xác nhận →
            </button>
          </div>
        </div>
      )}

      {/* ── Dạng 4 & 5: Trắc nghiệm / Nghe hiểu 4 đáp án sáng rõ ── */}
      {q.format !== 'true-false' && q.format !== 'spell-tiles' && q.format !== 'sentence-order' && (
        <div className="arena-options-grid arena-options-grid--boss">
          {(q.options || []).map((opt, idx) => {
            const cw = q.kind === 'listen-pick-image' ? q.choiceWords?.[idx] : null;
            return (
              <button
                key={`${tierIdx}-${qIdx}-${idx}`}
                type="button"
                className="arena-option-btn arena-option-btn--boss"
                onClick={() => submitAnswer(idx)}
              >
                <span className="arena-option-key">{String.fromCharCode(65 + idx)}</span>
                {cw?.swatch && (
                  <span
                    className="flex-shrink-0"
                    style={{
                      display: 'inline-block',
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      backgroundColor: cw.swatch,
                      border: '1.5px solid rgba(15, 23, 42, 0.2)',
                    }}
                  />
                )}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
