import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { LESSONS } from '../data/lessons';
import { usePet } from '../hooks/usePet';
import { useUser } from '../hooks/useUser';
import { useToast } from '../components/Toast';

const GAMES = [
  { id: 'word-catch', icon: '🎯', title: 'Cowdi Bắt Từ', desc: 'Chọn nghĩa đúng cho từ rơi xuống!' },
  { id: 'sentence-puzzle', icon: '🧩', title: 'Ghép câu', desc: 'Sắp xếp từ thành câu đúng!' },
];

export default function MiniGamePage() {
  const [game, setGame] = useState(null);

  if (!game) {
    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <h2 className="fw-bold">🎮 Mini Games</h2>
          <p className="text-muted">Chơi game vui mà vẫn học tiếng Anh!</p>
        </div>
        <div className="row g-3 justify-content-center" style={{ maxWidth: 600, margin: '0 auto' }}>
          {GAMES.map((g) => (
            <div className="col-6" key={g.id}>
              <div className="card text-center card-hover shadow-sm h-100" style={{ cursor: 'pointer' }}
                onClick={() => setGame(g.id)} role="button">
                <div className="card-body py-4">
                  <div className="fs-1 mb-2">{g.icon}</div>
                  <h5 className="card-title fw-bold">{g.title}</h5>
                  <p className="card-text text-muted small">{g.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => setGame(null)}>
        ← Quay lại
      </button>
      {game === 'word-catch' && <WordCatchGame />}
      {game === 'sentence-puzzle' && <SentencePuzzleGame />}
    </div>
  );
}

// ── Word Catch Game ──────────────────────────────────────────────────────────
function WordCatchGame() {
  const allWords = useMemo(() => LESSONS.flatMap((l) => l.vocabulary), []);
  const { addXP } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [total] = useState(10);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const generateRound = useCallback(() => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    const word = shuffled[0];
    const wrongOptions = shuffled.slice(1, 4).map((w) => w.meaning);
    const allOptions = [...wrongOptions, word.meaning].sort(() => Math.random() - 0.5);
    setCurrent(word);
    setOptions(allOptions);
    setAnswered(null);
    setTimeLeft(8);
  }, [allWords]);

  useEffect(() => { generateRound(); }, []);

  useEffect(() => {
    if (finished || answered !== null || !current) return;
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    // Time out
    setAnswered(-1);
    setTimeout(() => nextRound(), 1200);
  }, [timeLeft, finished, answered, current]);

  function handleAnswer(meaning) {
    if (answered !== null) return;
    const correct = meaning === current.meaning;
    setAnswered(meaning);
    if (correct) setScore((s) => s + 1);
    setTimeout(() => nextRound(), 1000);
  }

  function nextRound() {
    if (round + 1 >= total) {
      setFinished(true);
      const xp = score * 5;
      addXP(xp);
      onQuizComplete('vocab', score, total);
      if (score >= 8) addCoins(15);
      showToast(`+${xp} XP! ${score >= 8 ? '+15🪙' : ''} 🎮`, 'success');
    } else {
      setRound((r) => r + 1);
      generateRound();
    }
  }

  if (finished) {
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '4rem' }}>{score >= 8 ? '🏆' : score >= 5 ? '👍' : '💪'}</div>
        <h3 className="fw-bold mt-2">Kết quả: {score}/{total}</h3>
        <div className="badge bg-warning text-dark fs-5 my-2">+{score * 5} XP</div>
        <div>
          <button className="btn btn-cowdi-primary mt-3" onClick={() => { setRound(0); setScore(0); setFinished(false); generateRound(); }}>
            Chơi lại
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted small">Câu {round + 1}/{total}</span>
        <span className="badge bg-warning text-dark">Điểm: {score}</span>
        <span className={`badge ${timeLeft <= 3 ? 'bg-danger' : 'bg-secondary'}`}>⏱ {timeLeft}s</span>
      </div>

      <div className="progress mb-3" style={{ height: 6 }}>
        <div className="progress-bar progress-bar-cowdi" style={{ width: `${((round + 1) / total) * 100}%` }}></div>
      </div>

      {/* Falling word */}
      <div className="card shadow-sm mb-4 text-center" style={{ animation: 'wordFall 0.5s ease-out' }}>
        <div className="card-body py-4">
          <div className="fs-3 fw-bold text-cowdi-primary">{current.word}</div>
          <div className="text-muted small">{current.phonetic}</div>
        </div>
      </div>

      {/* Options */}
      <div className="row g-2">
        {options.map((opt, i) => {
          let cls = 'btn w-100 fw-bold';
          if (answered !== null) {
            cls += opt === current.meaning ? ' btn-success' : opt === answered ? ' btn-danger' : ' btn-outline-secondary';
          } else {
            cls += ' btn-outline-primary';
          }
          return (
            <div className="col-6" key={i}>
              <button className={cls} onClick={() => handleAnswer(opt)} disabled={answered !== null}>
                {opt}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sentence Puzzle Game ─────────────────────────────────────────────────────
function SentencePuzzleGame() {
  const allSentences = useMemo(() => {
    const sentences = [];
    for (const lesson of LESSONS) {
      for (const g of lesson.grammar) {
        for (const ex of g.examples) {
          if (ex.en.split(' ').length >= 3 && ex.en.split(' ').length <= 8) {
            sentences.push({ en: ex.en.replace(/[.!?]$/, ''), vi: ex.vi });
          }
        }
      }
    }
    return sentences;
  }, []);

  const { addXP } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [total] = useState(8);
  const [current, setCurrent] = useState(null);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [finished, setFinished] = useState(false);

  const generateRound = useCallback(() => {
    const shuffled = [...allSentences].sort(() => Math.random() - 0.5);
    const sentence = shuffled[0];
    const words = sentence.en.split(' ');
    const mixed = [...words].sort(() => Math.random() - 0.5);
    setCurrent(sentence);
    setShuffledWords(mixed.map((w, i) => ({ word: w, id: `${w}_${i}` })));
    setSelected([]);
    setResult(null);
  }, [allSentences]);

  useEffect(() => { if (allSentences.length > 0) generateRound(); }, [allSentences]);

  function toggleWord(wordObj) {
    if (result !== null) return;
    if (selected.find((s) => s.id === wordObj.id)) {
      setSelected(selected.filter((s) => s.id !== wordObj.id));
    } else {
      setSelected([...selected, wordObj]);
    }
  }

  function checkAnswer() {
    const answer = selected.map((s) => s.word).join(' ');
    const correct = answer === current.en;
    setResult(correct);
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (round + 1 >= total) {
        setFinished(true);
        const xp = score * 8;
        addXP(xp);
        onQuizComplete('sentences', correct ? score + 1 : score, total);
        if (score >= 6) addCoins(15);
        showToast(`+${xp} XP! 🧩`, 'success');
      } else {
        setRound((r) => r + 1);
        generateRound();
      }
    }, 1500);
  }

  if (finished) {
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '4rem' }}>{score >= 6 ? '🏆' : score >= 4 ? '👍' : '💪'}</div>
        <h3 className="fw-bold mt-2">Kết quả: {score}/{total}</h3>
        <div className="badge bg-warning text-dark fs-5 my-2">+{score * 8} XP</div>
        <div>
          <button className="btn btn-cowdi-primary mt-3" onClick={() => { setRound(0); setScore(0); setFinished(false); generateRound(); }}>
            Chơi lại
          </button>
        </div>
      </div>
    );
  }

  if (!current) return <div className="text-center text-muted">Đang tải...</div>;

  const remaining = shuffledWords.filter((w) => !selected.find((s) => s.id === w.id));

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted small">Câu {round + 1}/{total}</span>
        <span className="badge bg-warning text-dark">Điểm: {score}</span>
      </div>

      <div className="progress mb-3" style={{ height: 6 }}>
        <div className="progress-bar progress-bar-cowdi" style={{ width: `${((round + 1) / total) * 100}%` }}></div>
      </div>

      {/* Vietnamese hint */}
      <div className="card shadow-sm mb-3">
        <div className="card-body text-center py-3">
          <div className="text-muted small">Dịch câu này sang tiếng Anh:</div>
          <div className="fs-5 fw-bold">{current.vi}</div>
        </div>
      </div>

      {/* Answer area */}
      <div className="card shadow-sm mb-3" style={{ minHeight: 60 }}>
        <div className="card-body d-flex gap-2 flex-wrap py-2">
          {selected.length === 0 ? (
            <span className="text-muted small">Nhấn vào các từ bên dưới để ghép câu...</span>
          ) : (
            selected.map((s) => (
              <button key={s.id}
                className={`btn btn-sm ${result === true ? 'btn-success' : result === false ? 'btn-danger' : 'btn-cowdi-primary'}`}
                onClick={() => toggleWord(s)}>
                {s.word}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Word bank */}
      <div className="d-flex gap-2 flex-wrap mb-3 justify-content-center">
        {remaining.map((w) => (
          <button key={w.id} className="btn btn-sm btn-outline-secondary" onClick={() => toggleWord(w)}>
            {w.word}
          </button>
        ))}
      </div>

      {result !== null && (
        <div className={`text-center fw-bold mb-3 ${result ? 'text-success' : 'text-danger'}`}>
          {result ? '✅ Chính xác!' : `❌ Đáp án: ${current.en}`}
        </div>
      )}

      {/* Check button */}
      {result === null && selected.length > 0 && (
        <div className="text-center">
          <button className="btn btn-cowdi-primary" onClick={checkAnswer}>
            ✓ Kiểm tra
          </button>
        </div>
      )}
    </div>
  );
}
