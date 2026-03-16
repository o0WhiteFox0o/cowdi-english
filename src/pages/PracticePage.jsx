import { useState, useCallback, useRef, useEffect } from 'react';
import { QUIZ_BANK, LESSONS } from '../data/lessons';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { useToast } from '../components/Toast';

const TYPE_LABELS = {
  vocab:      { icon: '📝', title: 'Từ vựng',   desc: 'Ôn tập từ vựng đã học' },
  grammar:    { icon: '📖', title: 'Ngữ pháp',  desc: 'Kiểm tra kiến thức ngữ pháp' },
  listening:  { icon: '🎧', title: 'Nghe hiểu', desc: 'Luyện nghe và nhận diện từ' },
  sentences:  { icon: '✍️', title: 'Hoàn thành câu', desc: 'Dịch và điền vào chỗ trống' },
  dictation:  { icon: '🎙️', title: 'Nghe chép', desc: 'Nghe và viết lại từ tiếng Anh' },
  matching:   { icon: '🔗', title: 'Nối cặp',   desc: 'Nối từ tiếng Anh với tiếng Việt' },
  fillin:     { icon: '🔤', title: 'Điền từ',   desc: 'Điền từ còn thiếu vào câu' },
  reorder:    { icon: '🧩', title: 'Sắp xếp câu', desc: 'Sắp xếp các từ thành câu đúng' },
  mixed:      { icon: '🎲', title: 'Tổng hợp',  desc: 'Mix tất cả các loại câu hỏi' },
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Build dictation & matching data from LESSONS vocab ── */
function buildDictationQuestions(count = 10) {
  const allVocab = LESSONS.flatMap((l) => l.vocabulary);
  return shuffleArray(allVocab).slice(0, count).map((v) => ({
    word: v.word,
    meaning: v.meaning,
    phonetic: v.phonetic,
    example: v.example,
  }));
}

function buildMatchingRound() {
  const allVocab = LESSONS.flatMap((l) => l.vocabulary);
  const picked = shuffleArray(allVocab).slice(0, 6);
  return {
    english: shuffleArray(picked.map((v) => ({ word: v.word, id: v.word }))),
    vietnamese: shuffleArray(picked.map((v) => ({ meaning: v.meaning, id: v.word }))),
  };
}

/* ── Build fill-in-the-blank questions from vocab examples ── */
function buildFillInQuestions(count = 10) {
  const allVocab = LESSONS.flatMap((l) => l.vocabulary);
  return shuffleArray(allVocab).slice(0, count).map((v) => {
    // Replace the target word in the example with ___
    const regex = new RegExp(`\\b${v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const blanked = v.example.replace(regex, '______');
    return { sentence: blanked, answer: v.word, meaning: v.meaning, original: v.example };
  });
}

/* ── Build sentence reorder questions from vocab examples ── */
function buildReorderQuestions(count = 8) {
  const allVocab = LESSONS.flatMap((l) => l.vocabulary)
    .filter((v) => v.example.split(/\s+/).length >= 4); // need ≥4 words
  return shuffleArray(allVocab).slice(0, count).map((v) => {
    const words = v.example.replace(/[.!?]$/, '').split(/\s+/);
    return { correctOrder: words, shuffled: shuffleArray(words), meaning: v.meaning, original: v.example };
  });
}

export default function PracticePage() {
  const { addXP, incrementQuizzes } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();

  const [quizType, setQuizType] = useState(null);
  // Standard MCQ state
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Dictation state
  const [dictQuestions, setDictQuestions] = useState([]);
  const [dictIdx, setDictIdx] = useState(0);
  const [dictInput, setDictInput] = useState('');
  const [dictChecked, setDictChecked] = useState(null);
  const [dictScore, setDictScore] = useState(0);

  // Matching state
  const [matchData, setMatchData] = useState(null);
  const [matchRound, setMatchRound] = useState(0);
  const [matchSelected, setMatchSelected] = useState({ en: null, vi: null });
  const [matchPaired, setMatchPaired] = useState([]);
  const [matchWrong, setMatchWrong] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [matchTotal, setMatchTotal] = useState(3); // 3 rounds

  // Fill-in-the-blank state
  const [fillQuestions, setFillQuestions] = useState([]);
  const [fillIdx, setFillIdx] = useState(0);
  const [fillInput, setFillInput] = useState('');
  const [fillChecked, setFillChecked] = useState(null);
  const [fillScore, setFillScore] = useState(0);

  // Reorder state
  const [reorderQuestions, setReorderQuestions] = useState([]);
  const [reorderIdx, setReorderIdx] = useState(0);
  const [reorderSelected, setReorderSelected] = useState([]);
  const [reorderPool, setReorderPool] = useState([]);
  const [reorderChecked, setReorderChecked] = useState(null);
  const [reorderScore, setReorderScore] = useState(0);

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }, []);

  /* ── Start different quiz types ── */
  function startQuiz(type) {
    if (type === 'dictation') {
      setQuizType('dictation');
      setDictQuestions(buildDictationQuestions(10));
      setDictIdx(0);
      setDictInput('');
      setDictChecked(null);
      setDictScore(0);
      setFinished(false);
      return;
    }
    if (type === 'matching') {
      setQuizType('matching');
      setMatchData(buildMatchingRound());
      setMatchRound(0);
      setMatchSelected({ en: null, vi: null });
      setMatchPaired([]);
      setMatchWrong(false);
      setMatchScore(0);
      setMatchTotal(3);
      setFinished(false);
      return;
    }
    if (type === 'fillin') {
      const qs = buildFillInQuestions(10);
      setQuizType('fillin');
      setFillQuestions(qs);
      setFillIdx(0);
      setFillInput('');
      setFillChecked(null);
      setFillScore(0);
      setFinished(false);
      return;
    }
    if (type === 'reorder') {
      const qs = buildReorderQuestions(8);
      setQuizType('reorder');
      setReorderQuestions(qs);
      setReorderIdx(0);
      setReorderSelected([]);
      setReorderPool([...qs[0].shuffled]);
      setReorderChecked(null);
      setReorderScore(0);
      setFinished(false);
      return;
    }
    const bank = type === 'mixed'
      ? [...QUIZ_BANK.vocab, ...QUIZ_BANK.grammar, ...QUIZ_BANK.listening, ...QUIZ_BANK.sentences]
      : QUIZ_BANK[type] || [];
    const picked = shuffleArray(bank).slice(0, 10);
    setQuizType(type);
    setQuestions(picked);
    setQIndex(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
    setTimeLeft(30);
  }

  const NON_MCQ = ['dictation', 'matching', 'fillin', 'reorder'];
  /* ── MCQ Timer ── */
  useEffect(() => {
    if (quizType && !NON_MCQ.includes(quizType) && !finished && answered === null && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    if (timeLeft === 0 && quizType && !NON_MCQ.includes(quizType) && !finished && answered === null) {
      handleAnswer(-1);
    }
  }, [timeLeft, quizType, finished, answered]);

  function handleAnswer(idx) {
    if (answered !== null) return;
    setAnswered(idx);
    const q = questions[qIndex];
    if (idx === q.correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (qIndex + 1 < questions.length) {
        setQIndex((i) => i + 1);
        setAnswered(null);
        setTimeLeft(30);
      } else {
        const finalScore = idx === q.correct ? score + 1 : score;
        const isPerfect = finalScore === questions.length;
        const xp = finalScore * 10 + (isPerfect ? 20 : 0);
        addXP(xp);
        incrementQuizzes(isPerfect);
        onQuizComplete(quizType, finalScore, questions.length);
        addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
        setFinished(true);
        showToast(`+${xp} XP! +${finalScore * 2 + (isPerfect ? 15 : 0)} 🪙 ${isPerfect ? 'Hoàn hảo! 💯' : 'Tốt lắm! 🎉'}`, 'success');
      }
    }, 1000);
  }

  /* ── Dictation check ── */
  function checkDictation() {
    if (dictChecked !== null) return;
    const q = dictQuestions[dictIdx];
    const correct = dictInput.trim().toLowerCase() === q.word.toLowerCase();
    setDictChecked(correct);
    if (correct) setDictScore((s) => s + 1);
  }

  function nextDictation() {
    if (dictIdx + 1 < dictQuestions.length) {
      setDictIdx((i) => i + 1);
      setDictInput('');
      setDictChecked(null);
    } else {
      const finalScore = dictScore;
      const isPerfect = finalScore === dictQuestions.length;
      const xp = finalScore * 10 + (isPerfect ? 20 : 0);
      addXP(xp);
      incrementQuizzes(isPerfect);
      addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
      setFinished(true);
      setScore(finalScore);
      setQuestions(dictQuestions);
      showToast(`+${xp} XP! 🎉`, 'success');
    }
  }

  /* ── Fill-in-the-blank check ── */
  function checkFillIn() {
    if (fillChecked !== null) return;
    const q = fillQuestions[fillIdx];
    const correct = fillInput.trim().toLowerCase() === q.answer.toLowerCase();
    setFillChecked(correct);
    if (correct) setFillScore((s) => s + 1);
  }

  function nextFillIn() {
    if (fillIdx + 1 < fillQuestions.length) {
      setFillIdx((i) => i + 1);
      setFillInput('');
      setFillChecked(null);
    } else {
      const finalScore = fillScore;
      const isPerfect = finalScore === fillQuestions.length;
      const xp = finalScore * 10 + (isPerfect ? 20 : 0);
      addXP(xp);
      incrementQuizzes(isPerfect);
      addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
      setFinished(true);
      setScore(finalScore);
      showToast(`+${xp} XP! 🎉`, 'success');
    }
  }

  /* ── Reorder logic ── */
  function reorderTapWord(word, idx) {
    if (reorderChecked !== null) return;
    // Move from pool to selected
    const newPool = [...reorderPool];
    newPool.splice(idx, 1);
    setReorderPool(newPool);
    setReorderSelected((prev) => [...prev, word]);
  }

  function reorderUntapWord(idx) {
    if (reorderChecked !== null) return;
    const word = reorderSelected[idx];
    const newSelected = [...reorderSelected];
    newSelected.splice(idx, 1);
    setReorderSelected(newSelected);
    setReorderPool((prev) => [...prev, word]);
  }

  function checkReorder() {
    if (reorderChecked !== null) return;
    const q = reorderQuestions[reorderIdx];
    const correct = reorderSelected.join(' ') === q.correctOrder.join(' ');
    setReorderChecked(correct);
    if (correct) setReorderScore((s) => s + 1);
  }

  function nextReorder() {
    if (reorderIdx + 1 < reorderQuestions.length) {
      const nextQ = reorderQuestions[reorderIdx + 1];
      setReorderIdx((i) => i + 1);
      setReorderSelected([]);
      setReorderPool([...nextQ.shuffled]);
      setReorderChecked(null);
    } else {
      const finalScore = reorderScore;
      const isPerfect = finalScore === reorderQuestions.length;
      const xp = finalScore * 12 + (isPerfect ? 25 : 0);
      addXP(xp);
      incrementQuizzes(isPerfect);
      addCoins(finalScore * 3 + (isPerfect ? 20 : 0));
      setFinished(true);
      setScore(finalScore);
      showToast(`+${xp} XP! 🎉`, 'success');
    }
  }

  /* ── Matching logic ── */
  function handleMatchSelect(type, id) {
    const next = { ...matchSelected, [type]: id };
    setMatchSelected(next);

    // If both selected, check match
    if (next.en && next.vi) {
      if (next.en === next.vi) {
        // Correct pair
        setMatchPaired((prev) => [...prev, next.en]);
        setMatchScore((s) => s + 1);
        setMatchSelected({ en: null, vi: null });
        setMatchWrong(false);

        // Check if round complete (all 6 paired)
        const newPaired = [...matchPaired, next.en];
        if (newPaired.length === matchData.english.length) {
          setTimeout(() => {
            if (matchRound + 1 < matchTotal) {
              setMatchRound((r) => r + 1);
              setMatchData(buildMatchingRound());
              setMatchPaired([]);
              setMatchSelected({ en: null, vi: null });
            } else {
              const totalPairs = matchTotal * 6;
              const xp = matchScore * 3 + 6 * 3; // include current round
              addXP(xp);
              addCoins(Math.round(matchScore * 2));
              setFinished(true);
              setScore(matchScore + 6);
              showToast(`+${xp} XP! 🎉`, 'success');
            }
          }, 500);
        }
      } else {
        // Wrong pair
        setMatchWrong(true);
        setTimeout(() => {
          setMatchSelected({ en: null, vi: null });
          setMatchWrong(false);
        }, 600);
      }
    }
  }

  /* ══════════════════════════════════════════
     TYPE SELECTION
     ══════════════════════════════════════════ */
  if (!quizType) {
    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <h2 className="fw-bold">
            <i className="fas fa-pen text-cowdi me-2"></i>Luyện tập
          </h2>
          <p className="text-muted">Chọn loại bài tập để bắt đầu!</p>
        </div>

        <div className="row g-3 justify-content-center" style={{ maxWidth: 960, margin: '0 auto' }}>
          {Object.entries(TYPE_LABELS).map(([type, info]) => (
            <div className="col-6 col-md-4 col-lg-3" key={type}>
              <div
                className="card text-center card-hover shadow-sm h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => startQuiz(type)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && startQuiz(type)}
              >
                <div className="card-body py-4">
                  <div className="fs-1 mb-2">{info.icon}</div>
                  <h6 className="card-title fw-bold">{info.title}</h6>
                  <p className="card-text text-muted small mb-2">{info.desc}</p>
                  <span className="badge bg-light text-secondary">
                    {type === 'mixed' ? 'Ngẫu nhiên' : type === 'dictation' ? '10 từ' : type === 'matching' ? '3 vòng' : type === 'fillin' ? '10 câu' : type === 'reorder' ? '8 câu' : `${QUIZ_BANK[type]?.length ?? 0} câu`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     FINISHED (shared for all types)
     ══════════════════════════════════════════ */
  if (finished) {
    const total = quizType === 'dictation' ? dictQuestions.length
                : quizType === 'matching' ? matchTotal * 6
                : quizType === 'fillin' ? fillQuestions.length
                : quizType === 'reorder' ? reorderQuestions.length
                : questions.length;
    const finalScore = quizType === 'dictation' ? dictScore
                     : quizType === 'fillin' ? fillScore
                     : quizType === 'reorder' ? reorderScore
                     : score;
    const pct = Math.round((finalScore / total) * 100);
    const xpEarned = finalScore * 10 + (finalScore === total ? 20 : 0);
    return (
      <div className="text-center py-5 fade-in">
        <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="fw-bold mt-3">Kết quả luyện tập</h2>
        <p className="text-muted mb-1">{TYPE_LABELS[quizType]?.icon} {TYPE_LABELS[quizType]?.title}</p>
        <div className="display-4 fw-bold text-cowdi-primary my-3">{finalScore}/{total}</div>
        <p className="lead text-muted">
          {pct}% — {pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt!' : 'Cố gắng thêm nhé!'}
        </p>
        <div className="badge bg-warning text-dark fs-5 px-3 py-2 mb-4">+{xpEarned} XP</div>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <button className="btn btn-cowdi-primary" onClick={() => startQuiz(quizType)}>Làm lại</button>
          <button className="btn btn-outline-secondary" onClick={() => setQuizType(null)}>Chọn loại khác</button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     DICTATION MODE
     ══════════════════════════════════════════ */
  if (quizType === 'dictation') {
    const q = dictQuestions[dictIdx];
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>✕ Thoát</button>
          <span className="text-muted fw-bold">Từ {dictIdx + 1}/{dictQuestions.length}</span>
          <span className="badge bg-warning text-dark fs-6">⭐ {dictScore}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((dictIdx + 1) / dictQuestions.length) * 100}%` }}></div>
        </div>

        <div className="card shadow-sm mb-4 text-center">
          <div className="card-body py-4">
            <p className="text-muted mb-2">Nghe và viết lại từ tiếng Anh:</p>
            <button className="btn btn-cowdi-primary btn-lg mb-3" onClick={() => speakWord(q.word)}>
              🔊 Nghe phát âm
            </button>
            <p className="text-muted small mb-0">Gợi ý: {q.meaning}</p>
          </div>
        </div>

        <div className="mb-3">
          <input
            type="text"
            className={`form-control form-control-lg text-center fw-bold ${dictChecked === true ? 'border-success bg-success bg-opacity-10' : dictChecked === false ? 'border-danger bg-danger bg-opacity-10' : ''}`}
            placeholder="Gõ từ tiếng Anh..."
            value={dictInput}
            onChange={(e) => setDictInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { dictChecked === null ? checkDictation() : nextDictation(); } }}
            disabled={dictChecked !== null}
            autoFocus
          />
        </div>

        {dictChecked !== null && (
          <div className={`text-center mb-3 fw-bold fs-5 fade-in ${dictChecked ? 'text-success' : 'text-danger'}`}>
            {dictChecked ? '✅ Chính xác!' : `❌ Đáp án đúng: ${q.word}`}
          </div>
        )}

        <div className="text-center">
          {dictChecked === null ? (
            <button className="btn btn-cowdi-primary" onClick={checkDictation} disabled={!dictInput.trim()}>
              Kiểm tra
            </button>
          ) : (
            <button className="btn btn-cowdi-primary" onClick={nextDictation}>
              {dictIdx + 1 < dictQuestions.length ? 'Từ tiếp theo →' : 'Xem kết quả'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     MATCHING MODE
     ══════════════════════════════════════════ */
  if (quizType === 'matching') {
    return (
      <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>✕ Thoát</button>
          <span className="text-muted fw-bold">Vòng {matchRound + 1}/{matchTotal}</span>
          <span className="badge bg-warning text-dark fs-6">⭐ {matchScore}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((matchRound) / matchTotal) * 100}%` }}></div>
        </div>

        <p className="text-center text-muted mb-3">Chọn 1 từ tiếng Anh và 1 nghĩa tiếng Việt tương ứng</p>

        <div className="row g-3">
          {/* English column */}
          <div className="col-6">
            <h6 className="text-center fw-bold mb-2">🇬🇧 English</h6>
            <div className="d-flex flex-column gap-2">
              {matchData.english.map((item) => {
                const isPaired = matchPaired.includes(item.id);
                const isSelected = matchSelected.en === item.id;
                const isWrongFlash = matchWrong && isSelected;
                return (
                  <button
                    key={item.id}
                    className={`btn w-100 fw-bold ${isPaired ? 'btn-success disabled' : isWrongFlash ? 'btn-danger wrong-shake' : isSelected ? 'btn-cowdi-primary' : 'btn-outline-primary'}`}
                    onClick={() => !isPaired && handleMatchSelect('en', item.id)}
                    disabled={isPaired}
                  >
                    {isPaired ? '✅ ' : ''}{item.word}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Vietnamese column */}
          <div className="col-6">
            <h6 className="text-center fw-bold mb-2">🇻🇳 Tiếng Việt</h6>
            <div className="d-flex flex-column gap-2">
              {matchData.vietnamese.map((item) => {
                const isPaired = matchPaired.includes(item.id);
                const isSelected = matchSelected.vi === item.id;
                const isWrongFlash = matchWrong && isSelected;
                return (
                  <button
                    key={item.id}
                    className={`btn w-100 fw-bold ${isPaired ? 'btn-success disabled' : isWrongFlash ? 'btn-danger wrong-shake' : isSelected ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
                    onClick={() => !isPaired && handleMatchSelect('vi', item.id)}
                    disabled={isPaired}
                  >
                    {isPaired ? '✅ ' : ''}{item.meaning}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     FILL-IN-THE-BLANK MODE
     ══════════════════════════════════════════ */
  if (quizType === 'fillin') {
    const q = fillQuestions[fillIdx];
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>✕ Thoát</button>
          <span className="text-muted fw-bold">Câu {fillIdx + 1}/{fillQuestions.length}</span>
          <span className="badge bg-warning text-dark fs-6">⭐ {fillScore}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((fillIdx + 1) / fillQuestions.length) * 100}%` }}></div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-body py-4 text-center">
            <p className="text-muted mb-2">Điền từ còn thiếu vào câu:</p>
            <p className="fs-5 fw-bold mb-2">{q.sentence}</p>
            <p className="text-muted small mb-0">💡 Nghĩa: {q.meaning}</p>
          </div>
        </div>

        <div className="mb-3">
          <input
            type="text"
            className={`form-control form-control-lg text-center fw-bold ${fillChecked === true ? 'border-success bg-success bg-opacity-10' : fillChecked === false ? 'border-danger bg-danger bg-opacity-10' : ''}`}
            placeholder="Gõ từ còn thiếu..."
            value={fillInput}
            onChange={(e) => setFillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { fillChecked === null ? checkFillIn() : nextFillIn(); } }}
            disabled={fillChecked !== null}
            autoFocus
          />
        </div>

        {fillChecked !== null && (
          <div className={`text-center mb-3 fw-bold fs-5 fade-in ${fillChecked ? 'text-success' : 'text-danger'}`}>
            {fillChecked ? '✅ Chính xác!' : `❌ Đáp án: ${q.answer}`}
            {!fillChecked && <p className="text-muted small mt-1">{q.original}</p>}
          </div>
        )}

        <div className="text-center">
          {fillChecked === null ? (
            <button className="btn btn-cowdi-primary" onClick={checkFillIn} disabled={!fillInput.trim()}>Kiểm tra</button>
          ) : (
            <button className="btn btn-cowdi-primary" onClick={nextFillIn}>
              {fillIdx + 1 < fillQuestions.length ? 'Câu tiếp theo →' : 'Xem kết quả'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     SENTENCE REORDER MODE
     ══════════════════════════════════════════ */
  if (quizType === 'reorder') {
    const q = reorderQuestions[reorderIdx];
    return (
      <div className="fade-in" style={{ maxWidth: 650, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>✕ Thoát</button>
          <span className="text-muted fw-bold">Câu {reorderIdx + 1}/{reorderQuestions.length}</span>
          <span className="badge bg-warning text-dark fs-6">⭐ {reorderScore}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((reorderIdx + 1) / reorderQuestions.length) * 100}%` }}></div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-body text-center">
            <p className="text-muted mb-1">Sắp xếp các từ thành câu đúng:</p>
            <p className="text-muted small mb-0">💡 Nghĩa: {q.meaning}</p>
          </div>
        </div>

        {/* Selected words (answer area) */}
        <div className="card mb-3" style={{ minHeight: 56 }}>
          <div className="card-body d-flex flex-wrap gap-2 justify-content-center py-3">
            {reorderSelected.length === 0 && <span className="text-muted small">Nhấn vào các từ bên dưới để sắp xếp</span>}
            {reorderSelected.map((w, i) => (
              <button
                key={i}
                className={`btn btn-sm fw-bold ${reorderChecked === true ? 'btn-success' : reorderChecked === false ? 'btn-danger' : 'btn-cowdi-primary'}`}
                onClick={() => reorderUntapWord(i)}
                disabled={reorderChecked !== null}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Word pool */}
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
          {reorderPool.map((w, i) => (
            <button
              key={i}
              className="btn btn-sm btn-outline-primary fw-bold"
              onClick={() => reorderTapWord(w, i)}
              disabled={reorderChecked !== null}
            >
              {w}
            </button>
          ))}
        </div>

        {reorderChecked !== null && (
          <div className={`text-center mb-3 fw-bold fs-6 fade-in ${reorderChecked ? 'text-success' : 'text-danger'}`}>
            {reorderChecked ? '✅ Chính xác!' : `❌ Đáp án: ${q.correctOrder.join(' ')}`}
          </div>
        )}

        <div className="text-center">
          {reorderChecked === null ? (
            <button className="btn btn-cowdi-primary" onClick={checkReorder} disabled={reorderPool.length > 0}>Kiểm tra</button>
          ) : (
            <button className="btn btn-cowdi-primary" onClick={nextReorder}>
              {reorderIdx + 1 < reorderQuestions.length ? 'Câu tiếp theo →' : 'Xem kết quả'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     MCQ Quiz in progress (vocab/grammar/listening/sentences/mixed)
     ══════════════════════════════════════════ */
  const q = questions[qIndex];
  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>
          ✕ Thoát
        </button>
        <span className="text-muted">Câu {qIndex + 1}/{questions.length}</span>
        <span className={`badge fs-6 ${timeLeft <= 10 ? 'bg-danger' : 'bg-secondary'}`}>
          ⏱ {timeLeft}s
        </span>
        <span className="badge bg-warning text-dark fs-6">Điểm: {score}</span>
      </div>

      <div className="progress mb-4" style={{ height: '8px' }}>
        <div
          className="progress-bar progress-bar-cowdi"
          role="progressbar"
          style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {q.speak && (
        <div className="text-center mb-3">
          <button className="btn btn-cowdi-primary" onClick={() => speakWord(q.speak)}>
            🔊 Nghe phát âm
          </button>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <p className="fs-5 fw-bold mb-0">{q.question}</p>
        </div>
      </div>

      <div className="row g-2">
        {q.options.map((opt, i) => {
          let cls = 'btn w-100 quiz-option-btn';
          if (answered !== null) {
            cls += i === q.correct ? ' btn-success' : i === answered ? ' btn-danger' : ' btn-outline-secondary';
          } else {
            cls += ' btn-outline-primary';
          }
          return (
            <div className="col-12 col-md-6" key={i}>
              <button className={cls} onClick={() => handleAnswer(i)} disabled={answered !== null}>
                {opt}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

