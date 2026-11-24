// ════════════════════════════════════════════════════════════════
// PictureLesson — Bài học Cấp 1 (Mới học / Starter, format: 'picture')
// Thiết kế: SDD-LEARNING-GROUPS-v2.0 §4.4 & SRS-LESSON-3-LEVELS-v1.0 §2.2
// 6 bước: Xem và nghe → Nghe chọn hình → Ghép hình với chữ → Mẫu câu → Nhắc lại → Thử thách
// Không hiện IPA, không ngữ pháp, chữ to ≥28px, nút chạm ≥56px, không chấm phát âm.
// ════════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import Emoji from '../../components/Emoji';
import { shuffleArray, generatePictureChallenge } from '../../utils/quiz-gen';

const PIC_STEPS = [
  { key: 'look',      label: 'Xem & nghe',    icon: 'eye' },
  { key: 'listen',    label: 'Nghe chọn hình', icon: 'ear' },
  { key: 'match',     label: 'Ghép hình',     icon: 'blocks' },
  { key: 'pattern',   label: 'Mẫu câu',       icon: 'chat' },
  { key: 'repeat',    label: 'Nhắc lại',      icon: 'speak', optional: true },
  { key: 'challenge', label: 'Thử thách',     icon: 'target' },
];

const DEFAULT_INSTRUCTIONS = {
  look:      'Chạm vào hình để nghe nhé!',
  listen:    'Nghe và chọn đúng hình.',
  match:     'Chọn chữ rồi chạm đúng hình.',
  pattern:   'Chọn hình để hoàn thành câu.',
  repeat:    'Nói theo Cowdi nào!',
  challenge: 'Thử thách: đúng 4 câu là qua!',
};

function PictureVisual({ wordObj, size = 64 }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (wordObj?.image && !imgFailed) {
    return (
      <img
        src={wordObj.image}
        alt={wordObj.word}
        onError={() => setImgFailed(true)}
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: 12 }}
      />
    );
  }
  return <span style={{ fontSize: `${Math.round(size * 0.85)}px`, lineHeight: 1 }}><Emoji e={wordObj?.emoji || '🖼️'} size={size} /></span>;
}

export default function PictureLesson({
  lesson,
  rules,
  speakWord,
  play,
  petRef,
  userData,
  pathQuerySuffix,
  pathNext,
  onComplete,
}) {
  const navigate = useNavigate();
  const words = useMemo(() => lesson.words || [], [lesson.words]);
  const pattern = lesson.pattern || { en: 'I like ___.', vi: 'Em thích ___.' };
  const instructions = { ...DEFAULT_INSTRUCTIONS, ...(lesson.instructionsVi || {}) };
  const ttsRate = rules?.ttsRate || 0.8;
  const passRate = rules?.lessonPassRate || 4 / 6;

  const [stepIdx, setStepIdx] = useState(0);
  const step = PIC_STEPS[stepIdx];

  // Kiểm tra trình duyệt có giọng đọc tiếng Việt không
  const [hasViVoice, setHasViVoice] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const check = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      setHasViVoice(voices.some((v) => /vi/i.test(v.lang)));
    };
    check();
    window.speechSynthesis.onvoiceschanged = check;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const playAudioOrSpeak = useCallback((wordOrObj) => {
    const audioUrl = typeof wordOrObj === 'object' ? wordOrObj?.audio : null;
    const text = typeof wordOrObj === 'object' ? wordOrObj?.word : String(wordOrObj || '');
    if (audioUrl && typeof Audio !== 'undefined') {
      try {
        const a = new Audio(audioUrl);
        a.play().catch(() => speakWord(text, ttsRate, { lang: 'en-US' }));
        return;
      } catch { /* fallback */ }
    }
    speakWord(text, ttsRate, { lang: 'en-US' });
  }, [speakWord, ttsRate]);

  // ── Bước 1: Xem & nghe ──
  const [heardWords, setHeardWords] = useState(() => new Set());
  const allHeard = words.length > 0 && heardWords.size >= words.length;

  // ── Bước 2: Nghe chọn hình (6 lượt) ──
  const [listenTurns, setListenTurns] = useState([]);
  const [listenIdx, setListenIdx] = useState(0);
  const [listenPick, setListenPick] = useState(null);

  useEffect(() => {
    if (step.key !== 'listen') return;
    const turns = [];
    const pool = shuffleArray(words);
    for (let i = 0; i < 6; i++) {
      const target = pool[i % pool.length];
      const others = shuffleArray(words.filter((w) => w.word !== target.word)).slice(0, 3);
      turns.push({ target, choices: shuffleArray([target, ...others]) });
    }
    setListenTurns(turns);
    setListenIdx(0);
    setListenPick(null);
  }, [step.key, words]);

  useEffect(() => {
    if (step.key === 'listen' && listenTurns[listenIdx]) {
      const t = setTimeout(() => playAudioOrSpeak(listenTurns[listenIdx].target), 250);
      return () => clearTimeout(t);
    }
  }, [step.key, listenIdx, listenTurns, playAudioOrSpeak]);

  // ── Bước 3: Ghép hình với chữ (kéo thả + bấm 2 lần) ──
  const [matchWords, setMatchWords] = useState([]);
  const [matchPics, setMatchPics] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [matchedSet, setMatchedSet] = useState(() => new Set());
  const [wrongPair, setWrongPair] = useState(null);

  useEffect(() => {
    if (step.key !== 'match') return;
    setMatchWords(shuffleArray(words));
    setMatchPics(shuffleArray(words));
    setSelectedWord(null);
    setMatchedSet(new Set());
    setWrongPair(null);
  }, [step.key, words]);

  const tryMatchPair = (wordStr, picWordStr) => {
    if (!wordStr || matchedSet.has(wordStr)) return;
    if (wordStr === picWordStr) {
      play('correct');
      petRef?.current?.emit('answer_correct');
      playAudioOrSpeak(words.find((w) => w.word === wordStr));
      setMatchedSet((prev) => new Set([...prev, wordStr]));
      setSelectedWord(null);
      setWrongPair(null);
    } else {
      play('wrong');
      petRef?.current?.emit('answer_wrong');
      setWrongPair(picWordStr);
      setTimeout(() => setWrongPair(null), 500);
    }
  };

  // ── Bước 4: Mẫu câu ──
  const [patternWord, setPatternWord] = useState(null);
  const [patternTried, setPatternTried] = useState(() => new Set());

  const pickPatternWord = (w) => {
    setPatternWord(w);
    setPatternTried((prev) => new Set([...prev, w.word]));
    const fullSentence = pattern.en.replace('___', w.word);
    speakWord(fullSentence, ttsRate, { lang: 'en-US' });
  };

  // ── Bước 5: Nhắc lại (tuỳ chọn, KHÔNG chấm điểm) ──
  const [repeatIdx, setRepeatIdx] = useState(0);
  const [repeatCheered, setRepeatCheered] = useState(false);

  const handleRepeatDone = () => {
    setRepeatCheered(true);
    play('correct');
    petRef?.current?.emit('answer_correct');
  };

  // ── Bước 6: Thử thách (6 câu, ≥4/6 đạt) ──
  const [challengeQs, setChallengeQs] = useState([]);
  const [chIdx, setChIdx] = useState(0);
  const [chPicked, setChPicked] = useState(null);
  const [chScore, setChScore] = useState(0);
  const [chFinished, setChFinished] = useState(false);
  const [rewardInfo, setRewardInfo] = useState(null);

  const startChallenge = useCallback(() => {
    const qs = generatePictureChallenge(words, pattern, 6);
    setChallengeQs(qs);
    setChIdx(0);
    setChPicked(null);
    setChScore(0);
    setChFinished(false);
    setRewardInfo(null);
  }, [words, pattern]);

  useEffect(() => {
    if (step.key === 'challenge') startChallenge();
  }, [step.key, startChallenge]);

  useEffect(() => {
    if (step.key === 'challenge' && !chFinished && challengeQs[chIdx]?.speak) {
      const t = setTimeout(() => speakWord(challengeQs[chIdx].speak, ttsRate, { lang: 'en-US' }), 250);
      return () => clearTimeout(t);
    }
  }, [step.key, chIdx, chFinished, challengeQs, speakWord, ttsRate]);

  const handleChallengePick = (optIdx) => {
    if (chPicked !== null) return;
    const q = challengeQs[chIdx];
    const ok = optIdx === q.correct;
    setChPicked(optIdx);
    const nextScore = ok ? chScore + 1 : chScore;
    if (ok) {
      setChScore(nextScore);
      play('correct');
      petRef?.current?.emit('answer_correct');
    } else {
      play('wrong');
      petRef?.current?.emit('answer_wrong');
    }

    setTimeout(() => {
      if (chIdx + 1 < challengeQs.length) {
        setChIdx((i) => i + 1);
        setChPicked(null);
      } else {
        setChFinished(true);
        const total = challengeQs.length;
        const pct = total > 0 ? nextScore / total : 0;
        const passed = pct >= passRate;
        const info = onComplete?.({ score: nextScore, total, passed });
        setRewardInfo(info || null);
      }
    }, 900);
  };

  // ── Màn kết quả Thử thách ──
  if (step.key === 'challenge' && chFinished) {
    const total = challengeQs.length || 6;
    const passed = chScore / total >= passRate;
    return (
      <div className="text-center py-4 fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ fontSize: '4.5rem' }} className="emoji-big">
          <Icon name={passed ? 'trophy' : 'muscle'} size={88} />
        </div>
        <h2 className="fw-bold mt-2">{passed ? 'Tuyệt vời! Con đã hoàn thành bài!' : 'Cố lên chút nữa nhé!'}</h2>
        <div className="display-4 fw-bold text-cowdi-primary my-2">{chScore}/{total}</div>
        <p className="text-muted">
          {passed
            ? 'Con làm rất giỏi! Bài tiếp theo đã mở rồi đó!'
            : 'Cần đúng ít nhất 4/6 câu để qua bài. Mình thử lại nhé!'}
        </p>

        {rewardInfo && (
          <div className="d-flex justify-content-center gap-2 flex-wrap my-3">
            <span className="badge bg-primary fs-6 px-3 py-2">🥛 +{rewardInfo.milk} Sữa</span>
            {rewardInfo.gem > 0 && <span className="badge bg-info text-dark fs-6 px-3 py-2">💎 +{rewardInfo.gem} Gem</span>}
            {rewardInfo.stone > 0 && <span className="badge bg-success fs-6 px-3 py-2">💠 +{rewardInfo.stone} Đá</span>}
          </div>
        )}

        {lesson.parentTip && (
          <div className="alert alert-light border text-start mt-3">
            <div className="fw-bold small text-cowdi-primary mb-1">👨‍👩‍👧 Gợi ý cho phụ huynh</div>
            <div className="small">{lesson.parentTip}</div>
          </div>
        )}

        <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
          {passed && pathNext?.type === 'lesson' && pathNext.lessonId !== lesson.id && (
            <button
              type="button"
              className="btn btn-cowdi-primary btn-lg"
              style={{ minHeight: 56 }}
              onClick={() => navigate(`/lessons/${pathNext.lessonId}`)}
            >
              <Icon name="play" size={18} /> Bài tiếp theo
            </button>
          )}
          <button
            type="button"
            className={`btn btn-lg ${passed ? 'btn-outline-secondary' : 'btn-cowdi-primary'}`}
            style={{ minHeight: 56 }}
            onClick={startChallenge}
          >
            <Icon name="refresh" size={16} /> Chơi lại thử thách
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-lg"
            style={{ minHeight: 56 }}
            onClick={() => navigate(`/learning-path${pathQuerySuffix || ''}`)}
          >
            <Icon name="road" size={16} /> Lộ trình
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header đơn giản cho Cấp 1 */}
      <div className="card shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate(`/learning-path${pathQuerySuffix || ''}`)}
            >
              <i className="fas fa-arrow-left me-1"></i>Lộ trình
            </button>
            <span className="badge bg-success-subtle text-success fs-6">🌱 Mới học · Bước {stepIdx + 1}/{PIC_STEPS.length}</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span style={{ fontSize: '2.5rem' }}><Emoji e={lesson.icon} size={44} /></span>
            <div>
              <h3 className="fw-bold mb-0">{lesson.title}</h3>
              <small className="text-muted">{lesson.description}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh tiến độ 6 bước */}
      <div className="d-flex gap-1 mb-3 flex-wrap justify-content-center">
        {PIC_STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            disabled={i > stepIdx}
            onClick={() => i <= stepIdx && setStepIdx(i)}
            className={`btn btn-sm ${i === stepIdx ? 'btn-cowdi-primary' : i < stepIdx ? 'btn-success' : 'btn-outline-secondary'}`}
            style={{ borderRadius: 999 }}
          >
            {i + 1}. {s.label}{s.optional ? ' (tuỳ chọn)' : ''}
          </button>
        ))}
      </div>

      {/* Lời hướng dẫn ngắn tiếng Việt + nút loa giọng Việt */}
      <div className="alert alert-light border d-flex align-items-center justify-content-between gap-2 mb-3">
        <div className="fw-bold fs-5 mb-0">{instructions[step.key]}</div>
        {hasViVoice && (
          <button
            type="button"
            className="btn btn-outline-primary"
            style={{ minWidth: 56, minHeight: 48 }}
            onClick={() => speakWord(instructions[step.key], 0.9, { lang: 'vi-VN' })}
            title="Nghe hướng dẫn"
          >
            <Icon name="sound" size={18} />
          </button>
        )}
      </div>

      {/* ── BƯỚC 1: XEM VÀ NGHE ── */}
      {step.key === 'look' && (
        <div>
          <div className="row g-3">
            {words.map((w) => {
              const heard = heardWords.has(w.word);
              return (
                <div className="col-6 col-md-4" key={w.word}>
                  <button
                    type="button"
                    className={`card w-100 h-100 text-center p-3 shadow-sm ${heard ? 'border-success bg-success-subtle' : ''}`}
                    style={{ minHeight: 160, cursor: 'pointer' }}
                    onClick={() => {
                      playAudioOrSpeak(w);
                      setHeardWords((prev) => new Set([...prev, w.word]));
                    }}
                  >
                    <div className="my-2"><PictureVisual wordObj={w} size={68} /></div>
                    <div className="fw-bold text-cowdi-primary" style={{ fontSize: 28, lineHeight: 1.15 }}>{w.word}</div>
                    <div className="text-muted mt-1" style={{ fontSize: 16 }}>{w.meaning}</div>
                    {heard && <span className="badge bg-success mt-2 align-self-center">✓ Đã nghe</span>}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-4">
            <button
              type="button"
              className="btn btn-cowdi-primary btn-lg px-4"
              style={{ minHeight: 56 }}
              disabled={!allHeard}
              onClick={() => setStepIdx(1)}
            >
              {allHeard ? 'Tiếp tục →' : `Chạm nghe hết ${words.length} hình (${heardWords.size}/${words.length})`}
            </button>
          </div>
        </div>
      )}

      {/* ── BƯỚC 2: NGHE CHỌN HÌNH ── */}
      {step.key === 'listen' && listenTurns[listenIdx] && (
        <div className="text-center">
          <div className="text-muted fw-bold mb-2">Lượt {listenIdx + 1} / {listenTurns.length}</div>
          <button
            type="button"
            className="btn btn-cowdi-primary btn-lg rounded-pill px-4 mb-4"
            style={{ minHeight: 60 }}
            onClick={() => playAudioOrSpeak(listenTurns[listenIdx].target)}
          >
            <Icon name="sound" size={24} /> Nghe lại từ
          </button>
          <div className="row g-3">
            {listenTurns[listenIdx].choices.map((w) => {
              const isTarget = w.word === listenTurns[listenIdx].target.word;
              const picked = listenPick === w.word;
              let cls = 'card w-100 p-3 shadow-sm text-center';
              if (listenPick) {
                if (isTarget) cls += ' border-success bg-success-subtle';
                else if (picked) cls += ' border-danger bg-danger-subtle';
              }
              return (
                <div className="col-6" key={w.word}>
                  <button
                    type="button"
                    disabled={!!listenPick}
                    className={cls}
                    style={{ minHeight: 140, cursor: 'pointer' }}
                    onClick={() => {
                      setListenPick(w.word);
                      if (isTarget) {
                        play('correct');
                        petRef?.current?.emit('answer_correct');
                      } else {
                        play('wrong');
                        petRef?.current?.emit('answer_wrong');
                      }
                      setTimeout(() => {
                        if (listenIdx + 1 < listenTurns.length) {
                          setListenIdx((i) => i + 1);
                          setListenPick(null);
                        } else {
                          setStepIdx(2);
                        }
                      }, 750);
                    }}
                  >
                    <div className="my-2"><PictureVisual wordObj={w} size={64} /></div>
                    <div className="text-muted" style={{ fontSize: 16 }}>{w.meaning}</div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BƯỚC 3: GHÉP HÌNH VỚI CHỮ (kéo thả + bấm 2 lần) ── */}
      {step.key === 'match' && (
        <div>
          <div className="row g-3">
            <div className="col-6">
              <div className="small text-muted fw-bold mb-2">Chữ tiếng Anh</div>
              <div className="d-flex flex-column gap-2">
                {matchWords.map((w) => {
                  const done = matchedSet.has(w.word);
                  const active = selectedWord === w.word;
                  return (
                    <button
                      key={w.word}
                      type="button"
                      draggable={!done}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', w.word);
                        setSelectedWord(w.word);
                      }}
                      disabled={done}
                      onClick={() => {
                        setSelectedWord(w.word);
                        playAudioOrSpeak(w);
                      }}
                      className={`btn fw-bold ${done ? 'btn-success opacity-50' : active ? 'btn-cowdi-primary' : 'btn-outline-primary'}`}
                      style={{ minHeight: 58, fontSize: 24 }}
                    >
                      {w.word}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="col-6">
              <div className="small text-muted fw-bold mb-2">Hình minh hoạ</div>
              <div className="d-flex flex-column gap-2">
                {matchPics.map((w) => {
                  const done = matchedSet.has(w.word);
                  const wrong = wrongPair === w.word;
                  return (
                    <button
                      key={w.word}
                      type="button"
                      disabled={done}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const dragged = e.dataTransfer.getData('text/plain') || selectedWord;
                        tryMatchPair(dragged, w.word);
                      }}
                      onClick={() => tryMatchPair(selectedWord, w.word)}
                      className={`btn d-flex align-items-center justify-content-center gap-2 ${
                        done ? 'btn-success opacity-50' : wrong ? 'btn-danger' : 'btn-outline-secondary'
                      }`}
                      style={{ minHeight: 58 }}
                    >
                      <PictureVisual wordObj={w} size={40} />
                      <span className="small">{w.meaning}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <button
              type="button"
              className="btn btn-cowdi-primary btn-lg px-4"
              style={{ minHeight: 56 }}
              disabled={matchedSet.size < words.length}
              onClick={() => setStepIdx(3)}
            >
              {matchedSet.size >= words.length ? 'Tiếp tục →' : `Đã ghép ${matchedSet.size}/${words.length}`}
            </button>
          </div>
        </div>
      )}

      {/* ── BƯỚC 4: MẪU CÂU ── */}
      {step.key === 'pattern' && (
        <div className="text-center">
          <div className="card shadow-sm mb-3 p-4">
            {pattern.image && (
              <img src={pattern.image} alt="" className="img-fluid rounded mb-3" style={{ maxHeight: 220, objectFit: 'contain' }} />
            )}
            <div className="fw-bold text-cowdi-primary" style={{ fontSize: 30 }}>
              {pattern.en.replace('___', patternWord ? patternWord.word : '___')}
            </div>
            <div className="text-muted mt-1" style={{ fontSize: 18 }}>
              {pattern.vi.replace('___', patternWord ? patternWord.meaning : '___')}
            </div>
            {patternWord && (
              <button
                type="button"
                className="btn btn-outline-primary mt-3 align-self-center"
                style={{ minHeight: 48 }}
                onClick={() => speakWord(pattern.en.replace('___', patternWord.word), ttsRate, { lang: 'en-US' })}
              >
                <Icon name="sound" size={18} /> Nghe lại cả câu
              </button>
            )}
          </div>
          <div className="row g-2">
            {words.map((w) => (
              <div className="col-4 col-md-2" key={w.word}>
                <button
                  type="button"
                  className={`card w-100 p-2 text-center ${patternWord?.word === w.word ? 'border-primary bg-primary-subtle' : ''}`}
                  style={{ minHeight: 96, cursor: 'pointer' }}
                  onClick={() => pickPatternWord(w)}
                >
                  <div><PictureVisual wordObj={w} size={44} /></div>
                  <div className="fw-bold small mt-1">{w.word}</div>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="btn btn-cowdi-primary btn-lg px-4"
              style={{ minHeight: 56 }}
              disabled={patternTried.size === 0}
              onClick={() => { setRepeatIdx(0); setRepeatCheered(false); setStepIdx(4); }}
            >
              Tiếp tục →
            </button>
          </div>
        </div>
      )}

      {/* ── BƯỚC 5: NHẮC LẠI (tuỳ chọn, KHÔNG chấm điểm) ── */}
      {step.key === 'repeat' && words[repeatIdx] && (
        <div className="text-center">
          <div className="card shadow-sm p-4 mb-3">
            <div className="text-muted small mb-2">Từ {repeatIdx + 1}/{words.length} · Bước tuỳ chọn (không chấm điểm)</div>
            <div className="my-2"><PictureVisual wordObj={words[repeatIdx]} size={88} /></div>
            <div className="fw-bold text-cowdi-primary" style={{ fontSize: 34 }}>{words[repeatIdx].word}</div>
            <div className="text-muted mb-3" style={{ fontSize: 18 }}>{words[repeatIdx].meaning}</div>

            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button
                type="button"
                className="btn btn-outline-primary btn-lg"
                style={{ minHeight: 56 }}
                onClick={() => playAudioOrSpeak(words[repeatIdx])}
              >
                <Icon name="sound" size={20} /> Nghe mẫu
              </button>
              <button
                type="button"
                className="btn btn-success btn-lg"
                style={{ minHeight: 56 }}
                onClick={handleRepeatDone}
              >
                <Icon name="mic" size={20} /> Con đã nói!
              </button>
            </div>
            {repeatCheered && (
              <div className="alert alert-success mt-3 mb-0 fw-bold">
                🌟 Giỏi lắm! Cowdi vỗ tay khen con đó!
              </div>
            )}
          </div>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            {repeatIdx + 1 < words.length && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg"
                style={{ minHeight: 56 }}
                onClick={() => { setRepeatIdx((i) => i + 1); setRepeatCheered(false); }}
              >
                Từ tiếp theo →
              </button>
            )}
            <button
              type="button"
              className="btn btn-cowdi-primary btn-lg px-4"
              style={{ minHeight: 56 }}
              onClick={() => setStepIdx(5)}
            >
              Sang Thử thách →
            </button>
          </div>
        </div>
      )}

      {/* ── BƯỚC 6: THỬ THÁCH (6 câu, ≥4/6 qua bài) ── */}
      {step.key === 'challenge' && challengeQs[chIdx] && (() => {
        const q = challengeQs[chIdx];
        return (
          <div className="text-center">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted fw-bold">Câu {chIdx + 1}/{challengeQs.length}</span>
              <span className="badge bg-warning text-dark fs-6">⭐ {chScore}</span>
            </div>
            <div className="card shadow-sm p-4 mb-3">
              {q.kind !== 'listen-pick-image' && q.promptWord && (
                <div className="mb-2"><PictureVisual wordObj={q.promptWord} size={76} /></div>
              )}
              <div className="fw-bold fs-4 mb-2">{q.question}</div>
              {q.speak && (
                <button
                  type="button"
                  className="btn btn-cowdi-primary rounded-pill px-4 align-self-center"
                  style={{ minHeight: 52 }}
                  onClick={() => speakWord(q.speak, ttsRate, { lang: 'en-US' })}
                >
                  <Icon name="sound" size={18} /> Nghe lại
                </button>
              )}
            </div>
            <div className="row g-2">
              {q.options.map((opt, idx) => {
                const isCorrect = idx === q.correct;
                const picked = chPicked === idx;
                let cls = 'btn w-100 fw-bold';
                if (chPicked !== null) {
                  cls += isCorrect ? ' btn-success' : picked ? ' btn-danger' : ' btn-outline-secondary';
                } else {
                  cls += ' btn-outline-primary';
                }
                return (
                  <div className="col-6" key={idx}>
                    <button
                      type="button"
                      disabled={chPicked !== null}
                      className={cls}
                      style={{ minHeight: 68, fontSize: q.kind === 'listen-pick-image' ? 20 : 26 }}
                      onClick={() => handleChallengePick(idx)}
                    >
                      {q.kind === 'listen-pick-image' && q.choiceWords?.[idx] ? (
                        <div className="d-flex flex-column align-items-center gap-1 py-1">
                          <PictureVisual wordObj={q.choiceWords[idx]} size={44} />
                          <span className="small">{q.choiceWords[idx].meaning}</span>
                        </div>
                      ) : opt}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
