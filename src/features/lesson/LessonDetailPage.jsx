import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LESSONS } from '../../data/lessons';
import { EXAM_LESSONS } from '../../data/lessons';

const ALL_LESSONS = [...LESSONS, ...EXAM_LESSONS];
import { useUser } from '../../hooks/useUser';
import { usePet } from '../../hooks/usePet';
import { useToast } from '../../components/layout/Toast';
import { useSound } from '../../hooks/useSound';

/* ── Tiny helpers ────────────────────────────────── */

/* ── Text similarity scoring (word-level) ── */
function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function scorePronunciation(expected, spoken) {
  const expWords = normalizeText(expected).split(' ');
  const spkWords = normalizeText(spoken).split(' ');
  if (!expWords.length || !spkWords.length) return { score: 0, matched: [], missed: [], extra: [] };

  const matched = [];
  const missed = [];
  const usedSpk = new Set();

  for (const ew of expWords) {
    let found = false;
    for (let i = 0; i < spkWords.length; i++) {
      if (!usedSpk.has(i) && spkWords[i] === ew) {
        matched.push(ew);
        usedSpk.add(i);
        found = true;
        break;
      }
    }
    // Fuzzy: allow 1-char diff for words >= 4 chars
    if (!found) {
      for (let i = 0; i < spkWords.length; i++) {
        if (!usedSpk.has(i) && ew.length >= 4 && levenshtein(ew, spkWords[i]) <= 1) {
          matched.push(ew);
          usedSpk.add(i);
          found = true;
          break;
        }
      }
    }
    if (!found) missed.push(ew);
  }

  const extra = spkWords.filter((_, i) => !usedSpk.has(i));
  const score = Math.round((matched.length / expWords.length) * 100);
  return { score, matched, missed, extra };
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function getScoreLabel(score) {
  if (score >= 90) return { text: 'Xuất sắc! 🌟', color: '#00B894', icon: '🌟' };
  if (score >= 70) return { text: 'Tốt lắm! 👍', color: '#00B894', icon: '👍' };
  if (score >= 50) return { text: 'Khá ổn! 💪', color: '#FDCB6E', icon: '💪' };
  if (score >= 30) return { text: 'Cố thêm! 📖', color: '#E17055', icon: '📖' };
  return { text: 'Thử lại nhé! 🔄', color: '#D63031', icon: '🔄' };
}

const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate random quiz questions from lesson vocabulary & grammar.
 * Returns 10 questions (or fewer if lesson is small).
 * Question types: word→meaning, meaning→word, example fill-in, grammar.
 */
function generateQuizFromLesson(lesson) {
  const vocab = lesson.vocabulary || [];
  const questions = [];

  // Type 1: Word → Meaning (from vocab)
  for (const v of vocab) {
    const distractors = shuffleArray(vocab.filter((w) => w.word !== v.word))
      .slice(0, 3)
      .map((w) => w.meaning);
    if (distractors.length < 3) continue;
    const options = shuffleArray([v.meaning, ...distractors]);
    questions.push({
      question: `"${v.word}" nghĩa là:`,
      options,
      correct: options.indexOf(v.meaning),
      _type: 'word2meaning',
    });
  }

  // Type 2: Meaning → Word (from vocab)
  for (const v of vocab) {
    const distractors = shuffleArray(vocab.filter((w) => w.word !== v.word))
      .slice(0, 3)
      .map((w) => w.word);
    if (distractors.length < 3) continue;
    const options = shuffleArray([v.word, ...distractors]);
    questions.push({
      question: `Từ nào có nghĩa "${v.meaning}"?`,
      options,
      correct: options.indexOf(v.word),
      _type: 'meaning2word',
    });
  }

  // Type 3: Grammar questions from lesson.grammar examples
  if (lesson.grammar) {
    for (const g of lesson.grammar) {
      for (const ex of g.examples) {
        // Try to create a fill-in-blank from the English sentence
        const words = ex.en.split(/\s+/);
        if (words.length >= 4) {
          // Pick a meaningful word to blank out (skip first/last, skip short words)
          const candidates = words
            .map((w, i) => ({ w: w.replace(/[.,!?;:'"]/g, ''), i }))
            .filter((c) => c.i > 0 && c.i < words.length - 1 && c.w.length >= 3);
          if (candidates.length > 0) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            const blank = words.map((w, i) => (i === pick.i ? '___' : w)).join(' ');
            const otherWords = shuffleArray(
              words.filter((_, i) => i !== pick.i && _.replace(/[.,!?;:'"]/g, '').length >= 3)
            ).slice(0, 2);
            // Add a random vocab word as distractor
            const vocabDistractor = vocab.length > 0
              ? vocab[Math.floor(Math.random() * vocab.length)].word.toLowerCase()
              : 'something';
            const distractors = [...new Set([...otherWords.map((w) => w.replace(/[.,!?;:'"]/g, '')), vocabDistractor])]
              .filter((d) => d.toLowerCase() !== pick.w.toLowerCase())
              .slice(0, 3);
            if (distractors.length >= 3) {
              const options = shuffleArray([pick.w, ...distractors.slice(0, 3)]);
              questions.push({
                question: `Điền vào chỗ trống: "${blank}"`,
                options,
                correct: options.indexOf(pick.w),
                _type: 'grammar',
              });
            }
          }
        }
      }
    }
  }

  // Also include original quiz questions (shuffled)
  if (lesson.quiz) {
    for (const q of lesson.quiz) {
      questions.push({ ...q, _type: 'original' });
    }
  }

  // Shuffle all and pick up to 10, ensuring variety
  const byType = {};
  for (const q of shuffleArray(questions)) {
    const t = q._type;
    if (!byType[t]) byType[t] = [];
    byType[t].push(q);
  }

  const selected = [];
  const maxPerType = { word2meaning: 4, meaning2word: 3, grammar: 2, original: 3 };
  for (const [type, qs] of Object.entries(byType)) {
    const limit = maxPerType[type] || 3;
    selected.push(...qs.slice(0, limit));
  }

  // If not enough, fill from remaining
  const selectedSet = new Set(selected);
  for (const q of shuffleArray(questions)) {
    if (selected.length >= 10) break;
    if (!selectedSet.has(q)) {
      selected.push(q);
      selectedSet.add(q);
    }
  }

  return shuffleArray(selected).slice(0, Math.max(10, (lesson.quiz || []).length));
}

/** Spawn emoji confetti particles */
function spawnConfetti(containerRef) {
  if (!containerRef.current) return;
  const emojis = ['🎉', '⭐', '🌟', '✨', '🐮', '💯', '🎊'];
  for (let i = 0; i < 18; i++) {
    const span = document.createElement('span');
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.className = 'confetti-particle';
    span.style.left = `${Math.random() * 100}%`;
    span.style.animationDelay = `${Math.random() * 0.5}s`;
    span.style.fontSize = `${1 + Math.random() * 1.2}rem`;
    containerRef.current.appendChild(span);
    setTimeout(() => span.remove(), 1800);
  }
}

/* ── Component ───────────────────────────────────── */

/**
 * ReadingPassage — hiển thị đoạn văn vận dụng từ đã học.
 * — Các từ trong `highlights` được in đậm/đổi màu, click để xem nghĩa & phát âm.
 * — Có nút đọc to toàn bộ đoạn, nút bật/tắt phần dịch.
 * — Có mini-quiz hiểu bài (tuỳ chọn).
 */
function ReadingPassage({ lesson, onSpeak, onSpeakSlow, addXP, showToast, play }) {
  const reading = lesson.reading;
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeWord, setActiveWord] = useState(null); // vocab object
  const [answers, setAnswers] = useState({}); // { qIdx: optIdx }
  const [submitted, setSubmitted] = useState(false);
  const [rewarded, setRewarded] = useState(false);

  if (!reading || !reading.passage) {
    return (
      <div className="alert alert-light text-center">
        <div style={{ fontSize: '2rem' }}>📭</div>
        <div className="fw-bold mt-2">Bài học này chưa có đoạn văn luyện tập.</div>
      </div>
    );
  }

  // Map nhanh word → vocab object (không phân biệt hoa/thường)
  const vocabMap = {};
  for (const v of (lesson.vocabulary || [])) {
    vocabMap[v.word.toLowerCase()] = v;
  }
  const highlightSet = new Set(reading.highlights.map((w) => w.toLowerCase()));

  // Tách đoạn văn thành token (word, whitespace, punctuation) để render
  const tokens = reading.passage.match(/[A-Za-zÀ-ỹ']+|\s+|[^\sA-Za-zÀ-ỹ']/g) || [];

  const handleWordClick = (raw) => {
    const v = vocabMap[raw.toLowerCase()];
    if (!v) return;
    setActiveWord(v);
    onSpeak(v.word);
  };

  const submitQuiz = () => {
    if (submitted) return;
    setSubmitted(true);
    const total = reading.questions.length;
    let correct = 0;
    for (let i = 0; i < total; i++) {
      if (answers[i] === reading.questions[i].correct) correct++;
    }
    const pct = total ? Math.round((correct / total) * 100) : 0;
    if (correct === total && !rewarded) {
      addXP?.(15);
      setRewarded(true);
      play?.('correct');
      showToast?.(`🎉 Trả lời đúng tất cả! +15 XP`, 'success');
    } else if (pct >= 50) {
      addXP?.(5);
      play?.('click');
      showToast?.(`Đúng ${correct}/${total}. +5 XP`, 'info');
    } else {
      play?.('wrong');
      showToast?.(`Đúng ${correct}/${total}. Đọc lại đoạn văn nhé!`, 'warning');
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div className="card shadow-sm mb-3 bg-cowdi-gradient text-white">
        <div className="card-body py-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div style={{ fontSize: '2.2rem' }}>📚</div>
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-1">{reading.title}</h5>
              <small className="opacity-75">
                Vận dụng {reading.highlights.length} từ đã học · Click vào từ in đậm để xem nghĩa
                {reading.autoGenerated && ' · (đoạn ghép từ ví dụ)'}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button className="btn btn-sm btn-cowdi-primary" onClick={() => onSpeak(reading.passage)}>
          🔊 Nghe toàn bộ
        </button>
        <button className="btn btn-sm btn-outline-cowdi" onClick={() => onSpeakSlow(reading.passage)}>
          🐌 Nghe chậm
        </button>
        {reading.translation && (
          <button
            className={`btn btn-sm ${showTranslation ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={() => setShowTranslation((v) => !v)}
          >
            {showTranslation ? '🙈 Ẩn dịch' : '🇻🇳 Xem dịch'}
          </button>
        )}
      </div>

      {/* Passage */}
      <div className="card shadow-sm mb-3">
        <div className="card-body" style={{ lineHeight: 1.9, fontSize: '1.08rem' }}>
          {tokens.map((tok, i) => {
            const lower = tok.toLowerCase();
            if (highlightSet.has(lower)) {
              return (
                <span
                  key={i}
                  role="button"
                  onClick={() => handleWordClick(tok)}
                  className="fw-bold text-cowdi-primary"
                  style={{
                    cursor: 'pointer',
                    borderBottom: '2px dotted currentColor',
                    padding: '0 2px',
                  }}
                  title="Click để xem nghĩa"
                >
                  {tok}
                </span>
              );
            }
            return <span key={i}>{tok}</span>;
          })}
        </div>
      </div>

      {/* Active word popup */}
      {activeWord && (
        <div className="card shadow-sm border-warning mb-3">
          <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div style={{ fontSize: '2rem' }}>{activeWord.illustration || '📖'}</div>
            <div className="flex-grow-1">
              <div className="fw-bold fs-5">
                {activeWord.word}{' '}
                <small className="text-muted fw-normal">{activeWord.phonetic}</small>
              </div>
              <div className="text-cowdi-primary">→ {activeWord.meaning}</div>
              {activeWord.example && (
                <div className="small fst-italic text-muted mt-1">“{activeWord.example}”</div>
              )}
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => onSpeak(activeWord.word)}>
              🔊
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => setActiveWord(null)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Translation */}
      {showTranslation && reading.translation && (
        <div className="alert alert-light border">
          <div className="fw-bold text-muted small mb-1">🇻🇳 Dịch nghĩa</div>
          <div>{reading.translation}</div>
        </div>
      )}

      {/* Comprehension quiz */}
      {reading.questions && reading.questions.length > 0 && (
        <div className="card shadow-sm mt-3">
          <div className="card-body">
            <h6 className="fw-bold text-cowdi-primary mb-3">
              ❓ Câu hỏi hiểu bài ({reading.questions.length})
            </h6>
            {reading.questions.map((q, qi) => (
              <div key={qi} className="mb-3">
                <div className="fw-bold mb-2">{qi + 1}. {q.question}</div>
                <div className="d-flex flex-column gap-2">
                  {q.options.map((opt, oi) => {
                    const picked = answers[qi] === oi;
                    const isCorrect = oi === q.correct;
                    let cls = 'btn text-start';
                    if (submitted) {
                      if (isCorrect) cls += ' btn-success';
                      else if (picked) cls += ' btn-danger';
                      else cls += ' btn-outline-secondary';
                    } else {
                      cls += picked ? ' btn-cowdi-primary' : ' btn-outline-secondary';
                    }
                    return (
                      <button
                        key={oi}
                        type="button"
                        className={cls}
                        disabled={submitted}
                        onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="d-flex gap-2 mt-3">
              {!submitted ? (
                <button
                  className="btn btn-cowdi-primary"
                  disabled={Object.keys(answers).length < reading.questions.length}
                  onClick={submitQuiz}
                >
                  ✅ Nộp bài
                </button>
              ) : (
                <button className="btn btn-outline-cowdi" onClick={resetQuiz}>
                  🔄 Làm lại
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LessonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData, addXP, addSkillXP, markLessonCompleted, incrementQuizzes, setWordStatus, getWordStatus } = useUser();
  const { onLessonComplete, addCoins } = usePet();
  const showToast = useToast();
  const { play } = useSound();
  const lesson = ALL_LESSONS.find((l) => l.id === id);

  const confettiRef = useRef(null);

  // Tabs: vocab, flashcard, grammar, speak, quiz
  const [tab, setTab] = useState('vocab');
  const [quizMode, setQuizMode] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);
  const [correctAnim, setCorrectAnim] = useState(false);
  const [wrongAnim, setWrongAnim] = useState(false);

  // Flashcard state
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [fcMastered, setFcMastered] = useState(new Set());

  // Generated quiz questions (randomized each attempt)
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Speak-along state
  const [speakIdx, setSpeakIdx] = useState(0);
  const [speakPlaying, setSpeakPlaying] = useState(false);
  const [speakScores, setSpeakScores] = useState({}); // { [idx]: score 0..100 }
  const [speakDone, setSpeakDone] = useState(false);
  const speakAwardedRef = useRef(false);

  // Listen-sentence state (MCQ: nghe câu → chọn nghĩa)
  const [listenIdx, setListenIdx] = useState(0);
  const [listenPicked, setListenPicked] = useState(null);
  const [listenScore, setListenScore] = useState(0);
  const [listenQs, setListenQs] = useState([]);
  const [listenDone, setListenDone] = useState(false);

  // Speech recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speakResult, setSpeakResult] = useState(null); // { score, matched, missed }
  const [recError, setRecError] = useState('');
  const recognitionRef = useRef(null);

  const startRecording = useCallback((expectedText, idx) => {
    if (!SpeechRecognitionAPI) {
      setRecError('Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome hoặc Edge.');
      return;
    }
    // Stop any ongoing TTS
    if ('speechSynthesis' in window) speechSynthesis.cancel();

    setTranscript('');
    setSpeakResult(null);
    setRecError('');
    setIsRecording(true);

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      setTranscript(last[0].transcript);
      if (last.isFinal) {
        const finalText = last[0].transcript;
        setTranscript(finalText);
        const result = scorePronunciation(expectedText, finalText);
        setSpeakResult(result);
        if (typeof idx === 'number') {
          setSpeakScores(prev => {
            const cur = prev[idx];
            // chỉ ghi điểm tốt hơn lần trước
            if (cur != null && cur >= result.score) return prev;
            return { ...prev, [idx]: result.score };
          });
        }
        setIsRecording(false);
        if (result.score >= 70) play('correct');
        else if (result.score >= 40) play('click');
        else play('wrong');
      }
    };
    recognition.onerror = (event) => {
      setIsRecording(false);
      if (event.error === 'no-speech') {
        setRecError('Không nghe thấy giọng nói. Hãy nói to hơn nhé!');
      } else if (event.error === 'not-allowed') {
        setRecError('Trình duyệt chưa cấp quyền microphone. Hãy cho phép truy cập micro.');
      } else {
        setRecError('Lỗi nhận diện giọng nói. Vui lòng thử lại.');
      }
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  }, [play]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const speakWord = useCallback((text, rate = 0.8, opts = {}) => {
    if (!('speechSynthesis' in window) || !text) return Promise.resolve();
    return new Promise((resolve) => {
      try {
        speechSynthesis.cancel();
        // Làm sạch: bỏ chú thích trong ngoặc, đổi ___ và / thành dấu phẩy
        const cleaned = String(text)
          .replace(/\s*[\(\[\{][^()\[\]{}]*[\)\]\}]/g, '')
          .replace(/_+/g, ', ')
          .replace(/\//g, ', ')
          .replace(/\s+/g, ' ')
          .trim();
        if (!cleaned) { resolve(); return; }

        // Nếu caller chỉ định lang → dùng luôn (1 utterance)
        if (opts.lang) {
          const u = new SpeechSynthesisUtterance(cleaned);
          u.lang = opts.lang;
          u.rate = rate;
          u.onend = () => resolve();
          u.onerror = () => resolve();
          speechSynthesis.speak(u);
          return;
        }

        // Tự động tách đoạn theo ngôn ngữ: tiếng Anh ↔ tiếng Việt
        const VN_RE = /[ăâđêôơưĂÂĐÊÔƠƯáàảãạÁÀẢÃẠắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/;
        // Tách theo cụm trong ngoặc kép "..." '...' hoặc theo dấu câu, giữ lại delimiter
        const parts = cleaned
          .split(/(["“”][^"“”]*["“”]|['‘’][^'‘’]*['‘’]|[.!?,;:—–]+\s*)/g)
          .filter((p) => p && p.length > 0);
        // Gom đoạn liền cùng ngôn ngữ
        const segs = [];
        for (const p of parts) {
          const lang = VN_RE.test(p) ? 'vi-VN' : 'en-US';
          if (segs.length && segs[segs.length - 1].lang === lang) {
            segs[segs.length - 1].text += p;
          } else {
            segs.push({ lang, text: p });
          }
        }
        // Lọc đoạn rỗng / chỉ có dấu câu / khoảng trắng
        const queue = segs
          .map((s) => ({ ...s, text: s.text.trim() }))
          .filter((s) => s.text && /[\p{L}\p{N}]/u.test(s.text));
        if (queue.length === 0) { resolve(); return; }

        const speakNext = (i) => {
          if (i >= queue.length) { resolve(); return; }
          const { lang, text: t } = queue[i];
          const u = new SpeechSynthesisUtterance(t);
          u.lang = lang;
          u.rate = rate;
          u.onend = () => speakNext(i + 1);
          u.onerror = () => speakNext(i + 1);
          speechSynthesis.speak(u);
        };
        speakNext(0);
      } catch {
        resolve();
      }
    });
  }, []);

  const speakSlow = useCallback((text) => speakWord(text, 0.55), [speakWord]);

  if (!lesson) {
    return (
      <div className="text-center py-5">
        <h2>Không tìm thấy bài học</h2>
        <button className="btn btn-cowdi-primary mt-3" onClick={() => navigate('/lessons')}>
          Quay lại
        </button>
      </div>
    );
  }

  const quiz = quizQuestions.length > 0 ? quizQuestions : (lesson.quiz || []);
  const vocab = lesson.vocabulary;

  /* ── speakAlong sentences: combine vocab examples + grammar examples ── */
  const speakSentences = [
    ...vocab.map((v) => ({ en: v.example, vi: v.meaning, label: v.word })),
    ...lesson.grammar.flatMap((g) => g.examples.map((ex) => ({ en: ex.en, vi: ex.vi, label: g.title }))),
  ].filter((s) => s.en && s.vi);

  /* ── Listen-sentence pool: chỉ dùng cặp câu en↔vi đầy đủ (không dùng vocab
       vì vocab.meaning là nghĩa của TỪ, không phải bản dịch của ví dụ). ── */
  const listenPool = (() => {
    const sentencePairs = lesson.grammar.flatMap((g) =>
      g.examples
        .filter((ex) => ex.en && ex.vi && ex.en.trim().split(/\s+/).length >= 2)
        .map((ex) => ({ en: ex.en, vi: ex.vi, label: g.title })),
    );
    const seen = new Set();
    const out = [];
    for (const s of sentencePairs) {
      const key = s.en.trim().toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push(s); }
    }
    return out;
  })();

  function buildLessonListenQuestions(count = 10) {
    if (listenPool.length === 0) return [];
    const shuffle = (a) => {
      const arr = [...a];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    const picked = shuffle(listenPool).slice(0, Math.min(count, listenPool.length));
    return picked.map((s) => {
      const others = listenPool.filter((x) => x.vi !== s.vi);
      const distractors = shuffle(others).slice(0, 3).map((x) => x.vi);
      // Đảm bảo đủ 4 lựa chọn — nếu không đủ thì lặp lại từ pool gốc
      while (distractors.length < 3 && listenPool.length > 1) {
        const extra = listenPool[Math.floor(Math.random() * listenPool.length)].vi;
        if (extra !== s.vi && !distractors.includes(extra)) distractors.push(extra);
        else if (distractors.length < 3) distractors.push('— (không có lựa chọn khác)');
      }
      const options = shuffle([s.vi, ...distractors]);
      return {
        sentence: s.en,
        meaning: s.vi,
        label: s.label,
        options,
        correct: options.indexOf(s.vi),
      };
    });
  }

  function startLessonListen() {
    const qs = buildLessonListenQuestions(Math.min(10, listenPool.length));
    setListenQs(qs);
    setListenIdx(0);
    setListenPicked(null);
    setListenScore(0);
    setListenDone(false);
  }

  function handleListenPick(i) {
    if (listenPicked !== null) return;
    setListenPicked(i);
    const q = listenQs[listenIdx];
    if (i === q.correct) {
      setListenScore((s) => s + 1);
      play('correct');
    } else {
      play('wrong');
    }
  }

  function handleListenNext() {
    if (listenIdx + 1 < listenQs.length) {
      setListenIdx((i) => i + 1);
      setListenPicked(null);
    } else {
      setListenDone(true);
      addXP(listenQs.length * 2);
      play('celebration');
      showToast(`Hoàn thành nghe câu! +${listenQs.length * 2} XP 🎧`, 'success');
    }
  }

  function finalizeSpeak() {
    if (speakAwardedRef.current) return;
    const scores = Object.values(speakScores);
    if (scores.length === 0) {
      showToast('Hãy đọc ít nhất 1 câu để nhận điểm nhé!', 'warning');
      return;
    }
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    // XP = avg% × số câu đã đọc × 0.2 (vd: avg 80%, 5 câu → 80 XP)
    const xp = Math.max(5, Math.round(avg * scores.length * 0.2));
    addXP(xp);
    addSkillXP('speaking', xp);
    speakAwardedRef.current = true;
    setSpeakDone(true);
    play('celebration');
    showToast(`🎤 Luyện nói hoàn tất! Trung bình ${avg}%. +${xp} XP, +${xp} điểm Speaking`, 'success');
  }

  function resetSpeak() {
    setSpeakIdx(0);
    setSpeakScores({});
    setSpeakDone(false);
    speakAwardedRef.current = false;
    setTranscript('');
    setSpeakResult(null);
    setRecError('');
  }

  /* Auto-play sentence khi sang câu mới (chỉ khi đang ở tab listen, đã start, chưa xong) */
  useEffect(() => {
    if (tab !== 'listen' || listenQs.length === 0 || listenDone) return;
    const q = listenQs[listenIdx];
    if (!q) return;
    const t = setTimeout(() => speakWord(q.sentence, 0.85), 300);
    return () => clearTimeout(t);
  }, [tab, listenIdx, listenQs, listenDone, speakWord]);

  /* 🔊 Auto-đọc câu hỏi quiz mỗi khi sang câu mới — giúp người học nghe nhiều hơn */
  useEffect(() => {
    if (!quizMode || finished) return;
    const q = quiz[qIndex];
    if (!q) return;
    const t = setTimeout(() => speakWord(q.question, 0.85), 250);
    return () => {
      clearTimeout(t);
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    };
  }, [quizMode, qIndex, finished, quiz, speakWord]);

  /* ── Quiz answer handler ── */
  async function handleAnswer(idx) {
    if (answered !== null) return;
    setAnswered(idx);
    const q = quiz[qIndex];
    const isCorrect = idx === q.correct;
    if (isCorrect) {
      setScore((s) => s + 1);
      setCorrectAnim(true);
      play('correct');
      setTimeout(() => setCorrectAnim(false), 700);
    } else {
      setWrongAnim(true);
      play('wrong');
      setTimeout(() => setWrongAnim(false), 500);
    }

    // 🔊 Khi trả lời ĐÚNG → đọc xác nhận đáp án (giọng tự detect EN/VN)
    //    rồi mới sang câu kế tiếp. Trả lời sai → giữ delay 1.2s như cũ.
    if (isCorrect) {
      // Chờ animation correct hiện ra rồi mới phát âm để không bị cắt
      await new Promise((r) => setTimeout(r, 350));
      await speakWord(q.options[q.correct], 0.85);
      // Pause ngắn cho dễ chịu
      await new Promise((r) => setTimeout(r, 300));
      goToNextQuestion(true);
    } else {
      setTimeout(() => goToNextQuestion(false), 1200);
    }
  }

  function goToNextQuestion(wasCorrect) {
    if (qIndex + 1 < quiz.length) {
      setQIndex((i) => i + 1);
      setAnswered(null);
    } else {
      setFinished(true);
      const finalScore = wasCorrect ? score + 1 : score;
      const isPerfect = finalScore === quiz.length;
      const xp = finalScore * 10;
      addXP(xp);
      markLessonCompleted(lesson.id);
      incrementQuizzes(isPerfect);
      onLessonComplete();
      addCoins(10);
      play('celebration');
      spawnConfetti(confettiRef);
      showToast(`+${xp} XP! +10 🪙 Bạn đã hoàn thành bài học! 🎉`, 'success');
    }
  }

  function restartQuiz() {
    setQuizQuestions(generateQuizFromLesson(lesson));
    setQIndex(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
    setCorrectAnim(false);
    setWrongAnim(false);
  }

  /* ── Flashcard helpers ── */
  function fcNext() {
    setFcFlipped(false);
    setTimeout(() => setFcIndex((i) => Math.min(i + 1, vocab.length - 1)), 200);
  }
  function fcPrev() {
    setFcFlipped(false);
    setTimeout(() => setFcIndex((i) => Math.max(i - 1, 0)), 200);
  }
  function fcToggleMastered(word) {
    setFcMastered((prev) => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
        setWordStatus(word, 'learning');
      } else {
        next.add(word);
        setWordStatus(word, 'learned');
        play('wordLearned');
      }
      return next;
    });
  }

  /* ══════════════════════════════════════════
     QUIZ RESULT SCREEN
     ══════════════════════════════════════════ */
  if (quizMode && finished) {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <div className="text-center py-5 fade-in position-relative" ref={confettiRef}>
        <div className={`quiz-result-icon ${pct >= 80 ? 'bounce-in' : ''}`} style={{ fontSize: '5rem' }}>
          {pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}
        </div>
        <h2 className="fw-bold mt-3">Kết quả</h2>
        <div className="display-4 fw-bold text-cowdi-primary my-3">{score}/{quiz.length}</div>
        <p className="lead text-muted">
          {pct}% — {pct >= 80 ? 'Xuất sắc! Cowdi rất tự hào! 🐮✨' : pct >= 50 ? 'Khá tốt! Cố thêm nhé! 🐮' : 'Cố gắng thêm nhé! Cowdi tin bạn! 🐮💪'}
        </p>
        {pct === 100 && <div className="badge bg-warning text-dark fs-6 mb-3">💯 PERFECT SCORE!</div>}
        <div className="d-flex gap-3 justify-content-center mt-4 flex-wrap">
          <button className="btn btn-cowdi-primary" onClick={restartQuiz}>🔄 Làm lại</button>
          <button className="btn btn-outline-secondary" onClick={() => setQuizMode(false)}>📚 Quay lại bài học</button>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/lessons')}>📋 Danh sách bài</button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     QUIZ IN PROGRESS
     ══════════════════════════════════════════ */
  if (quizMode) {
    const q = quiz[qIndex];
    return (
      <div className="fade-in position-relative" style={{ maxWidth: 680, margin: '0 auto' }} ref={confettiRef}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => { setQuizMode(false); restartQuiz(); }}>
            <i className="fas fa-arrow-left me-1"></i>Thoát
          </button>
          <span className="text-muted fw-bold">Câu {qIndex + 1}/{quiz.length}</span>
          <span className="badge bg-warning text-dark fs-6">⭐ {score}</span>
        </div>
        <div className="progress mb-4" style={{ height: '8px' }}>
          <div
            className="progress-bar progress-bar-cowdi"
            role="progressbar"
            style={{ width: `${((qIndex + 1) / quiz.length) * 100}%` }}
          ></div>
        </div>
        <div className={`card shadow-sm mb-4 ${correctAnim ? 'correct-flash' : ''} ${wrongAnim ? 'wrong-shake' : ''}`}>
          <div className="card-body py-4">
            <p className="fs-5 fw-bold mb-2 text-center">{q.question}</p>
            <div className="text-center">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => speakWord(q.question, 0.85)}
                title="Nghe lại câu hỏi"
              >
                🔊 Nghe lại
              </button>
            </div>
          </div>
        </div>
        <div className="row g-2" key={qIndex}>
          {q.options.map((opt, i) => {
            let cls = 'btn w-100 quiz-option-btn';
            if (answered !== null) {
              if (i === q.correct) cls += ' btn-success correct-pop';
              else if (i === answered) cls += ' btn-danger wrong-shake';
              else cls += ' btn-outline-secondary';
            } else {
              cls += ' btn-outline-primary';
            }
            return (
              <div className="col-12 col-md-6" key={`${qIndex}-${i}`}>
                <button className={cls} onClick={() => handleAnswer(i)} disabled={answered !== null}>
                  <span className="me-2 fw-bold text-muted">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              </div>
            );
          })}
        </div>
        {answered !== null && (
          <div className={`text-center mt-3 fw-bold fs-5 fade-in ${answered === q.correct ? 'text-success' : 'text-danger'}`}>
            {answered === q.correct ? '✅ Chính xác! Giỏi lắm!' : `❌ Đáp án đúng: ${q.options[q.correct]}`}
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════
     MAIN LESSON VIEW
     ══════════════════════════════════════════ */
  return (
    <div className="fade-in position-relative" ref={confettiRef}>
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className={`card-header-level ${lesson.level}`}></div>
        <div className="card-body">
          <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate('/lessons')}>
            <i className="fas fa-arrow-left me-1"></i>Quay lại
          </button>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span style={{ fontSize: '2.5rem' }}>{lesson.icon}</span>
            <div>
              <h2 className="fw-bold mb-1">{lesson.title}</h2>
              <p className="text-muted mb-1">{lesson.description}</p>
              <span className={`badge badge-level-${lesson.level}`}>{lesson.level === 'beginner' ? '🟢 Cơ bản' : lesson.level === 'intermediate' ? '🟡 Trung cấp' : '🔴 Nâng cao'}</span>
              {userData.completedLessons.includes(lesson.id) && (
                <span className="badge bg-success ms-2">✅ Đã hoàn thành</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'vocab', label: '📝 Từ vựng', variant: 'primary' },
          { key: 'flashcard', label: '🃏 Flashcard', variant: 'primary' },
          { key: 'grammar', label: '📖 Ngữ pháp', variant: 'primary' },
          { key: 'reading', label: '📚 Đoạn văn', variant: 'primary' },
          { key: 'listen', label: '🎵 Nghe câu', variant: 'primary' },
          { key: 'speak', label: '🎤 Nói theo', variant: 'primary' },
        ].map((t) => (
          <button
            key={t.key}
            className={`btn btn-sm ${tab === t.key ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        <button
          className="btn btn-sm btn-warning fw-bold ms-auto"
          onClick={() => { setQuizMode(true); restartQuiz(); }}
        >
          🎯 Làm Quiz
        </button>
      </div>

      {/* ── VOCAB TAB ── */}
      {tab === 'vocab' && (
        <div className="row g-3">
          {vocab.map((v) => {
            const status = getWordStatus(v.word);
            return (
              <div className="col-12 col-md-6" key={v.word}>
                <div className="card shadow-sm h-100 card-hover vocab-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.5rem' }}>{v.illustration || lesson.icon}</span>
                        <div>
                          <h5 className="fw-bold text-cowdi-primary mb-0">{v.word}</h5>
                          <small className="text-muted font-monospace">{v.phonetic}</small>
                        </div>
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(v.word)} title="Nghe phát âm">
                          🔊
                        </button>
                        <button
                          className={`btn btn-sm ${status === 'learned' ? 'btn-success' : status === 'learning' ? 'btn-outline-warning' : 'btn-outline-secondary'}`}
                          onClick={() => setWordStatus(v.word, status === 'learned' ? 'new' : status === 'learning' ? 'learned' : 'learning')}
                          title={status === 'learned' ? 'Đã thuộc' : status === 'learning' ? 'Đang học' : 'Đánh dấu học'}
                        >
                          {status === 'learned' ? '✅' : status === 'learning' ? '📖' : '➕'}
                        </button>
                      </div>
                    </div>
                    <p className="fw-bold mb-1">{v.meaning}</p>
                    <div className="bg-light rounded p-2 d-flex align-items-center gap-2">
                      <small className="fst-italic text-muted flex-grow-1">"{v.example}"</small>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(v.example)} title="Nghe ví dụ" style={{ flexShrink: 0 }}>
                        🔊
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── FLASHCARD TAB ── */}
      {tab === 'flashcard' && (
        <div className="d-flex flex-column align-items-center">
          <div className="mb-3 text-muted">
            <span className="fw-bold">{fcIndex + 1}</span> / {vocab.length}
            {fcMastered.size > 0 && <span className="ms-3 text-success fw-bold">✅ {fcMastered.size} đã thuộc</span>}
          </div>
          <div className="flashcard-wrapper" onClick={() => { setFcFlipped(!fcFlipped); if (!fcFlipped) speakWord(vocab[fcIndex].word); }}>
            <div className={`flashcard-inner ${fcFlipped ? 'flipped' : ''}`}>
              <div className="flashcard-front text-center">
                <span style={{ fontSize: '2.5rem' }} className="mb-2">{vocab[fcIndex].illustration || lesson.icon}</span>
                <h2 className="fw-bold mb-1">{vocab[fcIndex].word}</h2>
                <p className="mb-0 opacity-75">{vocab[fcIndex].phonetic}</p>
                <small className="mt-2 opacity-50">👆 Nhấn để lật</small>
              </div>
              <div className="flashcard-back text-center">
                <h3 className="fw-bold text-cowdi-primary mb-2">{vocab[fcIndex].meaning}</h3>
                <p className="fst-italic text-muted mb-0">"{vocab[fcIndex].example}"</p>
              </div>
            </div>
          </div>
          <div className="d-flex gap-3 mt-4 align-items-center flex-wrap justify-content-center">
            <button className="btn btn-outline-secondary" disabled={fcIndex === 0} onClick={fcPrev}>
              <i className="fas fa-chevron-left"></i> Trước
            </button>
            <button
              className={`btn ${fcMastered.has(vocab[fcIndex].word) ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => fcToggleMastered(vocab[fcIndex].word)}
            >
              {fcMastered.has(vocab[fcIndex].word) ? '✅ Đã thuộc' : '✅ Thuộc rồi!'}
            </button>
            <button className="btn btn-outline-secondary" disabled={fcIndex === vocab.length - 1} onClick={fcNext}>
              Tiếp <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <button className="btn btn-sm btn-outline-secondary mt-3" onClick={() => speakWord(vocab[fcIndex].word)} title="Nghe phát âm">
            🔊 Nghe phát âm
          </button>
          {/* Progress dots */}
          <div className="d-flex gap-1 mt-3 flex-wrap justify-content-center">
            {vocab.map((v, i) => (
              <div
                key={i}
                className="rounded-circle"
                style={{
                  width: 12, height: 12, cursor: 'pointer',
                  background: fcMastered.has(v.word) ? '#00B894' : i === fcIndex ? 'var(--cowdi-primary)' : '#ddd',
                  transition: 'background 0.2s',
                }}
                onClick={() => { setFcFlipped(false); setTimeout(() => setFcIndex(i), 150); }}
                title={v.word}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── GRAMMAR TAB ── */}
      {tab === 'grammar' && (
        <div className="row g-3">
          {lesson.grammar.map((g, i) => (
            <div className="col-12" key={i}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title fw-bold text-cowdi-primary">📖 {g.title}</h5>
                  <p className="text-muted">{g.explanation}</p>
                  <div className="d-flex flex-column gap-2">
                    {g.examples.map((ex, j) => (
                      <div key={j} className="bg-light rounded p-3">
                        <div className="fw-bold d-flex align-items-center gap-2 flex-wrap">
                          {ex.en}
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(ex.en)}>
                            🔊
                          </button>
                        </div>
                        <div className="text-muted fst-italic small mt-1">→ {ex.vi}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── READING PASSAGE TAB ── */}
      {tab === 'reading' && (
        <ReadingPassage
          lesson={lesson}
          onSpeak={speakWord}
          onSpeakSlow={speakSlow}
          addXP={addXP}
          showToast={showToast}
          play={play}
        />
      )}

      {/* ── SPEAK ALONG TAB ── */}
      {tab === 'speak' && speakDone && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card shadow-sm mb-4 bg-cowdi-gradient text-white">
            <div className="card-body text-center py-4">
              <div style={{ fontSize: '3.5rem' }}>🎉🎤</div>
              <h4 className="fw-bold mt-2">Hoàn thành luyện nói!</h4>
              {(() => {
                const scores = Object.values(speakScores);
                const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
                return (
                  <p className="mb-0 opacity-90">
                    Trung bình: <b>{avg}%</b> · {scores.length}/{speakSentences.length} câu đã đọc
                  </p>
                );
              })()}
            </div>
          </div>

          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h6 className="fw-bold mb-3 text-cowdi-primary">📋 Kết quả từng câu</h6>
              <div className="d-flex flex-column gap-2">
                {speakSentences.map((s, i) => {
                  const sc = speakScores[i];
                  const lbl = sc != null ? getScoreLabel(sc) : null;
                  return (
                    <div key={i} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: '#f8f9fa' }}>
                      <span className="badge bg-light text-muted" style={{ minWidth: 28 }}>{i + 1}</span>
                      <div className="flex-grow-1 text-start">
                        <div className="fw-bold small">{s.en}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>{s.vi}</div>
                      </div>
                      {sc != null ? (
                        <span className="badge rounded-pill" style={{ background: lbl.color, color: '#fff', fontSize: '0.85rem' }}>
                          {sc}%
                        </span>
                      ) : (
                        <span className="badge rounded-pill bg-secondary">—</span>
                      )}
                      <button
                        className="btn btn-sm btn-outline-cowdi"
                        title="Nghe lại"
                        onClick={() => speakWord(s.en)}
                      >🔊</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-cowdi-primary" onClick={resetSpeak}>
              <i className="fas fa-redo me-1"></i>Luyện lại
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setTab('quiz')}>
              Sang Quiz <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {tab === 'speak' && !speakDone && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card shadow-sm mb-4 bg-cowdi-gradient text-white">
            <div className="card-body text-center py-4">
              <div style={{ fontSize: '3rem' }}>🐮🎤</div>
              <h4 className="fw-bold mt-2">Nói theo Cowdi!</h4>
              <p className="mb-0 opacity-75">Nghe → Nhấn mic → Nói → Xem điểm!</p>
            </div>
          </div>

          {/* Browser support warning */}
          {!SpeechRecognitionAPI && (
            <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                <strong>Trình duyệt không hỗ trợ nhận diện giọng nói.</strong><br />
                <small>Vui lòng sử dụng <b>Google Chrome</b> hoặc <b>Microsoft Edge</b> để dùng tính năng chấm điểm phát âm. Bạn vẫn có thể nghe và tập nói.</small>
              </div>
            </div>
          )}

          <div className="mb-3 text-center">
            <div className="text-muted fw-bold">
              {speakIdx + 1} / {speakSentences.length}
            </div>
            <div className="small text-muted mt-1">
              <span className="badge bg-success-subtle text-success">
                ✅ {Object.keys(speakScores).length} / {speakSentences.length} câu đã chấm điểm
              </span>
            </div>
          </div>

          {/* Sentence card */}
          <div className="card shadow-sm mb-3">
            <div className="card-body text-center py-4">
              <div className="badge bg-light text-muted mb-2">{speakSentences[speakIdx].label}</div>
              <h4 className="fw-bold text-cowdi-primary mb-2">{speakSentences[speakIdx].en}</h4>
              <p className="text-muted mb-3">→ {speakSentences[speakIdx].vi}</p>

              {/* Listen buttons */}
              <div className="d-flex gap-2 justify-content-center flex-wrap mb-3">
                <button
                  className="btn btn-cowdi-primary btn-lg"
                  onClick={() => { speakWord(speakSentences[speakIdx].en); setSpeakPlaying(true); setTimeout(() => setSpeakPlaying(false), 2000); }}
                  disabled={isRecording}
                >
                  {speakPlaying ? '🔊 Đang phát...' : '🔊 Nghe'}
                </button>
                <button
                  className="btn btn-outline-cowdi btn-lg"
                  onClick={() => speakSlow(speakSentences[speakIdx].en)}
                  disabled={isRecording}
                >
                  🐌 Chậm
                </button>
              </div>

              {/* Record button */}
              <div className="mb-3">
                {isRecording ? (
                  <button
                    className="btn btn-danger btn-lg rounded-pill px-4"
                    onClick={stopRecording}
                    style={{ animation: 'pulse 1s infinite' }}
                  >
                    <i className="fas fa-stop me-2"></i>Dừng ghi âm...
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-danger btn-lg rounded-pill px-4"
                    onClick={() => {
                      setTranscript('');
                      setSpeakResult(null);
                      setRecError('');
                      startRecording(speakSentences[speakIdx].en, speakIdx);
                    }}
                    disabled={!SpeechRecognitionAPI}
                    title={!SpeechRecognitionAPI ? 'Trình duyệt không hỗ trợ' : 'Nhấn để nói'}
                  >
                    <i className="fas fa-microphone me-2"></i>Nhấn để nói
                  </button>
                )}
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <div className="text-danger fw-bold mb-2" style={{ animation: 'pulse 1s infinite' }}>
                  🎙️ Đang nghe... Hãy đọc to câu trên!
                </div>
              )}

              {/* Interim transcript */}
              {isRecording && transcript && (
                <div className="alert alert-light py-2 mb-2">
                  <small className="text-muted">Đang nhận diện:</small><br />
                  <span className="fst-italic">{transcript}</span>
                </div>
              )}

              {/* Error message */}
              {recError && (
                <div className="alert alert-warning py-2 mb-2">
                  <i className="fas fa-exclamation-circle me-1"></i>{recError}
                </div>
              )}

              {/* Result */}
              {speakResult && !isRecording && (
                <div className="mt-3">
                  {/* Score circle */}
                  <div className="mb-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold"
                      style={{
                        width: 80, height: 80, fontSize: '1.5rem',
                        border: `4px solid ${getScoreLabel(speakResult.score).color}`,
                        color: getScoreLabel(speakResult.score).color,
                      }}
                    >
                      {speakResult.score}%
                    </div>
                    <div className="fw-bold mt-1" style={{ color: getScoreLabel(speakResult.score).color }}>
                      {getScoreLabel(speakResult.score).text}
                    </div>
                  </div>

                  {/* Your transcript */}
                  <div className="alert alert-light py-2 text-start">
                    <small className="text-muted d-block mb-1">Bạn nói:</small>
                    <span className="fw-bold">{transcript}</span>
                  </div>

                  {/* Word-by-word highlight */}
                  <div className="text-start mb-2">
                    <small className="text-muted d-block mb-1">Chi tiết từng từ:</small>
                    <div className="d-flex flex-wrap gap-1">
                      {normalizeText(speakSentences[speakIdx].en).split(' ').map((w, i) => (
                        <span
                          key={i}
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: speakResult.matched.includes(w) ? '#00B894' : '#D63031',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        >
                          {w} {speakResult.matched.includes(w) ? '✓' : '✗'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Retry button */}
                  <button
                    className="btn btn-outline-cowdi btn-sm mt-2"
                    onClick={() => {
                      setTranscript('');
                      setSpeakResult(null);
                      setRecError('');
                      startRecording(speakSentences[speakIdx].en, speakIdx);
                    }}
                  >
                    🔄 Thử lại
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <button className="btn btn-outline-secondary" disabled={speakIdx === 0} onClick={() => { setSpeakIdx((i) => i - 1); setTranscript(''); setSpeakResult(null); setRecError(''); }}>
              <i className="fas fa-chevron-left"></i> Trước
            </button>
            <button className="btn btn-outline-secondary" disabled={speakIdx === speakSentences.length - 1} onClick={() => { setSpeakIdx((i) => i + 1); setTranscript(''); setSpeakResult(null); setRecError(''); }}>
              Tiếp <i className="fas fa-chevron-right"></i>
            </button>
            <button
              className="btn btn-cowdi-primary"
              disabled={Object.keys(speakScores).length === 0}
              onClick={finalizeSpeak}
              title={Object.keys(speakScores).length === 0 ? 'Hãy đọc ít nhất 1 câu' : 'Kết thúc & nhận điểm'}
            >
              🏁 Hoàn thành
            </button>
          </div>
          {/* Progress */}
          <div className="progress mt-3" style={{ height: '6px' }}>
            <div className="progress-bar progress-bar-cowdi" style={{ width: `${((speakIdx + 1) / speakSentences.length) * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* ── LISTEN SENTENCES TAB ── */}
      {tab === 'listen' && (
        <div className="card shadow-sm" style={{ borderRadius: 16, maxWidth: 720, margin: '0 auto' }}>
          <div className="card-body p-4">
            {listenPool.length === 0 ? (
              <div className="text-center py-4">
                <div style={{ fontSize: '3rem' }}>🎧</div>
                <p className="text-muted mb-0">Bài học này chưa có câu ví dụ để luyện nghe.</p>
              </div>
            ) : listenQs.length === 0 ? (
              /* Intro / start */
              <div className="text-center py-3">
                <div style={{ fontSize: '3rem' }}>🎧</div>
                <h4 className="fw-bold mt-2">Nghe câu — luyện tai theo bài</h4>
                <p className="text-muted small mb-3">
                  Nghe câu bằng tiếng Anh từ bài <strong>{lesson.title}</strong> rồi chọn bản dịch đúng.
                  Có <strong>{listenPool.length}</strong> câu trong bài này — phiên luyện gồm{' '}
                  <strong>{Math.min(10, listenPool.length)}</strong> câu.
                </p>
                <button className="btn btn-cowdi-primary btn-lg" onClick={startLessonListen}>
                  🚀 Bắt đầu luyện nghe
                </button>
              </div>
            ) : listenDone ? (
              /* Done */
              <div className="text-center py-4">
                <div style={{ fontSize: '4rem' }}>🎉</div>
                <h4 className="fw-bold mt-2">Hoàn thành!</h4>
                <p className="lead mb-1">
                  Bạn nghe đúng <strong>{listenScore}</strong> / {listenQs.length} câu
                </p>
                <p className="text-muted small mb-3">
                  +{listenQs.length * 2} XP đã được cộng vào tài khoản của bạn 🎧
                </p>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <button className="btn btn-cowdi-primary" onClick={startLessonListen}>
                    🔁 Luyện lại
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => setTab('vocab')}>
                    Quay về bài học
                  </button>
                </div>
              </div>
            ) : (
              /* Active question */
              (() => {
                const q = listenQs[listenIdx];
                return (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-light text-muted">{q.label}</span>
                      <small className="text-muted fw-bold">{listenIdx + 1} / {listenQs.length}</small>
                    </div>
                    <div className="progress mb-3" style={{ height: 6, borderRadius: 999 }}>
                      <div
                        className="progress-bar progress-bar-cowdi"
                        style={{ width: `${((listenIdx + 1) / listenQs.length) * 100}%`, transition: 'width .3s' }}
                      />
                    </div>

                    {/* Audio area */}
                    <div
                      className="text-center text-white py-4 px-3 mb-3"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B9D 0%, #A29BFE 100%)',
                        borderRadius: 16,
                        boxShadow: '0 6px 20px rgba(255,107,157,.25)',
                      }}
                    >
                      <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.18))' }}>
                        🔊
                      </div>
                      <p className="mb-2 opacity-90 small">Nghe câu sau và chọn nghĩa đúng</p>
                      <div className="d-flex gap-2 justify-content-center flex-wrap">
                        <button
                          type="button"
                          onClick={() => speakWord(q.sentence, 0.85)}
                          style={{
                            background: 'rgba(255,255,255,.22)',
                            border: '1px solid rgba(255,255,255,.4)',
                            color: '#fff',
                            borderRadius: 999,
                            padding: '6px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          🔊 Nghe lại
                        </button>
                        <button
                          type="button"
                          onClick={() => speakSlow(q.sentence)}
                          style={{
                            background: 'rgba(255,255,255,.22)',
                            border: '1px solid rgba(255,255,255,.4)',
                            color: '#fff',
                            borderRadius: 999,
                            padding: '6px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          🐢 Chậm
                        </button>
                        {listenPicked !== null && (
                          <button
                            type="button"
                            onClick={() => { /* reveal text already shown */ }}
                            style={{
                              background: '#fff',
                              color: '#E0527E',
                              border: 'none',
                              borderRadius: 999,
                              padding: '6px 16px',
                              fontWeight: 600,
                              cursor: 'default',
                            }}
                          >
                            📝 {q.sentence}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="row g-2">
                      {q.options.map((opt, i) => {
                        const picked = listenPicked === i;
                        const isCorrect = i === q.correct;
                        const showResult = listenPicked !== null;
                        let cls = 'btn w-100 text-start py-2 px-3';
                        let extraStyle = { borderRadius: 12, fontSize: '.95rem' };
                        if (showResult) {
                          if (isCorrect) cls += ' btn-success';
                          else if (picked) cls += ' btn-danger';
                          else cls += ' btn-outline-secondary';
                        } else {
                          cls += ' btn-outline-cowdi';
                        }
                        return (
                          <div className="col-12" key={i}>
                            <button
                              className={cls}
                              style={extraStyle}
                              onClick={() => handleListenPick(i)}
                              disabled={showResult}
                            >
                              <strong className="me-2">{String.fromCharCode(65 + i)}.</strong>
                              {opt}
                              {showResult && isCorrect && <span className="float-end">✅</span>}
                              {showResult && picked && !isCorrect && <span className="float-end">❌</span>}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Feedback + next */}
                    {listenPicked !== null && (
                      <div className="mt-3">
                        {listenPicked === q.correct ? (
                          <div
                            className="alert mb-2 py-2"
                            style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: 12 }}
                          >
                            ✅ <strong>Chính xác!</strong> Câu nghe: <em>"{q.sentence}"</em>
                          </div>
                        ) : (
                          <div
                            className="alert mb-2 py-2"
                            style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 12 }}
                          >
                            ❌ <strong>Chưa đúng.</strong> Đáp án: <em>"{q.options[q.correct]}"</em>
                            <div className="small mt-1 text-muted">Câu nghe: "{q.sentence}"</div>
                          </div>
                        )}
                        <button className="btn btn-cowdi-primary w-100" onClick={handleListenNext}>
                          {listenIdx + 1 < listenQs.length ? 'Câu tiếp theo →' : '🏁 Hoàn thành'}
                        </button>
                      </div>
                    )}

                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Điểm hiện tại: <strong>{listenScore}</strong> / {listenIdx + (listenPicked !== null ? 1 : 0)}
                      </small>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}

