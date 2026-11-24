import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_LESSONS, getGroup, getGroupOfPath } from '../../data/lessons';
import { getLessonAccess, getNextPathLesson } from '../../data/path';
import { generateQuizFromLesson } from '../../utils/quiz-gen';
import PictureLesson from './PictureLesson';
import ExamReading from './ExamReading';
import Icon from '../../components/Icon';
import Emoji, { EmojiText } from '../../components/Emoji';

/* Lesson is learned as a fixed sequence of parts (Duolingo-style) */
const LESSON_STEPS = [
  { key: 'vocab',     label: 'Từ vựng',   icon: 'book' },
  { key: 'flashcard', label: 'Flashcard', icon: 'blocks' },
  { key: 'grammar',   label: 'Ngữ pháp',  icon: 'pencil' },
  { key: 'reading',   label: 'Đoạn văn',  icon: 'redbook' },
  { key: 'listen',    label: 'Nghe câu',  icon: 'ear' },
  { key: 'speak',     label: 'Nói theo',  icon: 'speak' },
  { key: 'quiz',      label: 'Quiz',      icon: 'target' },
];
const stepStorageKey = (lessonId) => `cowdi_lesson_steps:${lessonId}`;
function loadStepDone(lessonId) {
  try { return JSON.parse(localStorage.getItem(stepStorageKey(lessonId))) || {}; } catch { return {}; }
}
import { useUser } from '../../hooks/useUser';
import { usePet } from '../../hooks/usePet';
import { PET_REGISTRY, getEvolutionInfo, getSkillLevel } from '../../data/pets';
import { PetAvatar, bondOf, topSkillOf } from '../../pet-rig/PetAvatar';
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
 * ReadingPassage — hiển thị đoạn văn vận dụng từ đã học (U3, U4, U5, U10).
 * — U4: white-space: pre-line; hiển thị nhãn đoạn A, B, C… nếu có `paragraphs[]`.
 * — U5: tô và bấm được cả cụm từ (so khớp cụm dài nhất trước).
 * — U3: hiện `explanation` sau khi nộp bài.
 * — U10: chỉ thưởng XP 1 lần cho mỗi bài (lưu localStorage), không farm vô hạn.
 */
function ReadingPassage({ lesson, onSpeak, onSpeakSlow, addXP, showToast, play }) {
  const reading = lesson.reading;
  const rewardKey = `cowdi_reading_rewarded:${lesson.id}`;
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeWord, setActiveWord] = useState(null); // vocab object
  const [answers, setAnswers] = useState({}); // { qIdx: optIdx }
  const [submitted, setSubmitted] = useState(false);
  const [rewarded, setRewarded] = useState(() => {
    try { return localStorage.getItem(rewardKey) === '1'; } catch { return false; }
  });

  if (!reading || !reading.passage) {
    return (
      <div className="alert alert-light text-center">
        <div style={{ fontSize: '2rem' }} className="emoji-big"><Icon name="mail" size={36} /></div>
        <div className="fw-bold mt-2">Bài học này chưa có đoạn văn luyện tập.</div>
      </div>
    );
  }

  // Map nhanh word/phrase → vocab object (không phân biệt hoa/thường)
  const vocabMap = {};
  for (const v of (lesson.vocabulary || [])) {
    vocabMap[v.word.toLowerCase()] = v;
  }

  // U5: Sắp xếp highlights dài nhất trước để khớp cụm từ trước từ đơn
  const sortedHighlights = [...new Set((reading.highlights || []).filter(Boolean))]
    .sort((a, b) => b.length - a.length);
  const highlightSet = new Set(sortedHighlights.map((w) => w.toLowerCase()));
  const highlightRegex = sortedHighlights.length
    ? new RegExp(`(${sortedHighlights.map((w) => `\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).join('|')})`, 'gi')
    : null;

  const handleWordClick = (raw) => {
    const v = vocabMap[raw.toLowerCase()];
    if (!v) return;
    setActiveWord(v);
    onSpeak(v.word);
  };

  const renderHighlightedText = (text) => {
    if (!highlightRegex) return text;
    const parts = String(text || '').split(highlightRegex);
    return parts.map((part, i) => {
      if (highlightSet.has(part.toLowerCase())) {
        return (
          <span
            key={i}
            role="button"
            onClick={() => handleWordClick(part)}
            className="fw-bold text-cowdi-primary"
            style={{
              cursor: 'pointer',
              borderBottom: '2px dotted currentColor',
              padding: '0 2px',
            }}
            title="Click để xem nghĩa"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
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
    if (correct === total) {
      play?.('correct');
      if (!rewarded) {
        addXP?.(15);
        setRewarded(true);
        try { localStorage.setItem(rewardKey, '1'); } catch { /* ignore */ }
        showToast?.(`🎉 Trả lời đúng tất cả! +15 🥛 Sữa`, 'success');
      } else {
        showToast?.(`🎉 Trả lời đúng tất cả (${correct}/${total})!`, 'success');
      }
    } else if (pct >= 50) {
      play?.('click');
      if (!rewarded) {
        addXP?.(5);
        setRewarded(true);
        try { localStorage.setItem(rewardKey, '1'); } catch { /* ignore */ }
        showToast?.(`Đúng ${correct}/${total}. +5 🥛 Sữa`, 'info');
      } else {
        showToast?.(`Đúng ${correct}/${total}.`, 'info');
      }
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
            <div style={{ fontSize: '2.2rem' }} className="emoji-big"><Icon name="books" size={40} /></div>
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
          <Icon name="sound" size={14} /> Nghe toàn bộ
        </button>
        <button className="btn btn-sm btn-outline-cowdi" onClick={() => onSpeakSlow(reading.passage)}>
          <Icon name="snail" size={14} /> Nghe chậm
        </button>
        {reading.translation && (
          <button
            className={`btn btn-sm ${showTranslation ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={() => setShowTranslation((v) => !v)}
          >
            {showTranslation ? <><Icon name="monkey" size={14} /> Ẩn dịch</> : <><Emoji e="🇻🇳" size={14} /> Xem dịch</>}
          </button>
        )}
      </div>

      {/* Passage (U4: white-space: pre-line + nhãn đoạn A, B, C... nếu có paragraphs[]) */}
      <div className="card shadow-sm mb-3">
        <div className="card-body" style={{ lineHeight: 1.9, fontSize: '1.08rem', whiteSpace: 'pre-line' }}>
          {Array.isArray(reading.paragraphs) && reading.paragraphs.length > 0 ? (
            reading.paragraphs.map((p) => (
              <div key={p.label} className="mb-3">
                <span className="badge bg-primary me-2">{p.label}</span>
                {renderHighlightedText(p.en)}
              </div>
            ))
          ) : (
            renderHighlightedText(reading.passage)
          )}
        </div>
      </div>

      {/* Active word popup */}
      {activeWord && (
        <div className="card shadow-sm border-warning mb-3">
          <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div style={{ fontSize: '2rem' }} className="emoji-big"><Emoji e={activeWord.illustration || '📖'} size={36} /></div>
            <div className="flex-grow-1">
              <div className="fw-bold fs-5">
                {activeWord.word}{' '}
                {activeWord.pos && <span className="badge bg-light text-secondary border me-1 small">{activeWord.pos}</span>}
                <small className="text-muted fw-normal">{activeWord.phonetic}</small>
              </div>
              <div className="text-cowdi-primary">→ {activeWord.meaning}</div>
              {activeWord.example && (
                <div className="small fst-italic text-muted mt-1">“{activeWord.example}”</div>
              )}
              {activeWord.exampleVi && (
                <div className="small text-muted">→ {activeWord.exampleVi}</div>
              )}
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => onSpeak(activeWord.word)}>
              <Icon name="sound" size={14} />
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => setActiveWord(null)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Translation (U4: pre-line) */}
      {showTranslation && reading.translation && (
        <div className="alert alert-light border" style={{ whiteSpace: 'pre-line' }}>
          <div className="fw-bold text-muted small mb-1"><Emoji e="🇻🇳" size={13} /> Dịch nghĩa</div>
          <div>{reading.translation}</div>
        </div>
      )}

      {/* Comprehension quiz (U3: hiện explanation sau khi nộp) */}
      {reading.questions && reading.questions.length > 0 && (
        <div className="card shadow-sm mt-3">
          <div className="card-body">
            <h6 className="fw-bold text-cowdi-primary mb-3">
              <Icon name="question" size={16} /> Câu hỏi hiểu bài ({reading.questions.length})
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
                {submitted && q.explanation && (
                  <div className="alert alert-info py-2 px-3 mt-2 mb-0 small">
                    <strong>Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
            <div className="d-flex gap-2 mt-3">
              {!submitted ? (
                <button
                  className="btn btn-cowdi-primary"
                  disabled={Object.keys(answers).length < reading.questions.length}
                  onClick={submitQuiz}
                >
                  <Icon name="check" size={16} /> Nộp bài
                </button>
              ) : (
                <button className="btn btn-outline-cowdi" onClick={resetQuiz}>
                  <Icon name="refresh" size={16} /> Làm lại
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
  const { userData, addXP, addSkillXP, markLessonCompleted, recordLessonScore, incrementQuizzes, setWordStatus, getWordStatus, refreshWallet } = useUser();
  const { getActivePetWithDecay, onLessonComplete } = usePet();
  const showToast = useToast();
  const { play } = useSound();
  const lesson = ALL_LESSONS.find((l) => l.id === id);

  const confettiRef = useRef(null);
  const petRef = useRef(null);
  const streakRef = useRef(0);

  const activePet = getActivePetWithDecay();
  const petSpecies = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const petEvo = activePet && petSpecies ? getEvolutionInfo(activePet.speciesId, activePet.evolution) : null;
  const petName = activePet?.customName || petSpecies?.name || 'Cowdi';

  const emitPetAnswer = useCallback((isCorrect) => {
    if (isCorrect) {
      streakRef.current += 1;
      const c = streakRef.current;
      if (c === 3 || c === 5 || (c >= 10 && c % 5 === 0)) {
        petRef.current?.emit('streak', { count: c });
      } else {
        petRef.current?.emit('answer_correct');
      }
    } else {
      streakRef.current = 0;
      petRef.current?.emit('answer_wrong');
    }
  }, []);

  // Steps: vocab → flashcard → grammar → reading → listen → speak → quiz
  const [tab, setTab] = useState('vocab');
  const [lessonInfoOpen, setLessonInfoOpen] = useState(false);
  const [stepDone, setStepDone] = useState(() => loadStepDone(id));
  const [quizMode, setQuizMode] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);
  const [quizPassed, setQuizPassed] = useState(true);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [completedRewards, setCompletedRewards] = useState(null);
  const [correctAnim, setCorrectAnim] = useState(false);
  const [wrongAnim, setWrongAnim] = useState(false);

  // Flashcard + Vocab batch state (SDD §4.1: vocabBatchSize = 10)
  const [vocabBatch, setVocabBatch] = useState(0);
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
  const [listenXpEarned, setListenXpEarned] = useState(0);

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
        if (result.score >= 70) {
          play('correct');
          emitPetAnswer(true);
        } else if (result.score >= 40) {
          play('click');
        } else {
          play('wrong');
          emitPetAnswer(false);
        }
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
  }, [play, emitPetAnswer]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  /* ── Access & Group rules (SDD-LEARNING-GROUPS §4) ── */
  const access = useMemo(() => (lesson ? getLessonAccess(lesson.id, userData) : { locked: false }), [lesson, userData]);
  const group = useMemo(() => getGroupOfPath(access.path?.id) || getGroup('intermediate'), [access.path?.id]);
  const rules = group.rules;
  const defaultTtsRate = rules.ttsRate || 0.85;
  const speakMandatory = group.id === 'exam' && Boolean(access.unit?.id === 'exam-pron' || (lesson && /speaking/i.test(lesson.id)));
  const speakPassThreshold = access.unit?.id === 'exam-pron'
    ? (rules.pronPassRate?.examPron || 70)
    : (rules.pronPassRate?.speaking || 60);

  const speakWord = useCallback((text, rate = defaultTtsRate, opts = {}) => {
    if (!('speechSynthesis' in window) || !text) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => {
        petRef.current?.setVoiceLevel(0);
        petRef.current?.emit('pet_speak_end');
        resolve();
      };
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

        petRef.current?.emit('pet_speak_start', { text: cleaned });
        petRef.current?.setVoiceLevel(0.7);

        // Nếu caller chỉ định lang → dùng luôn (1 utterance)
        if (opts.lang) {
          const u = new SpeechSynthesisUtterance(cleaned);
          u.lang = opts.lang;
          u.rate = rate;
          u.onend = done;
          u.onerror = done;
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
        if (queue.length === 0) { done(); return; }

        const speakNext = (i) => {
          if (i >= queue.length) { done(); return; }
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
        done();
      }
    });
  }, []);

  const speakSlow = useCallback((text) => speakWord(text, 0.55), [speakWord]);

  /* ── Lesson steps: phân tách phần bắt buộc & tuỳ chọn theo nhóm (SDD §4.1) ── */
  const { requiredSteps, optionalSteps, steps } = useMemo(() => {
    if (!lesson) return { requiredSteps: [], optionalSteps: [], steps: [] };
    const hasListen = (lesson.grammar || []).some((g) =>
      (g.examples || []).some((ex) => ex.en && ex.vi && ex.en.trim().split(/\s+/).length >= 2));
    const available = LESSON_STEPS.filter((s) => {
      if (s.key === 'grammar') return (lesson.grammar || []).length > 0;
      if (s.key === 'reading') return !!lesson.reading?.passage;
      if (s.key === 'listen') return hasListen;
      if (s.key === 'quiz') return (lesson.quiz || []).length > 0;
      return true;
    });
    const reqSet = new Set(rules.requiredSteps || available.map((s) => s.key));
    if (speakMandatory) reqSet.add('speak');
    const req = available.filter((s) => reqSet.has(s.key));
    const opt = available.filter((s) => !reqSet.has(s.key));
    return { requiredSteps: req, optionalSteps: opt, steps: [...req, ...opt] };
  }, [lesson, rules.requiredSteps, speakMandatory]);

  // Reset batch/flashcard khi đổi bài
  useEffect(() => {
    setVocabBatch(0);
    setFcIndex(0);
    setFcFlipped(false);
    setQuizMode(false);
    setFinished(false);
  }, [id]);

  const markStep = useCallback((key) => {
    setStepDone((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      try { localStorage.setItem(stepStorageKey(id), JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [id]);

  // Resume at the first unfinished part when opening a lesson
  useEffect(() => {
    const done = loadStepDone(id);
    setStepDone(done);
    const first = steps.find((s) => !done[s.key]);
    setTab(first ? first.key : (steps[0]?.key || 'vocab'));
  }, [id, steps]);

  useEffect(() => { if (listenDone) markStep('listen'); }, [listenDone, markStep]);
  useEffect(() => { if (speakDone) markStep('speak'); }, [speakDone, markStep]);
  useEffect(() => { if (finished) markStep('quiz'); }, [finished, markStep]);

  // Sự kiện pet: vào bài học
  useEffect(() => {
    streakRef.current = 0;
    petRef.current?.emit('lesson_start');
  }, [id]);

  // Sự kiện pet: hiện câu hỏi mới (quiz / nghe câu / nói theo)
  useEffect(() => {
    if (quizMode && !finished) {
      petRef.current?.emit('question_shown');
    }
  }, [quizMode, qIndex, finished]);

  useEffect(() => {
    if (tab === 'listen' && listenQs.length > 0 && !listenDone) {
      petRef.current?.emit('question_shown');
    }
  }, [tab, listenIdx, listenQs.length, listenDone]);

  useEffect(() => {
    if (tab === 'speak' && !speakDone) {
      petRef.current?.emit('question_shown');
    }
  }, [tab, speakIdx, speakDone]);

  // Sự kiện pet: bật / tắt mic khi luyện nói
  useEffect(() => {
    if (!isRecording) {
      petRef.current?.setMicLevel(0);
      petRef.current?.emit('mic_end');
      return;
    }
    petRef.current?.emit('mic_start');
    const iv = setInterval(() => {
      petRef.current?.setMicLevel(0.25 + Math.random() * 0.55);
    }, 120);
    return () => {
      clearInterval(iv);
      petRef.current?.setMicLevel(0);
    };
  }, [isRecording]);

  // Sự kiện pet: lên cấp kỹ năng
  const prevSkillLvlsRef = useRef(null);
  useEffect(() => {
    const s = activePet?.skills;
    if (!s) return;
    const cur = {
      listening: getSkillLevel(s.listening || 0),
      speaking: getSkillLevel(s.speaking || 0),
      reading: getSkillLevel(s.reading || 0),
      writing: getSkillLevel(s.writing || 0),
    };
    if (prevSkillLvlsRef.current) {
      const leveledUp = Object.keys(cur).some((k) => cur[k] > prevSkillLvlsRef.current[k]);
      if (leveledUp) petRef.current?.emit('skill_level_up');
    }
    prevSkillLvlsRef.current = cur;
  }, [activePet?.skills]);

  const quiz = quizQuestions.length > 0 ? quizQuestions : (lesson?.quiz || []);

  /* Auto-play sentence khi sang câu mới (chỉ khi đang ở tab listen, đã start, chưa xong) */
  useEffect(() => {
    if (!lesson || access.locked || tab !== 'listen' || listenQs.length === 0 || listenDone) return;
    const q = listenQs[listenIdx];
    if (!q) return;
    const t = setTimeout(() => speakWord(q.sentence, 0.85), 300);
    return () => clearTimeout(t);
  }, [lesson, access.locked, tab, listenIdx, listenQs, listenDone, speakWord]);

  /* 🔊 Auto-đọc câu hỏi quiz mỗi khi sang câu mới (U6: nếu có audioText thì đọc audioText tiếng Anh) */
  useEffect(() => {
    if (!lesson || access.locked || !quizMode || finished) return;
    const q = quiz[qIndex];
    if (!q) return;
    const t = setTimeout(() => {
      if (q.audioText) speakWord(q.audioText, defaultTtsRate, { lang: 'en-US' });
      else speakWord(q.question, defaultTtsRate);
    }, 250);
    return () => {
      clearTimeout(t);
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    };
  }, [lesson, access.locked, quizMode, qIndex, finished, quiz, speakWord, defaultTtsRate]);

  if (!lesson) {
    return (
      <div className="text-center py-5">
        <h2>Không tìm thấy bài học</h2>
        <button className="btn btn-cowdi-primary mt-3" onClick={() => navigate('/learning-path')}>
          Quay lại
        </button>
      </div>
    );
  }

  /* ── Sequential path: bài chưa mở khoá thì không được học ── */
  if (access.locked) {
    const b = access.blocker;
    const blockerLesson = b?.type === 'lesson' ? ALL_LESSONS.find((l) => l.id === b.lessonId) : null;
    const pathQuery = access.path?.id ? `?tab=${access.path.id}` : '';
    return (
      <div className="text-center py-5 fade-in" style={{ maxWidth: 520, margin: '0 auto' }}>
        <Icon name="lock" size={84} />
        <h2 className="mt-2"><Emoji e={lesson.icon} size={28} /> {lesson.title}</h2>
        <p className="text-muted">Bài này chưa mở. Học lần lượt theo lộ trình để không bỏ sót kiến thức nhé!</p>
        {b && (
          <div className="card mb-3">
            <div className="card-body">
              <small className="text-muted">Bước tiếp theo của bạn</small>
              <div className="fs-5 d-flex align-items-center justify-content-center gap-2">
                {b.type === 'lesson'
                  ? <><Emoji e={blockerLesson?.icon} size={24} /> {blockerLesson?.title || b.lessonId}</>
                  : <><Icon name="trophy" size={24} /> {b.unit.checkpoint.title}</>}
              </div>
            </div>
          </div>
        )}
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          {b?.type === 'lesson' && (
            <button className="btn btn-cowdi-primary d-inline-flex align-items-center gap-2" onClick={() => navigate(`/lessons/${b.lessonId}`)}><Icon name="play" size={18} /> Học bài tiếp theo</button>
          )}
          <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={() => navigate(`/learning-path${pathQuery}`)}><Icon name="road" size={18} /> Xem lộ trình</button>
        </div>
      </div>
    );
  }

  const vocab = lesson.vocabulary || [];
  const batchSize = rules.vocabBatchSize && vocab.length > rules.vocabBatchSize ? rules.vocabBatchSize : vocab.length;
  const totalBatches = batchSize > 0 ? Math.ceil(vocab.length / batchSize) : 1;
  const safeBatch = Math.min(vocabBatch, Math.max(0, totalBatches - 1));
  const pagedVocab = totalBatches > 1
    ? vocab.slice(safeBatch * batchSize, (safeBatch + 1) * batchSize)
    : vocab;
  const pathQuerySuffix = access.path?.id ? `?tab=${access.path.id}` : '';
  const pathNext = access.path ? getNextPathLesson(userData, access.path.id) : null;

  /* ── Stepper progress (chỉ tính phần bắt buộc theo SDD §4.1) ── */
  const stepsDoneCount = requiredSteps.filter((s) => stepDone[s.key]).length;
  const stepsPct = requiredSteps.length ? Math.round((stepsDoneCount / requiredSteps.length) * 100) : 0;
  const firstOpenIdx = requiredSteps.findIndex((s) => !stepDone[s.key]);
  const curStepIdx = steps.findIndex((s) => s.key === tab);
  const nextStep = curStepIdx >= 0 ? steps[curStepIdx + 1] : null;
  const completeStep = () => {
    markStep(tab);
    if (nextStep) { setTab(nextStep.key); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  /* ── speakAlong sentences: ưu tiên exampleVi (U7), fallback meaning ── */
  const speakSentences = [
    ...vocab.map((v) => ({ en: v.example, vi: v.exampleVi || v.meaning, label: v.word })),
    ...(lesson.grammar || []).flatMap((g) => (g.examples || []).map((ex) => ({ en: ex.en, vi: ex.vi, label: g.title }))),
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
    streakRef.current = 0;
    petRef.current?.emit('lesson_start');
  }

  function handleListenPick(i) {
    if (listenPicked !== null) return;
    setListenPicked(i);
    const q = listenQs[listenIdx];
    const ok = i === q.correct;
    if (ok) {
      setListenScore((s) => s + 1);
      play('correct');
    } else {
      play('wrong');
    }
    emitPetAnswer(ok);
  }

  function handleListenNext() {
    if (listenIdx + 1 < listenQs.length) {
      setListenIdx((i) => i + 1);
      setListenPicked(null);
    } else {
      setListenDone(true);
      // XP theo số câu đúng (không phải số câu), lần ôn lại nhận 1/3
      const isRepeat = userData.completedLessons.includes(lesson.id);
      const raw = listenScore * 3 + (listenScore === listenQs.length ? 10 : 0);
      const xp = Math.max(2, Math.round(isRepeat ? raw / 3 : raw));
      setListenXpEarned(xp);
      addXP(xp);
      addSkillXP('listening', xp);
      play('celebration');
      petRef.current?.emit('lesson_done', { text: 'Nghe giỏi lắm!' });
      showToast(`Hoàn thành nghe câu! ${listenScore}/${listenQs.length} đúng · +${xp} 🥛 Sữa 🎧`, 'success');
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
    if (speakMandatory && SpeechRecognitionAPI && avg < speakPassThreshold) {
      showToast(`Cần điểm phát âm trung bình ≥${speakPassThreshold}% để đạt phần bắt buộc này (hiện ${avg}%). Thử đọc lại nhé!`, 'warning');
      return;
    }
    // XP = avg% × số câu đã đọc × 0.2; ôn lại bài đã xong nhận 1/3
    const isRepeat = userData.completedLessons.includes(lesson.id);
    const xp = Math.max(5, Math.round(avg * scores.length * 0.2 * (isRepeat ? 1 / 3 : 1)));
    addXP(xp);
    addSkillXP('speaking', xp);
    speakAwardedRef.current = true;
    setSpeakDone(true);
    play('celebration');
    petRef.current?.emit('lesson_done', { text: 'Phát âm tuyệt lắm!' });
    showToast(`🎤 Luyện nói hoàn tất! Trung bình ${avg}%. +${xp} 🥛 Sữa, +${xp} điểm Speaking`, 'success');
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

  /* ── Quiz answer handler (U3 + H4) ── */
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
      setWrongAnswers((prev) => [
        ...prev,
        {
          question: q.audioText ? `${q.question} ("${q.audioText}")` : q.question,
          picked: q.options[idx],
          correct: q.options[q.correct],
          explanation: q.explanation || '',
        },
      ]);
    }
    emitPetAnswer(isCorrect);

    // Đọc đáp án khi đúng; nếu câu có explanation hoặc trả lời sai -> chờ người học bấm "Câu tiếp theo →" (U3)
    if (isCorrect) {
      await new Promise((r) => setTimeout(r, 300));
      await speakWord(q.options[q.correct], defaultTtsRate);
      if (!q.explanation) {
        await new Promise((r) => setTimeout(r, 300));
        goToNextQuestion(true);
      }
    }
  }

  function finishLessonAttempt({ finalScore, total, passRateOverride }) {
    const pct = total > 0 ? finalScore / total : 0;
    const pctInt = Math.round(pct * 100);
    const threshold = passRateOverride ?? rules.lessonPassRate ?? 0.7;
    // Kiểm tra phần phát âm bắt buộc ở nhóm Luyện thi (khi có micro)
    const needSpeakFirst = speakMandatory && SpeechRecognitionAPI && !stepDone.speak && !speakDone;
    const passed = pct >= threshold && !needSpeakFirst;
    const isPerfect = finalScore === total && total > 0;
    const isFirst = !userData.completedLessons.includes(lesson.id);

    recordLessonScore(lesson.id, pctInt);

    const base = finalScore * 10 + (isPerfect ? 30 : 0);
    const xp = passed
      ? (isFirst ? base + 60 : Math.max(5, Math.round(base / 3)))
      : Math.max(5, Math.round(base / 3)); // L4: chưa đạt vẫn nhận 1/3 Sữa, không thưởng hoàn thành

    const prevW = userData.wallet || {};
    addXP(xp);
    incrementQuizzes(isPerfect);

    if (passed) {
      markLessonCompleted(lesson.id);
      onLessonComplete();
      play('celebration');
      petRef.current?.emit('lesson_done', { text: isPerfect ? 'Trọn điểm xuất sắc!' : 'Hoàn thành bài học!' });
      spawnConfetti(confettiRef);
    } else {
      play('wrong');
    }

    if (typeof refreshWallet === 'function') {
      refreshWallet().then((newW) => {
        if (newW) {
          setCompletedRewards({
            milk: xp,
            gem: Math.max(0, (newW.gem || 0) - (prevW.gem || 0)),
            stone: Math.max(0, (newW.stone || 0) - (prevW.stone || 0)),
          });
        } else {
          setCompletedRewards({ milk: xp, gem: 0, stone: 0 });
        }
      });
    } else {
      setCompletedRewards({ milk: xp, gem: 0, stone: 0 });
    }

    if (passed) {
      showToast(
        isFirst
          ? `+${xp} 🥛 Sữa! Bạn đã hoàn thành bài học! 🎉`
          : `Ôn lại tốt! +${xp} 🥛 Sữa ${isPerfect ? '· Trọn điểm 💯' : ''}`,
        'success'
      );
    } else if (needSpeakFirst) {
      showToast(`Cần hoàn thành phần Nói theo (≥${speakPassThreshold}%) để qua bài này!`, 'warning');
    } else {
      showToast(`Chưa đạt (cần ≥${Math.round(threshold * 100)}%). Nhận +${xp} 🥛 Sữa ôn tập!`, 'warning');
    }

    return { passed, xp, milk: xp, gem: 0, stone: 0, needSpeakFirst };
  }

  function goToNextQuestion(wasCorrect) {
    if (qIndex + 1 < quiz.length) {
      setQIndex((i) => i + 1);
      setAnswered(null);
    } else {
      setFinished(true);
      const finalScore = wasCorrect && answered === null ? score + 1 : score;
      const res = finishLessonAttempt({ finalScore, total: quiz.length });
      setQuizPassed(res.passed);
    }
  }

  function restartQuiz() {
    setQuizQuestions(generateQuizFromLesson(lesson));
    setQIndex(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
    setQuizPassed(true);
    setWrongAnswers([]);
    setCorrectAnim(false);
    setWrongAnim(false);
    streakRef.current = 0;
    petRef.current?.emit('lesson_start');
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

  /* ── Pet companion dock (giữ mount xuyên suốt giữa bài học, quiz và kết quả) ── */
  const petDock = activePet ? (
    <div className="study-pet-dock" style={quizMode ? { maxWidth: 680, margin: '0 auto 14px' } : undefined}>
      <div className="study-pet-avatar">
        <PetAvatar
          ref={petRef}
          petId={activePet.speciesId}
          stage={(activePet.evolution || 0) + 1}
          group={petSpecies?.group}
          bond={bondOf(activePet.skills)}
          topSkill={topSkillOf(activePet.skills)}
          mode={finished ? 'home' : 'lesson'}
          fallbackSrc={petEvo?.image}
          alt={petName}
        />
      </div>
      <div className="study-pet-meta">
        <div className="study-pet-name">{petName} đang học cùng bạn</div>
        <div className="study-pet-hint">
          {quizMode && finished
            ? 'Tuyệt vời! Bạn vừa hoàn thành bài kiểm tra.'
            : quizMode
              ? 'Tập trung trả lời nhé — trả lời đúng liên tiếp để nhận cổ vũ!'
              : tab === 'speak'
                ? 'Nhấn micro để đọc to — pet sẽ lắng nghe cùng bạn.'
                : tab === 'listen'
                  ? 'Lắng nghe thật kỹ và chọn nghĩa đúng nhé!'
                  : `Bài: ${lesson.title}`}
        </div>
      </div>
    </div>
  ) : null;

  /* ══════════════════════════════════════════
     QUIZ RESULT / QUIZ / MAIN LESSON VIEW
     ══════════════════════════════════════════ */
  const renderLessonBody = () => {
  // Cấp 1 (Mới học): định dạng picture chuyển thẳng sang PictureLesson (SDD §4.4)
  if (lesson.format === 'picture') {
    return (
      <PictureLesson
        lesson={lesson}
        rules={rules}
        speakWord={speakWord}
        play={play}
        petRef={petRef}
        userData={userData}
        pathQuerySuffix={pathQuerySuffix}
        pathNext={pathNext}
        onComplete={({ score: picScore, total, passed }) =>
          finishLessonAttempt({ finalScore: picScore, total, passRateOverride: rules.lessonPassRate })
        }
      />
    );
  }

  if (quizMode && finished) {
    const pct = quiz.length ? Math.round((score / quiz.length) * 100) : 0;
    const passPct = Math.round((rules.lessonPassRate || 0.7) * 100);
    return (
      <div className="text-center py-4 fade-in position-relative" style={{ maxWidth: 680, margin: '0 auto' }} ref={confettiRef}>
        <div className={`quiz-result-icon emoji-big ${quizPassed ? 'bounce-in' : ''}`} style={{ fontSize: '5rem' }}>
          <Icon name={quizPassed ? 'trophy' : 'muscle'} size={96} />
        </div>
        <h2 className="fw-bold mt-3">{quizPassed ? 'Hoàn thành bài học!' : `Chưa đạt — cần ≥${passPct}%`}</h2>
        <div className="display-4 fw-bold text-cowdi-primary my-2">{score}/{quiz.length}</div>
        <p className="lead text-muted">
          {pct}% — <EmojiText>{quizPassed ? 'Xuất sắc! Cowdi rất tự hào! 🐮✨' : `Cần đạt ít nhất ${passPct}% để đánh dấu xong bài. Ôn lại rồi thử lại nhé! 🐮💪`}</EmojiText>
        </p>
        {pct === 100 && quizPassed && <div className="badge bg-warning text-dark fs-6 mb-3"><Icon name="hundred" size={16} /> PERFECT SCORE!</div>}

        {/* Phần thưởng thực nhận từ server */}
        <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap my-3">
          <span className="badge bg-primary fs-6 px-3 py-2">🥛 +{completedRewards?.milk ?? 5} Sữa</span>
          {completedRewards?.gem > 0 && (
            <span className="badge bg-info text-dark fs-6 px-3 py-2">💎 +{completedRewards.gem} Gem</span>
          )}
          {completedRewards?.stone > 0 && (
            <span className="badge bg-success fs-6 px-3 py-2">💠 +{completedRewards.stone} Đá nguyên tố</span>
          )}
        </div>

        {/* Liệt kê câu sai kèm đáp án đúng khi chưa đạt (hoặc có câu sai) */}
        {wrongAnswers.length > 0 && (
          <div className="card text-start shadow-sm my-3">
            <div className="card-body">
              <h6 className="fw-bold text-danger mb-2">Các câu cần ôn lại ({wrongAnswers.length})</h6>
              <div className="d-flex flex-column gap-2">
                {wrongAnswers.map((w, wi) => (
                  <div key={wi} className="p-2 rounded bg-light small">
                    <div className="fw-bold">{w.question}</div>
                    <div className="text-danger">Bạn chọn: {w.picked}</div>
                    <div className="text-success fw-bold">Đáp án đúng: {w.correct}</div>
                    {w.explanation && <div className="text-muted mt-1">{w.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="d-flex gap-2 justify-content-center mt-4 flex-wrap">
          {!quizPassed ? (
            <>
              <button className="btn btn-cowdi-primary" onClick={() => { setQuizMode(false); setTab('vocab'); }}>
                <Icon name="book" size={16} /> Ôn lại Từ vựng
              </button>
              <button className="btn btn-warning" onClick={restartQuiz}>
                <Icon name="refresh" size={16} /> Làm lại quiz
              </button>
            </>
          ) : (
            <>
              {pathNext?.type === 'lesson' && pathNext.lessonId !== lesson.id && (
                <button className="btn btn-cowdi-primary d-inline-flex align-items-center gap-2" onClick={() => navigate(`/lessons/${pathNext.lessonId}`)}><Icon name="play" size={18} /> Bài tiếp theo</button>
              )}
              {pathNext?.type === 'checkpoint' && (
                <button className="btn btn-warning d-inline-flex align-items-center gap-2" onClick={() => navigate(`/learning-path${pathQuerySuffix}`)}><Icon name="trophy" size={18} /> Làm bài kiểm tra Unit</button>
              )}
              <button className={`btn ${pathNext ? 'btn-outline-secondary' : 'btn-cowdi-primary'}`} onClick={restartQuiz}><Icon name="refresh" size={16} /> Làm lại</button>
              <button className="btn btn-outline-secondary" onClick={() => setQuizMode(false)}><Icon name="books" size={16} /> Quay lại bài học</button>
            </>
          )}
          <button className="btn btn-outline-secondary" onClick={() => navigate(`/learning-path${pathQuerySuffix}`)}><Icon name="road" size={16} /> Lộ trình</button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     QUIZ IN PROGRESS (Zero-scroll + Sticky Action Bar)
     ══════════════════════════════════════════ */
  if (quizMode) {
    const q = quiz[qIndex];
    const isListeningQ = Boolean(q?.audioText);
    const isRight = answered !== null && answered === q.correct;
    return (
      <div className="fade-in position-relative quiz-viewport-stage" ref={confettiRef}>
        <div className="quiz-top-bar">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => { setQuizMode(false); restartQuiz(); }}>
            <i className="fas fa-arrow-left me-1"></i>Thoát
          </button>
          <span className="text-muted fw-bold small">Câu {qIndex + 1}/{quiz.length}</span>
          <span className="badge bg-warning text-dark"><Icon name="star" size={14} /> {score}</span>
        </div>
        <div className="progress" style={{ height: '6px' }}>
          <div
            className="progress-bar progress-bar-cowdi"
            role="progressbar"
            style={{ width: `${((qIndex + 1) / quiz.length) * 100}%` }}
          ></div>
        </div>
        <div className={`card shadow-sm quiz-question-card ${correctAnim ? 'correct-flash' : ''} ${wrongAnim ? 'wrong-shake' : ''}`}>
          <div className="card-body text-center">
            {isListeningQ && (
              <div className="mb-1">
                <span className="badge bg-info text-dark">🎧 Câu hỏi nghe</span>
              </div>
            )}
            <p className="fs-5 fw-bold mb-2">{q.question}</p>
            {isListeningQ && answered !== null && (
              <p className="small fst-italic text-muted mb-2">“{q.audioText}”</p>
            )}
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className={`btn btn-sm ${isListeningQ ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
                onClick={() => isListeningQ ? speakWord(q.audioText, defaultTtsRate, { lang: 'en-US' }) : speakWord(q.question, defaultTtsRate)}
                title="Nghe lại"
              >
                <Icon name="sound" size={14} /> Nghe lại
              </button>
              {isListeningQ && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => speakWord(q.audioText, 0.55, { lang: 'en-US' })}
                  title="Nghe chậm"
                >
                  <Icon name="snail" size={14} /> Chậm
                </button>
              )}
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
          <div className={`quiz-sticky-action-bar fade-in ${isRight ? 'is-correct' : 'is-wrong'}`}>
            <div className="quiz-sticky-feedback">
              <div className={`fw-bold ${isRight ? 'text-success' : 'text-danger'}`}>
                {isRight ? <><Icon name="check" size={16} /> Chính xác! Giỏi lắm!</> : <><Icon name="x" size={16} /> Đáp án đúng: {q.options[q.correct]}</>}
              </div>
              {q.explanation && (
                <div className="small text-dark mt-1">
                  <strong>Giải thích:</strong> {q.explanation}
                </div>
              )}
            </div>
            {(q.explanation || !isRight) && (
              <div className="quiz-sticky-actions">
                <button
                  type="button"
                  className="btn btn-cowdi-primary px-4"
                  onClick={() => goToNextQuestion(isRight)}
                >
                  {qIndex + 1 < quiz.length ? 'Câu tiếp theo →' : 'Xem kết quả →'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════
     MAIN LESSON VIEW (Compact 1-row header + info popup)
     ══════════════════════════════════════════ */
  return (
    <div className="fade-in position-relative" ref={confettiRef}>
      {/* Compact Header — mô tả & mục tiêu đưa vào popup để tránh cuộn */}
      <div className="card shadow-sm mb-2">
        <div className={`card-header-level ${lesson.level}`}></div>
        <div className="card-body py-2 px-3">
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <div className="d-flex align-items-center gap-2 flex-wrap" style={{ minWidth: 0 }}>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(`/learning-path${pathQuerySuffix}`)}>
                <i className="fas fa-arrow-left me-1"></i>Lộ trình
              </button>
              <span className="d-inline-flex align-items-center"><Emoji e={lesson.icon} size={26} /></span>
              <h2 className="fw-bold mb-0 fs-5">{lesson.title}</h2>
              <span className={`badge badge-level-${lesson.level}`}>
                {lesson.level === 'starter'
                  ? '🌱 Mới học'
                  : lesson.level === 'beginner'
                    ? <><Icon name="dotGreen" size={12} /> Cơ bản</>
                    : lesson.level === 'intermediate'
                      ? <><Icon name="dotYellow" size={12} /> Trung cấp</>
                      : <><Icon name="dotRed" size={12} /> Nâng cao</>}
              </span>
              {userData.completedLessons.includes(lesson.id) && (
                <span className="badge bg-success"><Icon name="check" size={12} /> Đã xong</span>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              {rules.pretest && !userData.completedLessons.includes(lesson.id) && (
                <button
                  type="button"
                  className="btn btn-sm btn-warning fw-bold"
                  onClick={() => { setQuizMode(true); restartQuiz(); }}
                  title={`Làm thử quiz đạt ≥${Math.round(rules.lessonPassRate * 100)}% để vượt bài ngay`}
                >
                  ⚡ Làm thử
                </button>
              )}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setLessonInfoOpen(true)}
                title="Xem mô tả & mục tiêu bài học"
              >
                <Icon name="info" size={14} /> Chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup thông tin & mục tiêu bài học */}
      {lessonInfoOpen && (
        <div className="cowdi-mini-modal-backdrop" onClick={() => setLessonInfoOpen(false)}>
          <div className="cowdi-mini-modal" role="dialog" aria-label="Thông tin bài học" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between gap-2 pb-2 mb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <Emoji e={lesson.icon} size={28} />
                <h5 className="fw-bold mb-0">{lesson.title}</h5>
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setLessonInfoOpen(false)} aria-label="Đóng">✕</button>
            </div>
            <div className="d-flex flex-wrap gap-1 mb-2">
              <span className="badge bg-light text-dark border">{group.title}</span>
              <span className={`badge badge-level-${lesson.level}`}>{lesson.level}</span>
            </div>
            {lesson.description && <p className="text-muted small mb-2">{lesson.description}</p>}
            {Array.isArray(lesson.objectives) && lesson.objectives.length > 0 && (
              <div className="mb-2">
                <div className="small fw-bold mb-1">Mục tiêu sau bài học:</div>
                <ul className="small text-muted mb-0 ps-3">
                  {lesson.objectives.map((obj, oi) => <li key={oi}>{obj}</li>)}
                </ul>
              </div>
            )}
            {rules.pretest && !userData.completedLessons.includes(lesson.id) && (
              <div className="alert alert-light border mt-2 mb-0 py-2 px-3 small">
                <strong>Chế độ Luyện thi:</strong> Làm thử quiz đạt ≥{Math.round(rules.lessonPassRate * 100)}% để vượt bài ngay.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stepper: Phần bắt buộc trước + nhóm Tuỳ chọn (SDD §4.1) */}
      <div className="lesson-steps mb-3">
        <div className="lesson-steps-bar">
          <div className="book-bar"><i style={{ width: `${stepsPct}%` }} /></div>
          <span>{stepsDoneCount}/{requiredSteps.length} phần bắt buộc · <b>{stepsPct}%</b></span>
        </div>
        <ol className="lesson-steps-list">
          {requiredSteps.map((s, i) => {
            const done = !!stepDone[s.key];
            const locked = rules.lessonOrder === 'sequential' && !done && firstOpenIdx !== -1 && i > firstOpenIdx;
            const cur = tab === s.key;
            return (
              <li key={s.key} className="lesson-step-item">
                <button
                  type="button"
                  className={`lesson-step ${done ? 'done' : ''} ${cur ? 'current' : ''} ${locked ? 'locked' : ''}`}
                  disabled={locked}
                  onClick={() => setTab(s.key)}
                  title={locked ? 'Hoàn thành phần trước để mở' : s.label}
                >
                  <span className="lesson-step-dot">
                    {done && !cur ? <Icon name="check" size={24} /> : locked ? <Icon name="lock" size={18} /> : <Icon name={s.icon} size={24} />}
                  </span>
                  <span className="lesson-step-label">{i + 1}. {s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
        {optionalSteps.length > 0 && (
          <div className="d-flex align-items-center gap-2 flex-wrap mt-2 pt-2 border-top">
            <small className="text-muted">Tuỳ chọn:</small>
            {optionalSteps.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`btn btn-sm ${tab === s.key ? 'btn-cowdi-primary' : stepDone[s.key] ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                onClick={() => setTab(s.key)}
              >
                <Icon name={s.icon} size={14} /> {s.label}{stepDone[s.key] ? ' ✓' : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── VOCAB TAB (U7: pos, exampleVi + vocabBatchSize = 10) ── */}
      {tab === 'vocab' && (
        <div>
          {totalBatches > 1 && (
            <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
              <small className="text-muted fw-bold">Chia nhóm từ:</small>
              {Array.from({ length: totalBatches }).map((_, bi) => (
                <button
                  key={bi}
                  type="button"
                  className={`btn btn-sm ${safeBatch === bi ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
                  onClick={() => { setVocabBatch(bi); setFcIndex(bi * batchSize); setFcFlipped(false); }}
                >
                  Nhóm {bi + 1}/{totalBatches} ({bi * batchSize + 1}–{Math.min((bi + 1) * batchSize, vocab.length)})
                </button>
              ))}
            </div>
          )}
          <div className="row g-3">
            {pagedVocab.map((v) => {
              const status = getWordStatus(v.word);
              return (
                <div className="col-12 col-md-6" key={v.word}>
                  <div className="card shadow-sm h-100 card-hover vocab-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ fontSize: '1.5rem' }}><Emoji e={v.illustration || lesson.icon} size={28} /></span>
                          <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <h5 className="fw-bold text-cowdi-primary mb-0">{v.word}</h5>
                              {v.pos && <span className="badge bg-light text-secondary border small">{v.pos}</span>}
                            </div>
                            <small className="text-muted font-monospace">{v.phonetic}</small>
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(v.word)} title="Nghe phát âm">
                            <Icon name="sound" size={14} />
                          </button>
                          <button
                            className={`btn btn-sm ${status === 'learned' ? 'btn-success' : status === 'learning' ? 'btn-outline-warning' : 'btn-outline-secondary'}`}
                            onClick={() => setWordStatus(v.word, status === 'learned' ? 'new' : status === 'learning' ? 'learned' : 'learning')}
                            title={status === 'learned' ? 'Đã thuộc' : status === 'learning' ? 'Đang học' : 'Đánh dấu học'}
                          >
                            {status === 'learned' ? <Icon name="check" size={14} /> : status === 'learning' ? <Icon name="book" size={14} /> : <Icon name="plus" size={14} />}
                          </button>
                        </div>
                      </div>
                      <p className="fw-bold mb-1">{v.meaning}</p>
                      <div className="bg-light rounded p-2 d-flex align-items-center gap-2">
                        <div className="flex-grow-1">
                          <small className="fst-italic text-muted d-block">"{v.example}"</small>
                          {v.exampleVi && <small className="text-secondary d-block mt-1">→ {v.exampleVi}</small>}
                        </div>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(v.example)} title="Nghe ví dụ" style={{ flexShrink: 0 }}>
                          <Icon name="sound" size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FLASHCARD TAB (U1: xoá translateEnToVi, hiện exampleVi) ── */}
      {tab === 'flashcard' && vocab.length > 0 && (() => {
        const curCard = vocab[Math.min(fcIndex, vocab.length - 1)];
        return (
        <div className="d-flex flex-column align-items-center">
          <div className="mb-3 text-muted">
            <span className="fw-bold">{fcIndex + 1}</span> / {vocab.length}
            {fcMastered.size > 0 && <span className="ms-3 text-success fw-bold"><Icon name="check" size={16} /> {fcMastered.size} đã thuộc</span>}
          </div>
          <div className="flashcard-wrapper" onClick={() => {
            const willFlip = !fcFlipped;
            setFcFlipped(willFlip);
            if (willFlip) speakWord(curCard.word);
          }}>
            <div className={`flashcard-inner ${fcFlipped ? 'flipped' : ''}`}>
              <div className="flashcard-front text-center">
                <span style={{ fontSize: '2.5rem' }} className="mb-2 emoji-big"><Emoji e={curCard.illustration || lesson.icon} size={48} /></span>
                <h2 className="fw-bold mb-1">{curCard.word}</h2>
                {curCard.pos && <span className="badge bg-light text-dark mb-1">{curCard.pos}</span>}
                <p className="mb-0 opacity-75">{curCard.phonetic}</p>
                <small className="mt-2 opacity-50"><Icon name="point" size={14} /> Nhấn để lật</small>
              </div>
              <div className="flashcard-back text-center">
                <h3 className="fw-bold text-cowdi-primary mb-2">{curCard.meaning}</h3>
                {curCard.example && <p className="fst-italic text-muted mb-1">"{curCard.example}"</p>}
                {curCard.exampleVi && (
                  <p className="mb-0 small" style={{ color: '#6c5ce7' }}>
                    → <span className="fst-italic">{curCard.exampleVi}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="d-flex gap-3 mt-4 align-items-center flex-wrap justify-content-center">
            <button className="btn btn-outline-secondary" disabled={fcIndex === 0} onClick={fcPrev}>
              <i className="fas fa-chevron-left"></i> Trước
            </button>
            <button
              className={`btn ${fcMastered.has(curCard.word) ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => fcToggleMastered(curCard.word)}
            >
              {fcMastered.has(curCard.word) ? <><Icon name="check" size={16} /> Đã thuộc</> : <><Icon name="check" size={16} /> Thuộc rồi!</>}
            </button>
            <button className="btn btn-outline-secondary" disabled={fcIndex === vocab.length - 1} onClick={fcNext}>
              Tiếp <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <button className="btn btn-sm btn-outline-secondary mt-3" onClick={() => speakWord(curCard.word)} title="Nghe phát âm">
            <Icon name="sound" size={14} /> Nghe phát âm
          </button>
          {curCard.example && (
            <div className="d-flex gap-2 mt-2 flex-wrap justify-content-center">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => speakWord(curCard.example, defaultTtsRate, { lang: 'en-US' })}
                title="Nghe câu ví dụ"
              >
                <Icon name="sound" size={14} /> Nghe câu ví dụ
              </button>
              {curCard.exampleVi && (
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => speakWord(curCard.exampleVi, 0.9, { lang: 'vi-VN' })}
                  title="Nghe nghĩa tiếng Việt"
                >
                  <Icon name="sound" size={14} /> Nghe tiếng Việt
                </button>
              )}
            </div>
          )}
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
        );
      })()}

      {/* ── GRAMMAR TAB (U7: hiện mistakes[]) ── */}
      {tab === 'grammar' && (
        <div className="row g-3">
          {(lesson.grammar || []).map((g, i) => (
            <div className="col-12" key={i}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title fw-bold text-cowdi-primary"><Icon name="book" size={20} /> {g.title}</h5>
                  <p className="text-muted">{g.explanation}</p>
                  <div className="d-flex flex-column gap-2">
                    {(g.examples || []).map((ex, j) => (
                      <div key={j} className="bg-light rounded p-3">
                        <div className="fw-bold d-flex align-items-center gap-2 flex-wrap">
                          {ex.en}
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(ex.en)}>
                            <Icon name="sound" size={14} />
                          </button>
                        </div>
                        <div className="text-muted fst-italic small mt-1">→ {ex.vi}</div>
                      </div>
                    ))}
                  </div>
                  {Array.isArray(g.mistakes) && g.mistakes.length > 0 && (
                    <div className="alert alert-warning mt-3 mb-0">
                      <div className="fw-bold small mb-2">⚠️ Lỗi thường gặp của người Việt</div>
                      <div className="d-flex flex-column gap-2">
                        {g.mistakes.map((m, mi) => (
                          <div key={mi} className="small">
                            <span className="text-danger text-decoration-line-through me-2">✗ {m.wrong}</span>
                            <span className="text-success fw-bold">✓ {m.right}</span>
                            {m.note && <div className="text-muted">{m.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── READING PASSAGE TAB (U8: dùng ExamReading nếu có examQuestions[]) ── */}
      {tab === 'reading' && (
        Array.isArray(lesson.reading?.examQuestions) && lesson.reading.examQuestions.length > 0 ? (
          <ExamReading
            lesson={lesson}
            onSpeak={speakWord}
            onSpeakSlow={speakSlow}
            addXP={addXP}
            showToast={showToast}
            play={play}
          />
        ) : (
          <ReadingPassage
            lesson={lesson}
            onSpeak={speakWord}
            onSpeakSlow={speakSlow}
            addXP={addXP}
            showToast={showToast}
            play={play}
          />
        )
      )}

      {/* ── SPEAK ALONG TAB ── */}
      {tab === 'speak' && speakDone && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card shadow-sm mb-4 bg-cowdi-gradient text-white">
            <div className="card-body text-center py-4">
              <div style={{ fontSize: '3.5rem' }} className="emoji-big"><Icon name="party" size={60} /><Icon name="mic" size={60} /></div>
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
              <h6 className="fw-bold mb-3 text-cowdi-primary"><Icon name="clipboard" size={16} /> Kết quả từng câu</h6>
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
                      ><Icon name="sound" size={14} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-outline-secondary" onClick={resetSpeak}>
              <i className="fas fa-redo me-1"></i>Luyện lại
            </button>
            <button className="btn btn-cowdi-primary d-inline-flex align-items-center gap-2" onClick={completeStep}>
              Tiếp tục <Icon name="play" size={18} />
            </button>
          </div>
        </div>
      )}

      {tab === 'speak' && !speakDone && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card shadow-sm mb-4 bg-cowdi-gradient text-white">
            <div className="card-body text-center py-4">
              <div style={{ fontSize: '3rem' }} className="emoji-big"><Icon name="cow" size={56} /><Icon name="mic" size={56} /></div>
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
                <Icon name="check" size={12} /> {Object.keys(speakScores).length} / {speakSentences.length} câu đã chấm điểm
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
                  {speakPlaying ? <><Icon name="sound" size={18} /> Đang phát...</> : <><Icon name="sound" size={18} /> Nghe</>}
                </button>
                <button
                  className="btn btn-outline-cowdi btn-lg"
                  onClick={() => speakSlow(speakSentences[speakIdx].en)}
                  disabled={isRecording}
                >
                  <Icon name="snail" size={18} /> Chậm
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
                  <Icon name="mic" size={16} /> Đang nghe... Hãy đọc to câu trên!
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
                      <EmojiText>{getScoreLabel(speakResult.score).text}</EmojiText>
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
                    <Icon name="refresh" size={14} /> Thử lại
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
              <Icon name="checkered" size={16} /> Hoàn thành
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
                <div style={{ fontSize: '3rem' }} className="emoji-big"><Icon name="headphones" size={56} /></div>
                <p className="text-muted mb-0">Bài học này chưa có câu ví dụ để luyện nghe.</p>
              </div>
            ) : listenQs.length === 0 ? (
              /* Intro / start */
              <div className="text-center py-3">
                <div style={{ fontSize: '3rem' }} className="emoji-big"><Icon name="headphones" size={56} /></div>
                <h4 className="fw-bold mt-2">Nghe câu — luyện tai theo bài</h4>
                <p className="text-muted small mb-3">
                  Nghe câu bằng tiếng Anh từ bài <strong>{lesson.title}</strong> rồi chọn bản dịch đúng.
                  Có <strong>{listenPool.length}</strong> câu trong bài này — phiên luyện gồm{' '}
                  <strong>{Math.min(10, listenPool.length)}</strong> câu.
                </p>
                <button className="btn btn-cowdi-primary btn-lg" onClick={startLessonListen}>
                  <Icon name="rocket" size={18} /> Bắt đầu luyện nghe
                </button>
              </div>
            ) : listenDone ? (
              /* Done */
              <div className="text-center py-4">
                <div style={{ fontSize: '4rem' }} className="emoji-big"><Icon name="party" size={72} /></div>
                <h4 className="fw-bold mt-2">Hoàn thành!</h4>
                <p className="lead mb-1">
                  Bạn nghe đúng <strong>{listenScore}</strong> / {listenQs.length} câu
                </p>
                <p className="text-muted small mb-3">
                  +{listenXpEarned} 🥛 Sữa đã được cộng vào tài khoản của bạn <Icon name="headphones" size={14} />
                </p>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <button className="btn btn-outline-secondary" onClick={startLessonListen}>
                    <Icon name="repeat" size={16} /> Luyện lại
                  </button>
                  <button className="btn btn-cowdi-primary d-inline-flex align-items-center gap-2" onClick={completeStep}>
                    Tiếp tục <Icon name="play" size={18} />
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

                    {/* Audio area — compact để nhìn trọn cả 4 đáp án không phải cuộn */}
                    <div
                      className="text-center text-white py-2 px-3 mb-2"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B9D 0%, #A29BFE 100%)',
                        borderRadius: 14,
                        boxShadow: '0 4px 14px rgba(255,107,157,.2)',
                      }}
                    >
                      <p className="mb-1 opacity-90 small">🎧 Nghe câu sau và chọn nghĩa đúng</p>
                      <div className="d-flex gap-2 justify-content-center flex-wrap">
                        <button
                          type="button"
                          onClick={() => speakWord(q.sentence, 0.85)}
                          style={{
                            background: 'rgba(255,255,255,.22)',
                            border: '1px solid rgba(255,255,255,.4)',
                            color: '#fff',
                            borderRadius: 999,
                            padding: '5px 14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Icon name="sound" size={16} /> Nghe lại
                        </button>
                        <button
                          type="button"
                          onClick={() => speakSlow(q.sentence)}
                          style={{
                            background: 'rgba(255,255,255,.22)',
                            border: '1px solid rgba(255,255,255,.4)',
                            color: '#fff',
                            borderRadius: 999,
                            padding: '5px 14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Icon name="turtle" size={16} /> Chậm
                        </button>
                        {listenPicked !== null && (
                          <span
                            style={{
                              background: '#fff',
                              color: '#E0527E',
                              borderRadius: 999,
                              padding: '5px 14px',
                              fontWeight: 600,
                              fontSize: '0.88rem',
                            }}
                          >
                            <Icon name="note" size={14} /> {q.sentence}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Options — lưới 2×2 trên desktop để không phải cuộn */}
                    <div className="row g-2">
                      {q.options.map((opt, i) => {
                        const picked = listenPicked === i;
                        const isCorrect = i === q.correct;
                        const showResult = listenPicked !== null;
                        let cls = 'btn w-100 text-start py-2 px-3 quiz-option-btn';
                        let extraStyle = { borderRadius: 12, fontSize: '.92rem' };
                        if (showResult) {
                          if (isCorrect) cls += ' btn-success';
                          else if (picked) cls += ' btn-danger';
                          else cls += ' btn-outline-secondary';
                        } else {
                          cls += ' btn-outline-cowdi';
                        }
                        return (
                          <div className="col-12 col-md-6" key={i}>
                            <button
                              className={cls}
                              style={extraStyle}
                              onClick={() => handleListenPick(i)}
                              disabled={showResult}
                            >
                              <strong className="me-2">{String.fromCharCode(65 + i)}.</strong>
                              {opt}
                              {showResult && isCorrect && <span className="float-end"><Icon name="check" size={16} /></span>}
                              {showResult && picked && !isCorrect && <span className="float-end"><Icon name="x" size={16} /></span>}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sticky Feedback + Next bar */}
                    {listenPicked !== null && (
                      <div className={`quiz-sticky-action-bar mt-2 fade-in ${listenPicked === q.correct ? 'is-correct' : 'is-wrong'}`}>
                        <div className="quiz-sticky-feedback">
                          {listenPicked === q.correct ? (
                            <span className="text-success fw-bold">
                              <Icon name="check" size={16} /> Chính xác! <em>"{q.sentence}"</em>
                            </span>
                          ) : (
                            <span className="text-danger fw-bold">
                              <Icon name="x" size={16} /> Đáp án: <em>"{q.options[q.correct]}"</em>
                            </span>
                          )}
                        </div>
                        <div className="quiz-sticky-actions">
                          <button className="btn btn-cowdi-primary px-4" onClick={handleListenNext}>
                            {listenIdx + 1 < listenQs.length ? 'Câu tiếp theo →' : <><Icon name="checkered" size={16} /> Hoàn thành</>}
                          </button>
                        </div>
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

      {/* ── QUIZ STEP (final) ── */}
      {tab === 'quiz' && (
        <div className="card text-center" style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card-body py-4">
            <Icon name="target" size={80} />
            <h3 className="mt-2 mb-1">Quiz tổng kết</h3>
            <p className="text-muted mb-3">
              {(lesson.quiz || []).length} câu hỏi về từ vựng &amp; ngữ pháp của bài. Hoàn thành để đánh dấu bài học xong.
            </p>
            {stepDone.quiz && <div className="mb-3"><span className="badge bg-success">Đã hoàn thành phần này</span></div>}
            <button className="btn btn-warning btn-lg d-inline-flex align-items-center gap-2" onClick={() => { setQuizMode(true); restartQuiz(); }}>
              <Icon name="play" size={22} /> {stepDone.quiz ? 'Làm lại Quiz' : 'Bắt đầu Quiz'}
            </button>
            {stepDone.quiz && (
              <div className="mt-3">
                <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={() => navigate(`/learning-path${pathQuerySuffix}`)}>
                  <Icon name="road" size={18} /> Về lộ trình
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step footer: finish this part → next ── */}
      {['vocab', 'flashcard', 'grammar', 'reading'].includes(tab) && (
        <div className="lesson-step-footer">
          <div className="lesson-step-footer-txt">
            <small className="text-muted">Phần {curStepIdx + 1}/{steps.length}</small>
            <b>{steps[curStepIdx]?.label}</b>
          </div>
          <button type="button" className="btn btn-cowdi-primary btn-lg d-inline-flex align-items-center gap-2" onClick={completeStep}>
            {nextStep ? <>Hoàn thành → {nextStep.label} <Icon name="play" size={20} /></> : <>Hoàn thành <Icon name="check" size={20} /></>}
          </button>
        </div>
      )}
      {tab === 'speak' && !speakDone && (!speakMandatory || !SpeechRecognitionAPI) && (
        <div className="text-center mt-3">
          <button type="button" className="btn btn-link text-muted" onClick={completeStep}>Không có micro? Bỏ qua phần này →</button>
        </div>
      )}
      {tab === 'speak' && !speakDone && speakMandatory && SpeechRecognitionAPI && (
        <div className="text-center mt-2 small text-muted">
          Phần phát âm bắt buộc cho nhóm Luyện thi (cần trung bình ≥{speakPassThreshold}%).
        </div>
      )}
    </div>
  );
  };

  return (
    <>
      {petDock}
      {renderLessonBody()}
    </>
  );
}

