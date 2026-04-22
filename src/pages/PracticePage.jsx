import { useState, useCallback, useRef, useEffect } from 'react';
import { QUIZ_BANK, LESSONS } from '../data/lessons';
import { getAllTopicWords } from '../data/vocab-topics';
import { LISTEN_SENTENCE_TOPICS, getListenTopic } from '../data/listen-sentences';
import { SKILL_GROUPS, QUIZ_TO_SKILL } from '../data/pets';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { useToast } from '../components/Toast';
import { useSound } from '../hooks/useSound';

const TYPE_LABELS = {
  vocab:          { icon: '📝', title: 'Từ vựng',       desc: 'Ôn tập từ vựng đã học' },
  grammar:        { icon: '📖', title: 'Ngữ pháp',      desc: 'Kiểm tra kiến thức ngữ pháp' },
  listening:      { icon: '🎧', title: 'Nghe hiểu',     desc: 'Luyện nghe và nhận diện từ' },
  sentences:      { icon: '✍️', title: 'Hoàn thành câu', desc: 'Dịch và điền vào chỗ trống' },
  dictation:      { icon: '🎙️', title: 'Nghe chép',     desc: 'Nghe và viết lại từ tiếng Anh' },
  matching:       { icon: '🔗', title: 'Nối cặp',       desc: 'Nối từ tiếng Anh với tiếng Việt' },
  fillin:         { icon: '🔤', title: 'Điền từ',       desc: 'Điền từ còn thiếu vào câu' },
  reorder:        { icon: '🧩', title: 'Sắp xếp câu',  desc: 'Sắp xếp các từ thành câu đúng' },
  listenPick:     { icon: '🔊', title: 'Nghe chọn từ',  desc: 'Nghe phát âm và chọn từ đúng' },
  listenSentence: { icon: '🎵', title: 'Nghe câu',      desc: 'Nghe câu và chọn nghĩa đúng' },
  speedRound:     { icon: '⚡', title: 'Nhanh trí',      desc: 'Chọn nhanh từ trong thời gian ngắn' },
  wordGuess:      { icon: '🔤', title: 'Đoán từ',       desc: 'Nhìn nghĩa và gợi ý, đoán từ Anh' },
  trueFalse:      { icon: '✅', title: 'Đúng/Sai',      desc: 'Phán đoán nghĩa từ đúng hay sai' },
  contextClue:    { icon: '🔍', title: 'Đoán nghĩa',    desc: 'Đọc câu, đoán nghĩa của từ' },
  wordBuild:      { icon: '🧱', title: 'Ghép chữ',      desc: 'Sắp xếp chữ cái thành từ đúng' },
  translateWrite: { icon: '📝', title: 'Viết câu',      desc: 'Dịch nghĩa sang câu tiếng Anh' },
  mixed:          { icon: '🎲', title: 'Tổng hợp',      desc: 'Mix tất cả các loại câu hỏi' },
  speakWord:      { icon: '🗣️', title: 'Nói từ',        desc: 'Nhìn nghĩa tiếng Việt → nói từ tiếng Anh' },
  speakSentence:  { icon: '💬', title: 'Nói câu',        desc: 'Nhìn câu tiếng Việt → nói câu tiếng Anh' },
  readAloud:      { icon: '📢', title: 'Đọc to',         desc: 'Nhìn chữ tiếng Anh → đọc to phát âm chuẩn' },
  speakFast:      { icon: '⚡', title: 'Phản xạ nói',    desc: 'Nói từ tiếng Anh trong vòng 6 giây' },
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Merged vocabulary pool: LESSONS + VOCAB_TOPICS ── */
function getAllVocab() {
  const lessonWords = LESSONS.flatMap((l) => l.vocabulary);
  const topicWords = getAllTopicWords();
  // Deduplicate by lowercase word
  const seen = new Set();
  const merged = [];
  for (const w of [...lessonWords, ...topicWords]) {
    const key = w.word.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(w);
    }
  }
  return merged;
}

/* ── Build dictation & matching data from all vocab ── */
function buildDictationQuestions(count = 15) {
  return shuffleArray(getAllVocab()).slice(0, count).map((v) => ({
    word: v.word,
    meaning: v.meaning,
    phonetic: v.phonetic,
    example: v.example,
  }));
}

function buildMatchingRound() {
  const picked = shuffleArray(getAllVocab()).slice(0, 6);
  return {
    english: shuffleArray(picked.map((v) => ({ word: v.word, id: v.word }))),
    vietnamese: shuffleArray(picked.map((v) => ({ meaning: v.meaning, id: v.word }))),
  };
}

/* ── Build fill-in-the-blank questions from all vocab examples ── */
function buildFillInQuestions(count = 20) {
  const pool = getAllVocab().filter((v) => {
    // Only include words whose example actually contains the word
    const regex = new RegExp(`\\b${v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(v.example);
  });
  return shuffleArray(pool).slice(0, count).map((v) => {
    const regex = new RegExp(`\\b${v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const blanked = v.example.replace(regex, '______');
    return { sentence: blanked, answer: v.word, meaning: v.meaning, original: v.example };
  });
}

/* ── Build sentence reorder questions from all vocab examples ── */
function buildReorderQuestions(count = 12) {
  const pool = getAllVocab()
    .filter((v) => v.example.split(/\s+/).length >= 4); // need ≥4 words
  return shuffleArray(pool).slice(0, count).map((v) => {
    const words = v.example.replace(/[.!?]$/, '').split(/\s+/);
    return { correctOrder: words, shuffled: shuffleArray(words), meaning: v.meaning, original: v.example };
  });
}

/* ── Helper: pick N random distractors from vocab pool ── */
function pickDistractors(pool, excludeWord, count = 3) {
  return shuffleArray(pool.filter((w) => w.word.toLowerCase() !== excludeWord.toLowerCase()))
    .slice(0, count);
}

/* ── Listen & Pick: hear a word → pick correct written word from 4 ── */
function buildListenPickQuestions(count = 12) {
  const pool = getAllVocab();
  const picked = shuffleArray(pool).slice(0, count);
  return picked.map((v) => {
    const distractors = pickDistractors(pool, v.word).map((w) => w.word);
    const options = shuffleArray([v.word, ...distractors]);
    return { word: v.word, meaning: v.meaning, options, correct: options.indexOf(v.word) };
  });
}

/* ── Listen Sentence: hear a full sentence → pick correct Vietnamese translation ── */
function buildListenSentenceQuestions(topicId, count = 20) {
  const topic = getListenTopic(topicId);
  const pool = topic.sentences;
  const picked = shuffleArray(pool).slice(0, count);
  return picked.map((s) => {
    const others = pool.filter((x) => x.vi !== s.vi);
    const distractors = shuffleArray(others).slice(0, 3).map((x) => x.vi);
    const options = shuffleArray([s.vi, ...distractors]);
    return { sentence: s.en, meaning: s.vi, options, correct: options.indexOf(s.vi) };
  });
}

/* ── Speed Round: Vietnamese meaning → pick English word fast (8s) ── */
function buildSpeedRoundQuestions(count = 15) {
  const pool = getAllVocab();
  const picked = shuffleArray(pool).slice(0, count);
  return picked.map((v) => {
    const distractors = pickDistractors(pool, v.word).map((w) => w.word);
    const options = shuffleArray([v.word, ...distractors]);
    return { meaning: v.meaning, word: v.word, options, correct: options.indexOf(v.word) };
  });
}

/* ── Word Guess: meaning + partial word → type full word ── */
function buildWordGuessQuestions(count = 12) {
  const pool = getAllVocab().filter((v) => v.word.length >= 3);
  return shuffleArray(pool).slice(0, count).map((v) => {
    const letters = v.word.split('');
    const hideCount = Math.max(1, Math.floor(letters.length * 0.4));
    const hideIndices = shuffleArray([...Array(letters.length).keys()]).slice(0, hideCount);
    const partial = letters.map((c, i) => (hideIndices.includes(i) ? '_' : c)).join('');
    return { word: v.word, meaning: v.meaning, partial, phonetic: v.phonetic };
  });
}

/* ── True/False: word + meaning (sometimes wrong) → true or false ── */
function buildTrueFalseQuestions(count = 15) {
  const pool = shuffleArray(getAllVocab());
  return pool.slice(0, count).map((v, i) => {
    const isTrue = Math.random() > 0.5;
    const wrongWord = pool[(i + Math.floor(count / 2) + 1) % pool.length];
    const shownMeaning = isTrue ? v.meaning : wrongWord.meaning;
    return { word: v.word, shownMeaning, correctMeaning: v.meaning, isTrue };
  });
}

/* ── Context Clue: sentence with highlighted word → pick meaning from 4 ── */
function buildContextClueQuestions(count = 12) {
  const pool = getAllVocab().filter((v) => {
    const regex = new RegExp(`\\b${v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return v.example && regex.test(v.example);
  });
  const picked = shuffleArray(pool).slice(0, count);
  return picked.map((v) => {
    const distractors = pickDistractors(pool, v.word).map((w) => w.meaning);
    const options = shuffleArray([v.meaning, ...distractors]);
    const regex = new RegExp(`(\\b${v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b)`, 'i');
    const highlighted = v.example.replace(regex, '【$1】');
    return { sentence: highlighted, word: v.word, meaning: v.meaning, options, correct: options.indexOf(v.meaning) };
  });
}

/* ── Word Build: meaning → scrambled letters → tap to spell ── */
function buildWordBuildQuestions(count = 12) {
  const pool = getAllVocab().filter((v) => v.word.length >= 3 && v.word.length <= 12);
  return shuffleArray(pool).slice(0, count).map((v) => ({
    word: v.word,
    meaning: v.meaning,
    letters: shuffleArray(v.word.split('')),
  }));
}

/* ── Translate Write: Vietnamese meaning → write English sentence ── */
function buildTranslateWriteQuestions(count = 8) {
  const pool = getAllVocab().filter((v) => v.example && v.example.split(/\s+/).length >= 3);
  return shuffleArray(pool).slice(0, count).map((v) => ({
    meaning: v.meaning,
    word: v.word,
    answer: v.example.replace(/[.!?]$/, '').trim(),
    original: v.example,
  }));
}

/* ── Speaking: build question pools ── */
function buildSpeakWordQuestions(count = 15) {
  return shuffleArray(getAllVocab()).slice(0, count).map((v) => ({
    expected: v.word,
    prompt: v.meaning,
    phonetic: v.phonetic || '',
    example: v.example || '',
  }));
}
function buildSpeakSentenceQuestions(count = 10) {
  const pool = LISTEN_SENTENCE_TOPICS.flatMap((t) => t.sentences);
  return shuffleArray(pool).slice(0, count).map((s) => ({
    expected: s.en,
    prompt: s.vi,
  }));
}
function buildReadAloudQuestions(count = 12) {
  const words = shuffleArray(getAllVocab()).slice(0, 7).map((v) => ({
    expected: v.word,
    prompt: v.word,
    meaning: v.meaning,
    isWord: true,
  }));
  const sentences = shuffleArray(LISTEN_SENTENCE_TOPICS[0].sentences).slice(0, 5).map((s) => ({
    expected: s.en,
    prompt: s.en,
    meaning: s.vi,
    isWord: false,
  }));
  return shuffleArray([...words, ...sentences]).slice(0, count);
}
function buildSpeakFastQuestions(count = 15) {
  return shuffleArray(getAllVocab()).slice(0, count).map((v) => ({
    expected: v.word,
    prompt: v.meaning,
    phonetic: v.phonetic || '',
  }));
}

/* ── Speech scoring helper ── */
function speechScore(transcript, expected) {
  if (!transcript) return { correct: false, ratio: 0 };
  const normalize = (s) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const t = normalize(transcript);
  const e = normalize(expected);
  if (!e) return { correct: false, ratio: 0 };
  if (t === e) return { correct: true, ratio: 1 };
  const eWords = e.split(/\s+/).filter(Boolean);
  if (eWords.length === 1) {
    const correct = t.split(/\s+/).some((w) => w === eWords[0]);
    return { correct, ratio: correct ? 1 : 0 };
  }
  const stopSet = new Set(['a','an','the','is','are','was','were','i','to','of','in','for','on','at','by','it','its','my','me','we','he','she','they','do','did','has','have','had','and','or','but','so','that','this','with']);
  const keyWords = eWords.filter((w) => w.length > 2 && !stopSet.has(w));
  const tWords = t.split(/\s+/);
  const pool = keyWords.length > 0 ? keyWords : eWords;
  const matched = pool.filter((kw) =>
    tWords.some((tw) => tw === kw || (kw.length > 4 && (tw.startsWith(kw.slice(0, -1)) || kw.startsWith(tw.slice(0, -1)))))
  );
  const ratio = pool.length > 0 ? matched.length / pool.length : 0;
  return { correct: ratio >= 0.6, ratio };
}

/* ── SpeechRecognition custom hook ── */
function useSpeechRec() {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const supported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);
  function listen(onResult, onEnd) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try { recRef.current?.stop(); } catch {}
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    recRef.current = rec;
    let hasResult = false;
    rec.onresult = (e) => {
      hasResult = true;
      const best = e.results[0][0].transcript;
      setListening(false);
      onResult(best);
    };
    rec.onend = () => {
      setListening(false);
      if (!hasResult) onEnd?.('');
    };
    rec.onerror = () => {
      setListening(false);
      if (!hasResult) onEnd?.('');
    };
    setListening(true);
    rec.start();
  }
  function stop() {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }
  return { supported, listening, listen, stop };
}

export default function PracticePage() {
  const { addXP, addSkillXP, incrementQuizzes } = useUser();
  const { onQuizComplete, addCoins } = usePet();
  const showToast = useToast();
  const { play } = useSound();

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

  // Dynamic MCQ state (listenPick, listenSentence, speedRound, contextClue)
  const [dynQs, setDynQs] = useState([]);
  const [dynIdx, setDynIdx] = useState(0);
  const [dynScore, setDynScore] = useState(0);
  const [dynPicked, setDynPicked] = useState(null);
  const [dynTimer, setDynTimer] = useState(0);
  const dynTimerRef = useRef(null);

  // Listen Sentence topic selection
  const [lsTopicModal, setLsTopicModal] = useState(false);
  const [lsTopicId, setLsTopicId] = useState(null);

  // Word Guess state (text input)
  const [wgQs, setWgQs] = useState([]);
  const [wgIdx, setWgIdx] = useState(0);
  const [wgInput, setWgInput] = useState('');
  const [wgChecked, setWgChecked] = useState(null);
  const [wgScore, setWgScore] = useState(0);

  // True/False state
  const [tfQs, setTfQs] = useState([]);
  const [tfIdx, setTfIdx] = useState(0);
  const [tfPicked, setTfPicked] = useState(null);
  const [tfScore, setTfScore] = useState(0);

  // Word Build state (tap letters)
  const [wbQs, setWbQs] = useState([]);
  const [wbIdx, setWbIdx] = useState(0);
  const [wbSelected, setWbSelected] = useState([]);
  const [wbPool, setWbPool] = useState([]);
  const [wbChecked, setWbChecked] = useState(null);
  const [wbScore, setWbScore] = useState(0);

  // Translate Write state (text input)
  const [twQs, setTwQs] = useState([]);
  const [twIdx, setTwIdx] = useState(0);
  const [twInput, setTwInput] = useState('');
  const [twChecked, setTwChecked] = useState(null);
  const [twScore, setTwScore] = useState(0);

  // Speaking quiz state (speakWord, speakSentence, readAloud, speakFast)
  const [spkQs, setSpkQs] = useState([]);
  const [spkIdx, setSpkIdx] = useState(0);
  const [spkScore, setSpkScore] = useState(0);
  const [spkResult, setSpkResult] = useState(null); // { correct, transcript, ratio }
  const [spkTimer, setSpkTimer] = useState(0);
  const spkTimerRef = useRef(null);
  const speechRec = useSpeechRec();

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }, []);

  // Auto-play sentence when listenSentence question changes
  useEffect(() => {
    if (quizType === 'listenSentence' && dynQs.length > 0 && dynPicked === null) {
      const dq = dynQs[dynIdx];
      if (dq) {
        const t = setTimeout(() => speakWord(dq.sentence), 400);
        return () => clearTimeout(t);
      }
    }
  }, [quizType, dynIdx, dynQs]);

  // Auto-play for readAloud when question changes
  useEffect(() => {
    if (quizType === 'readAloud' && spkQs.length > 0) {
      const q = spkQs[spkIdx];
      if (q) {
        const t = setTimeout(() => speakWord(q.expected), 500);
        return () => clearTimeout(t);
      }
    }
  }, [quizType, spkIdx, spkQs]);

  // speakFast countdown timer
  useEffect(() => {
    if (quizType !== 'speakFast' || !speechRec.listening || spkResult || spkTimer <= 0) return;
    spkTimerRef.current = setTimeout(() => setSpkTimer((t) => t - 1), 1000);
    return () => clearTimeout(spkTimerRef.current);
  }, [spkTimer, speechRec.listening, quizType, spkResult]);

  useEffect(() => {
    if (quizType === 'speakFast' && speechRec.listening && spkTimer === 0 && !spkResult) {
      speechRec.stop();
    }
  }, [spkTimer, speechRec.listening, quizType, spkResult]);

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
      const qs = buildFillInQuestions(20);
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
    /* ── New dynamic MCQ types ── */
    if (type === 'listenPick') {
      setQuizType('listenPick');
      setDynQs(buildListenPickQuestions(12));
      setDynIdx(0); setDynScore(0); setDynPicked(null); setDynTimer(0);
      setFinished(false);
      return;
    }
    if (type === 'listenSentence') {
      setLsTopicModal(true);
      return;
    }
    if (type === 'speedRound') {
      setQuizType('speedRound');
      setDynQs(buildSpeedRoundQuestions(15));
      setDynIdx(0); setDynScore(0); setDynPicked(null); setDynTimer(8);
      setFinished(false);
      return;
    }
    if (type === 'contextClue') {
      setQuizType('contextClue');
      setDynQs(buildContextClueQuestions(12));
      setDynIdx(0); setDynScore(0); setDynPicked(null); setDynTimer(0);
      setFinished(false);
      return;
    }
    /* ── Word Guess ── */
    if (type === 'wordGuess') {
      setQuizType('wordGuess');
      setWgQs(buildWordGuessQuestions(12));
      setWgIdx(0); setWgInput(''); setWgChecked(null); setWgScore(0);
      setFinished(false);
      return;
    }
    /* ── True/False ── */
    if (type === 'trueFalse') {
      setQuizType('trueFalse');
      setTfQs(buildTrueFalseQuestions(15));
      setTfIdx(0); setTfPicked(null); setTfScore(0);
      setFinished(false);
      return;
    }
    /* ── Word Build ── */
    if (type === 'wordBuild') {
      const qs = buildWordBuildQuestions(12);
      setQuizType('wordBuild');
      setWbQs(qs);
      setWbIdx(0); setWbSelected([]); setWbPool([...qs[0].letters]); setWbChecked(null); setWbScore(0);
      setFinished(false);
      return;
    }
    /* ── Translate Write ── */
    if (type === 'translateWrite') {
      setQuizType('translateWrite');
      setTwQs(buildTranslateWriteQuestions(8));
      setTwIdx(0); setTwInput(''); setTwChecked(null); setTwScore(0);
      setFinished(false);
      return;
    }
    /* ── Speaking types (mic required) ── */
    if (type === 'speakWord') {
      setQuizType('speakWord');
      setSpkQs(buildSpeakWordQuestions(15));
      setSpkIdx(0); setSpkScore(0); setSpkResult(null); setSpkTimer(0);
      setFinished(false);
      return;
    }
    if (type === 'speakSentence') {
      setQuizType('speakSentence');
      setSpkQs(buildSpeakSentenceQuestions(10));
      setSpkIdx(0); setSpkScore(0); setSpkResult(null); setSpkTimer(0);
      setFinished(false);
      return;
    }
    if (type === 'readAloud') {
      setQuizType('readAloud');
      setSpkQs(buildReadAloudQuestions(12));
      setSpkIdx(0); setSpkScore(0); setSpkResult(null); setSpkTimer(0);
      setFinished(false);
      return;
    }
    if (type === 'speakFast') {
      setQuizType('speakFast');
      setSpkQs(buildSpeakFastQuestions(15));
      setSpkIdx(0); setSpkScore(0); setSpkResult(null); setSpkTimer(6);
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

  function startListenSentence(topicId) {
    setLsTopicModal(false);
    setLsTopicId(topicId);
    setQuizType('listenSentence');
    setDynQs(buildListenSentenceQuestions(topicId, 20));
    setDynIdx(0); setDynScore(0); setDynPicked(null); setDynTimer(0);
    setFinished(false);
  }

  function handleSpeak() {
    const q = spkQs[spkIdx];
    if (!q) return;
    if (quizType === 'speakFast') setSpkTimer(6);
    speechRec.listen(
      (transcript) => {
        clearTimeout(spkTimerRef.current);
        const { correct, ratio } = speechScore(transcript, q.expected);
        setSpkResult({ correct, transcript, ratio });
        if (correct) { setSpkScore((s) => s + 1); play('correct'); }
        else play('wrong');
      },
      () => {
        clearTimeout(spkTimerRef.current);
        setSpkResult((prev) => prev || { correct: false, transcript: '', ratio: 0 });
        play('wrong');
      }
    );
  }

  function handleSpkNext() {
    speechRec.stop();
    clearTimeout(spkTimerRef.current);
    const nextIdx = spkIdx + 1;
    if (nextIdx < spkQs.length) {
      setSpkIdx(nextIdx);
      setSpkResult(null);
      if (quizType === 'speakFast') setSpkTimer(6);
    } else {
      const finalScore = spkScore;
      const total = spkQs.length;
      const isPerfect = finalScore === total;
      const xp = finalScore * 10 + (isPerfect ? 20 : 0);
      addXP(xp);
      addSkillXP('speaking', xp);
      incrementQuizzes(isPerfect);
      onQuizComplete(quizType, finalScore, total);
      addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
      showToast(`+${xp} XP! 🎤`, 'success');
      isPerfect ? play('perfect') : play('celebration');
      setScore(finalScore);
      setFinished(true);
    }
  }

  const NON_MCQ = ['dictation', 'matching', 'fillin', 'reorder',
    'listenPick', 'listenSentence', 'speedRound', 'contextClue',
    'wordGuess', 'trueFalse', 'wordBuild', 'translateWrite',
    'speakWord', 'speakSentence', 'readAloud', 'speakFast'];
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
    if (idx === q.correct) { setScore((s) => s + 1); play('correct'); } else { play('wrong'); }

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
        addSkillXP(QUIZ_TO_SKILL[quizType], xp);
        incrementQuizzes(isPerfect);
        onQuizComplete(quizType, finalScore, questions.length);
        addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
        setFinished(true);
        isPerfect ? play('perfect') : play('celebration');
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
    if (correct) { setDictScore((s) => s + 1); play('correct'); } else { play('wrong'); }
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
      addSkillXP('listening', xp);
      incrementQuizzes(isPerfect);
      onQuizComplete('dictation', finalScore, dictQuestions.length);
      addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
      setFinished(true);
      setScore(finalScore);
      setQuestions(dictQuestions);
      isPerfect ? play('perfect') : play('celebration');
      showToast(`+${xp} XP! 🎉`, 'success');
    }
  }

  /* ── Fill-in-the-blank check ── */
  function checkFillIn() {
    if (fillChecked !== null) return;
    const q = fillQuestions[fillIdx];
    const correct = fillInput.trim().toLowerCase() === q.answer.toLowerCase();
    setFillChecked(correct);
    if (correct) { setFillScore((s) => s + 1); play('correct'); } else { play('wrong'); }
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
      addSkillXP('reading', xp);
      incrementQuizzes(isPerfect);
      onQuizComplete('fillin', finalScore, fillQuestions.length);
      addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
      setFinished(true);
      setScore(finalScore);
      isPerfect ? play('perfect') : play('celebration');
      showToast(`+${xp} XP! 🎉`, 'success');
    }
  }

  /* ── Reorder logic ── */
  function reorderTapWord(word, idx) {
    if (reorderChecked !== null) return;
    play('pop');
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
    if (correct) { setReorderScore((s) => s + 1); play('correct'); } else { play('wrong'); }
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
      addSkillXP('writing', xp);
      incrementQuizzes(isPerfect);
      onQuizComplete('reorder', finalScore, reorderQuestions.length);
      addCoins(finalScore * 3 + (isPerfect ? 20 : 0));
      setFinished(true);
      setScore(finalScore);
      isPerfect ? play('perfect') : play('celebration');
      showToast(`+${xp} XP! 🎉`, 'success');
    }
  }

  /* ══════ Speed Round timer ══════ */
  useEffect(() => {
    if (quizType === 'speedRound' && !finished && dynPicked === null && dynTimer > 0) {
      if (dynTimer <= 3) play('tickUrgent'); else play('tick');
      dynTimerRef.current = setTimeout(() => setDynTimer((t) => t - 1), 1000);
      return () => clearTimeout(dynTimerRef.current);
    }
    if (quizType === 'speedRound' && !finished && dynPicked === null && dynTimer === 0 && dynQs.length > 0) {
      handleDynAnswer(-1);
    }
  }, [dynTimer, quizType, finished, dynPicked]);

  /* ══════ Dynamic MCQ answer (listenPick, listenSentence, speedRound, contextClue) ══════ */
  function handleDynAnswer(idx) {
    if (dynPicked !== null) return;
    setDynPicked(idx);
    const q = dynQs[dynIdx];
    const isCorrect = idx === q.correct;
    if (isCorrect) { setDynScore((s) => s + 1); play('correct'); } else { play('wrong'); }

    setTimeout(() => {
      if (dynIdx + 1 < dynQs.length) {
        setDynIdx((i) => i + 1);
        setDynPicked(null);
        if (quizType === 'speedRound') setDynTimer(8);
      } else {
        const finalScore = isCorrect ? dynScore + 1 : dynScore;
        const isPerfect = finalScore === dynQs.length;
        const xp = finalScore * 10 + (isPerfect ? 20 : 0);
        addXP(xp);
        addSkillXP(QUIZ_TO_SKILL[quizType], xp);
        incrementQuizzes(isPerfect);
        onQuizComplete(quizType, finalScore, dynQs.length);
        addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
        setFinished(true);
        setScore(finalScore);
        isPerfect ? play('perfect') : play('celebration');
        showToast(`+${xp} XP! +${finalScore * 2 + (isPerfect ? 15 : 0)} 🪙 ${isPerfect ? 'Hoàn hảo! 💯' : 'Tốt lắm! 🎉'}`, 'success');
      }
    }, 800);
  }

  /* ══════ Word Guess check/next ══════ */
  function checkWordGuess() {
    if (wgChecked !== null) return;
    const q = wgQs[wgIdx];
    const correct = wgInput.trim().toLowerCase() === q.word.toLowerCase();
    setWgChecked(correct);
    if (correct) { setWgScore((s) => s + 1); play('correct'); } else { play('wrong'); }
  }
  function nextWordGuess() {
    if (wgIdx + 1 < wgQs.length) {
      setWgIdx((i) => i + 1);
      setWgInput('');
      setWgChecked(null);
    } else {
      const finalScore = wgScore;
      const isPerfect = finalScore === wgQs.length;
      const xp = finalScore * 10 + (isPerfect ? 20 : 0);
      addXP(xp); addSkillXP('speaking', xp);
      incrementQuizzes(isPerfect);
      onQuizComplete('wordGuess', finalScore, wgQs.length);
      addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
      setFinished(true); setScore(finalScore);
      isPerfect ? play('perfect') : play('celebration');
      showToast(`+${xp} XP! 🎉`, 'success');
    }
  }

  /* ══════ True/False answer ══════ */
  function handleTrueFalse(answer) {
    if (tfPicked !== null) return;
    const q = tfQs[tfIdx];
    const isCorrect = answer === q.isTrue;
    setTfPicked(answer);
    if (isCorrect) { setTfScore((s) => s + 1); play('correct'); } else { play('wrong'); }

    setTimeout(() => {
      if (tfIdx + 1 < tfQs.length) {
        setTfIdx((i) => i + 1);
        setTfPicked(null);
      } else {
        const finalScore = isCorrect ? tfScore + 1 : tfScore;
        const isPerfect = finalScore === tfQs.length;
        const xp = finalScore * 8 + (isPerfect ? 20 : 0);
        addXP(xp); addSkillXP('reading', xp);
        incrementQuizzes(isPerfect);
        onQuizComplete('trueFalse', finalScore, tfQs.length);
        addCoins(finalScore * 2 + (isPerfect ? 15 : 0));
        setFinished(true); setScore(finalScore);
        isPerfect ? play('perfect') : play('celebration');
        showToast(`+${xp} XP! 🎉`, 'success');
      }
    }, 800);
  }

  /* ══════ Word Build tap/untap/check/next ══════ */
  function wbTapLetter(letter, idx) {
    if (wbChecked !== null) return;
    play('pop');
    const newPool = [...wbPool];
    newPool.splice(idx, 1);
    setWbPool(newPool);
    setWbSelected((prev) => [...prev, letter]);
  }
  function wbUntapLetter(idx) {
    if (wbChecked !== null) return;
    const letter = wbSelected[idx];
    const newSelected = [...wbSelected];
    newSelected.splice(idx, 1);
    setWbSelected(newSelected);
    setWbPool((prev) => [...prev, letter]);
  }
  function checkWordBuild() {
    if (wbChecked !== null) return;
    const q = wbQs[wbIdx];
    const correct = wbSelected.join('').toLowerCase() === q.word.toLowerCase();
    setWbChecked(correct);
    if (correct) { setWbScore((s) => s + 1); play('correct'); } else { play('wrong'); }
  }
  function nextWordBuild() {
    if (wbIdx + 1 < wbQs.length) {
      const nextQ = wbQs[wbIdx + 1];
      setWbIdx((i) => i + 1);
      setWbSelected([]);
      setWbPool([...nextQ.letters]);
      setWbChecked(null);
    } else {
      const finalScore = wbScore;
      const isPerfect = finalScore === wbQs.length;
      const xp = finalScore * 12 + (isPerfect ? 25 : 0);
      addXP(xp); addSkillXP('writing', xp);
      incrementQuizzes(isPerfect);
      onQuizComplete('wordBuild', finalScore, wbQs.length);
      addCoins(finalScore * 3 + (isPerfect ? 20 : 0));
      setFinished(true); setScore(finalScore);
      isPerfect ? play('perfect') : play('celebration');
      showToast(`+${xp} XP! 🎉`, 'success');
    }
  }

  /* ══════ Translate Write check/next ══════ */
  function checkTranslateWrite() {
    if (twChecked !== null) return;
    const q = twQs[twIdx];
    const userText = twInput.trim().toLowerCase().replace(/[.!?]$/, '');
    const answerText = q.answer.toLowerCase();
    const correct = userText === answerText;
    setTwChecked(correct);
    if (correct) { setTwScore((s) => s + 1); play('correct'); } else { play('wrong'); }
  }
  function nextTranslateWrite() {
    if (twIdx + 1 < twQs.length) {
      setTwIdx((i) => i + 1);
      setTwInput('');
      setTwChecked(null);
    } else {
      const finalScore = twScore;
      const isPerfect = finalScore === twQs.length;
      const xp = finalScore * 15 + (isPerfect ? 30 : 0);
      addXP(xp); addSkillXP('writing', xp);
      incrementQuizzes(isPerfect);
      onQuizComplete('translateWrite', finalScore, twQs.length);
      addCoins(finalScore * 3 + (isPerfect ? 20 : 0));
      setFinished(true); setScore(finalScore);
      isPerfect ? play('perfect') : play('celebration');
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
        play('correct');
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
              addSkillXP('speaking', xp);
              addCoins(Math.round(matchScore * 2));
              onQuizComplete('matching', matchScore + 6, totalPairs);
              setFinished(true);
              setScore(matchScore + 6);
              play('celebration');
              showToast(`+${xp} XP! 🎉`, 'success');
            }
          }, 500);
        }
      } else {
        // Wrong pair
        play('wrong');
        setMatchWrong(true);
        setTimeout(() => {
          setMatchSelected({ en: null, vi: null });
          setMatchWrong(false);
        }, 600);
      }
    }
  }

  /* ══════════════════════════════════════════
     LISTEN SENTENCE — TOPIC PICKER
     ══════════════════════════════════════════ */
  if (lsTopicModal) {
    return (
      <div className="fade-in text-center py-4" style={{ maxWidth: 600, margin: '0 auto' }}>
        <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setLsTopicModal(false)}>← Quay lại</button>
        <div style={{ fontSize: '3rem' }} className="mb-2">🎵</div>
        <h4 className="fw-bold mb-1">Nghe câu</h4>
        <p className="text-muted mb-4">Nghe câu tiếng Anh và chọn nghĩa đúng. Chọn chủ đề để bắt đầu!</p>
        <div className="row g-3 justify-content-center">
          {LISTEN_SENTENCE_TOPICS.map((topic) => (
            <div className="col-12 col-sm-6" key={topic.id}>
              <div
                className="card card-hover shadow-sm h-100"
                style={{ cursor: 'pointer', borderLeft: `4px solid ${topic.color}` }}
                onClick={() => { play('click'); startListenSentence(topic.id); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && startListenSentence(topic.id)}
              >
                <div className="card-body py-4 text-center">
                  <div style={{ fontSize: '2.5rem' }} className="mb-2">{topic.icon}</div>
                  <h6 className="fw-bold mb-1">{topic.nameVi}</h6>
                  <p className="text-muted small mb-2">{topic.name}</p>
                  <span className="badge bg-light text-secondary">{topic.sentences.length} câu · 20 câu/lượt</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     TYPE SELECTION — grouped by 4 skills
     ══════════════════════════════════════════ */
  if (!quizType) {
    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <h2 className="fw-bold">
            <i className="fas fa-pen text-cowdi me-2"></i>Luyện tập
          </h2>
          <p className="text-muted">Chọn kỹ năng và bài tập để bắt đầu!</p>
        </div>

        {/* 4-Skill Groups */}
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {Object.entries(SKILL_GROUPS).map(([skillKey, group]) => (
            <div key={skillKey} className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fs-4">{group.icon}</span>
                <h5 className="fw-bold mb-0" style={{ color: group.color }}>{group.name}</h5>
                <span className="text-muted small ms-1">— {group.desc}</span>
              </div>
              <div className="row g-3">
                {group.types.map((type) => {
                  const info = TYPE_LABELS[type];
                  if (!info) return null;
                  return (
                    <div className="col-6 col-md-4 col-lg-3" key={type}>
                      <div
                        className="card text-center card-hover shadow-sm h-100 skill-card"
                        style={{ cursor: 'pointer', borderLeft: `4px solid ${group.color}` }}
                        onClick={() => { play('click'); startQuiz(type); }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && startQuiz(type)}
                      >
                        <div className="card-body py-3">
                          <div className="fs-2 mb-1">{info.icon}</div>
                          <h6 className="card-title fw-bold mb-1">{info.title}</h6>
                          <p className="card-text text-muted small mb-2">{info.desc}</p>
                          <span className="badge bg-light text-secondary">
                            {type === 'dictation' ? '15 từ' : type === 'matching' ? '3 vòng' : type === 'fillin' ? '20 câu' : type === 'reorder' ? '12 câu' : type === 'listenPick' ? '12 từ' : type === 'listenSentence' ? '20 câu/chủ đề' : type === 'speedRound' ? '15 câu' : type === 'contextClue' ? '12 câu' : type === 'wordGuess' ? '12 từ' : type === 'trueFalse' ? '15 câu' : type === 'wordBuild' ? '12 từ' : type === 'translateWrite' ? '8 câu' : type === 'speakWord' ? '15 từ' : type === 'speakSentence' ? '10 câu' : type === 'readAloud' ? '12 mục' : type === 'speakFast' ? '15 từ' : `${QUIZ_BANK[type]?.length ?? 0} câu`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Mixed — standalone */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="fs-4">🎲</span>
              <h5 className="fw-bold mb-0 text-secondary">Tổng hợp</h5>
              <span className="text-muted small ms-1">— Mix tất cả loại câu hỏi</span>
            </div>
            <div className="row g-3">
              <div className="col-6 col-md-4 col-lg-3">
                <div
                  className="card text-center card-hover shadow-sm h-100"
                  style={{ cursor: 'pointer', borderLeft: '4px solid #888' }}
                  onClick={() => startQuiz('mixed')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && startQuiz('mixed')}
                >
                  <div className="card-body py-3">
                    <div className="fs-2 mb-1">🎲</div>
                    <h6 className="card-title fw-bold mb-1">Tổng hợp</h6>
                    <p className="card-text text-muted small mb-2">Mix tất cả</p>
                    <span className="badge bg-light text-secondary">Ngẫu nhiên</span>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-4 col-lg-3">
                <div
                  className="card text-center card-hover shadow-sm h-100"
                  style={{ cursor: 'pointer', borderLeft: '4px solid #888' }}
                  onClick={() => { play('click'); startQuiz('matching'); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && startQuiz('matching')}
                >
                  <div className="card-body py-3">
                    <div className="fs-2 mb-1">🔗</div>
                    <h6 className="card-title fw-bold mb-1">Nối cặp</h6>
                    <p className="card-text text-muted small mb-2">Nối từ Anh–Việt</p>
                    <span className="badge bg-light text-secondary">3 vòng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     FINISHED (shared for all types)
     ══════════════════════════════════════════ */
  if (finished) {
    const DYN_MCQ_TYPES = ['listenPick', 'listenSentence', 'speedRound', 'contextClue'];
    const SPK_TYPES = ['speakWord', 'speakSentence', 'readAloud', 'speakFast'];
    const total = quizType === 'dictation' ? dictQuestions.length
                : quizType === 'matching' ? matchTotal * 6
                : quizType === 'fillin' ? fillQuestions.length
                : quizType === 'reorder' ? reorderQuestions.length
                : DYN_MCQ_TYPES.includes(quizType) ? dynQs.length
                : quizType === 'wordGuess' ? wgQs.length
                : quizType === 'trueFalse' ? tfQs.length
                : quizType === 'wordBuild' ? wbQs.length
                : quizType === 'translateWrite' ? twQs.length
                : SPK_TYPES.includes(quizType) ? spkQs.length
                : questions.length;
    const finalScore = quizType === 'dictation' ? dictScore
                     : quizType === 'fillin' ? fillScore
                     : quizType === 'reorder' ? reorderScore
                     : quizType === 'wordGuess' ? wgScore
                     : quizType === 'trueFalse' ? tfScore
                     : quizType === 'wordBuild' ? wbScore
                     : quizType === 'translateWrite' ? twScore
                     : SPK_TYPES.includes(quizType) ? score
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
     DYNAMIC MCQ: listenPick, listenSentence, speedRound, contextClue
     ══════════════════════════════════════════ */
  const DYN_MCQ_RENDER = ['listenPick', 'listenSentence', 'speedRound', 'contextClue'];
  if (DYN_MCQ_RENDER.includes(quizType) && dynQs.length > 0) {
    const dq = dynQs[dynIdx];
    return (
      <div className="fade-in" style={{ maxWidth: 650, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>✕ Thoát</button>
          <span className="text-muted fw-bold">Câu {dynIdx + 1}/{dynQs.length}</span>
          {quizType === 'speedRound' && (
            <span className={`badge fs-6 ${dynTimer <= 3 ? 'bg-danger' : 'bg-secondary'}`}>⏱ {dynTimer}s</span>
          )}
          <span className="badge bg-warning text-dark fs-6">⭐ {dynScore}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((dynIdx + 1) / dynQs.length) * 100}%` }}></div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-body py-4 text-center">
            {/* listenPick: hear a word, pick the written form */}
            {quizType === 'listenPick' && (
              <>
                <p className="text-muted mb-2">Nghe phát âm và chọn từ đúng:</p>
                <button className="btn btn-cowdi-primary btn-lg mb-2" onClick={() => speakWord(dq.word)}>🔊 Nghe từ</button>
                <p className="text-muted small mb-0">💡 Nghĩa: {dq.meaning}</p>
              </>
            )}
            {/* listenSentence: hear a sentence, pick Vietnamese meaning */}
            {quizType === 'listenSentence' && (
              <>
                <p className="text-muted mb-3">Nghe câu và chọn nghĩa đúng:</p>
                <button className="btn btn-cowdi-primary btn-lg mb-2" onClick={() => speakWord(dq.sentence)}>🔊 Nghe lại</button>
                <p className="text-muted small mt-2 mb-0">💡 Câu sẽ tự động phát khi chuyển câu mới</p>
              </>
            )}
            {/* speedRound: Vietnamese meaning shown, pick English word */}
            {quizType === 'speedRound' && (
              <>
                <p className="text-muted mb-2">Chọn nhanh từ tiếng Anh:</p>
                <p className="fs-4 fw-bold mb-0">{dq.meaning}</p>
              </>
            )}
            {/* contextClue: read sentence, guess meaning of highlighted word */}
            {quizType === 'contextClue' && (
              <>
                <p className="text-muted mb-2">Đoán nghĩa của từ in đậm trong câu:</p>
                <p className="fs-5 fw-bold mb-0">{dq.sentence}</p>
              </>
            )}
          </div>
        </div>

        <div className="row g-2" key={dynIdx}>
          {dq.options.map((opt, i) => {
            let cls = 'btn w-100 fw-bold py-2';
            if (dynPicked !== null) {
              cls += i === dq.correct ? ' btn-success' : i === dynPicked ? ' btn-danger' : ' btn-outline-secondary';
            } else {
              cls += ' btn-outline-primary';
            }
            // listenSentence: full-width buttons since translations are long
            const colClass = quizType === 'listenSentence' ? 'col-12' : 'col-6';
            return (
              <div className={colClass} key={`${dynIdx}-${i}`}>
                <button className={cls} style={quizType === 'listenSentence' ? { textAlign: 'left', whiteSpace: 'normal' } : {}} onClick={() => handleDynAnswer(i)} disabled={dynPicked !== null}>{opt}</button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     WORD GUESS MODE
     ══════════════════════════════════════════ */
  if (quizType === 'wordGuess') {
    const wq = wgQs[wgIdx];
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>✕ Thoát</button>
          <span className="text-muted fw-bold">Từ {wgIdx + 1}/{wgQs.length}</span>
          <span className="badge bg-warning text-dark fs-6">⭐ {wgScore}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((wgIdx + 1) / wgQs.length) * 100}%` }}></div>
        </div>

        <div className="card shadow-sm mb-4 text-center">
          <div className="card-body py-4">
            <p className="text-muted mb-2">Đoán từ tiếng Anh từ gợi ý:</p>
            <p className="fs-4 fw-bold text-cowdi-primary mb-2" style={{ letterSpacing: '4px' }}>{wq.partial}</p>
            <p className="mb-1">💡 Nghĩa: <strong>{wq.meaning}</strong></p>
            {wq.phonetic && <p className="text-muted small mb-0">🔤 {wq.phonetic}</p>}
          </div>
        </div>

        <div className="mb-3">
          <input
            type="text"
            className={`form-control form-control-lg text-center fw-bold ${wgChecked === true ? 'border-success bg-success bg-opacity-10' : wgChecked === false ? 'border-danger bg-danger bg-opacity-10' : ''}`}
            placeholder="Gõ từ tiếng Anh..."
            value={wgInput}
            onChange={(e) => setWgInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { wgChecked === null ? checkWordGuess() : nextWordGuess(); } }}
            disabled={wgChecked !== null}
            autoFocus
          />
        </div>

        {wgChecked !== null && (
          <div className={`text-center mb-3 fw-bold fs-5 fade-in ${wgChecked ? 'text-success' : 'text-danger'}`}>
            {wgChecked ? '✅ Chính xác!' : `❌ Đáp án: ${wq.word}`}
          </div>
        )}

        <div className="text-center">
          {wgChecked === null ? (
            <button className="btn btn-cowdi-primary" onClick={checkWordGuess} disabled={!wgInput.trim()}>Kiểm tra</button>
          ) : (
            <button className="btn btn-cowdi-primary" onClick={nextWordGuess}>
              {wgIdx + 1 < wgQs.length ? 'Từ tiếp theo →' : 'Xem kết quả'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     TRUE/FALSE MODE
     ══════════════════════════════════════════ */
  if (quizType === 'trueFalse') {
    const tq = tfQs[tfIdx];
    const isCorrectPick = tfPicked !== null && tfPicked === tq.isTrue;
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>✕ Thoát</button>
          <span className="text-muted fw-bold">Câu {tfIdx + 1}/{tfQs.length}</span>
          <span className="badge bg-warning text-dark fs-6">⭐ {tfScore}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((tfIdx + 1) / tfQs.length) * 100}%` }}></div>
        </div>

        <div className="card shadow-sm mb-4 text-center">
          <div className="card-body py-4">
            <p className="text-muted mb-3">Nghĩa của từ này đúng hay sai?</p>
            <p className="fs-3 fw-bold text-cowdi-primary mb-2">{tq.word}</p>
            <p className="fs-5 mb-0">= {tq.shownMeaning}</p>
          </div>
        </div>

        <div className="d-flex gap-3 justify-content-center mb-3">
          <button
            className={`btn btn-lg fw-bold px-5 ${tfPicked !== null ? (tq.isTrue ? 'btn-success' : 'btn-outline-success') : 'btn-outline-success'}`}
            onClick={() => handleTrueFalse(true)}
            disabled={tfPicked !== null}
          >✅ Đúng</button>
          <button
            className={`btn btn-lg fw-bold px-5 ${tfPicked !== null ? (!tq.isTrue ? 'btn-danger' : 'btn-outline-danger') : 'btn-outline-danger'}`}
            onClick={() => handleTrueFalse(false)}
            disabled={tfPicked !== null}
          >❌ Sai</button>
        </div>

        {tfPicked !== null && (
          <div className={`text-center fw-bold fs-5 fade-in ${isCorrectPick ? 'text-success' : 'text-danger'}`}>
            {isCorrectPick ? '✅ Đúng rồi!' : `❌ Sai! Nghĩa đúng: ${tq.correctMeaning}`}
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════
     WORD BUILD MODE (tap letters)
     ══════════════════════════════════════════ */
  if (quizType === 'wordBuild') {
    const bq = wbQs[wbIdx];
    return (
      <div className="fade-in" style={{ maxWidth: 650, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>✕ Thoát</button>
          <span className="text-muted fw-bold">Từ {wbIdx + 1}/{wbQs.length}</span>
          <span className="badge bg-warning text-dark fs-6">⭐ {wbScore}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((wbIdx + 1) / wbQs.length) * 100}%` }}></div>
        </div>

        <div className="card shadow-sm mb-4 text-center">
          <div className="card-body py-3">
            <p className="text-muted mb-1">Ghép các chữ cái thành từ đúng:</p>
            <p className="fs-5 fw-bold mb-0">💡 Nghĩa: {bq.meaning}</p>
          </div>
        </div>

        {/* Selected letters (answer area) */}
        <div className="card mb-3" style={{ minHeight: 56 }}>
          <div className="card-body d-flex flex-wrap gap-2 justify-content-center py-3">
            {wbSelected.length === 0 && <span className="text-muted small">Nhấn vào chữ cái bên dưới</span>}
            {wbSelected.map((l, i) => (
              <button
                key={i}
                className={`btn btn-sm fw-bold fs-5 ${wbChecked === true ? 'btn-success' : wbChecked === false ? 'btn-danger' : 'btn-cowdi-primary'}`}
                style={{ width: 42, height: 42 }}
                onClick={() => wbUntapLetter(i)}
                disabled={wbChecked !== null}
              >{l}</button>
            ))}
          </div>
        </div>

        {/* Letter pool */}
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
          {wbPool.map((l, i) => (
            <button
              key={i}
              className="btn btn-sm btn-outline-primary fw-bold fs-5"
              style={{ width: 42, height: 42 }}
              onClick={() => wbTapLetter(l, i)}
              disabled={wbChecked !== null}
            >{l}</button>
          ))}
        </div>

        {wbChecked !== null && (
          <div className={`text-center mb-3 fw-bold fs-5 fade-in ${wbChecked ? 'text-success' : 'text-danger'}`}>
            {wbChecked ? '✅ Chính xác!' : `❌ Đáp án: ${bq.word}`}
          </div>
        )}

        <div className="text-center">
          {wbChecked === null ? (
            <button className="btn btn-cowdi-primary" onClick={checkWordBuild} disabled={wbPool.length > 0}>Kiểm tra</button>
          ) : (
            <button className="btn btn-cowdi-primary" onClick={nextWordBuild}>
              {wbIdx + 1 < wbQs.length ? 'Từ tiếp theo →' : 'Xem kết quả'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     TRANSLATE WRITE MODE
     ══════════════════════════════════════════ */
  if (quizType === 'translateWrite') {
    const tq = twQs[twIdx];
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuizType(null)}>✕ Thoát</button>
          <span className="text-muted fw-bold">Câu {twIdx + 1}/{twQs.length}</span>
          <span className="badge bg-warning text-dark fs-6">⭐ {twScore}</span>
        </div>
        <div className="progress mb-4" style={{ height: '6px' }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((twIdx + 1) / twQs.length) * 100}%` }}></div>
        </div>

        <div className="card shadow-sm mb-4 text-center">
          <div className="card-body py-4">
            <p className="text-muted mb-2">Viết câu tiếng Anh cho nghĩa sau:</p>
            <p className="fs-5 fw-bold mb-1">💡 {tq.meaning}</p>
            <p className="text-muted small mb-0">Từ khóa: <strong>{tq.word}</strong></p>
          </div>
        </div>

        <div className="mb-3">
          <input
            type="text"
            className={`form-control form-control-lg text-center fw-bold ${twChecked === true ? 'border-success bg-success bg-opacity-10' : twChecked === false ? 'border-danger bg-danger bg-opacity-10' : ''}`}
            placeholder="Gõ câu tiếng Anh..."
            value={twInput}
            onChange={(e) => setTwInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { twChecked === null ? checkTranslateWrite() : nextTranslateWrite(); } }}
            disabled={twChecked !== null}
            autoFocus
          />
        </div>

        {twChecked !== null && (
          <div className={`text-center mb-3 fw-bold fs-5 fade-in ${twChecked ? 'text-success' : 'text-danger'}`}>
            {twChecked ? '✅ Chính xác!' : `❌ Đáp án: ${tq.original}`}
          </div>
        )}

        <div className="text-center">
          {twChecked === null ? (
            <button className="btn btn-cowdi-primary" onClick={checkTranslateWrite} disabled={!twInput.trim()}>Kiểm tra</button>
          ) : (
            <button className="btn btn-cowdi-primary" onClick={nextTranslateWrite}>
              {twIdx + 1 < twQs.length ? 'Câu tiếp theo →' : 'Xem kết quả'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     SPEAKING MODES (speakWord, speakSentence, readAloud, speakFast)
     ══════════════════════════════════════════ */
  const SPK_TYPES_SET = new Set(['speakWord', 'speakSentence', 'readAloud', 'speakFast']);
  if (SPK_TYPES_SET.has(quizType) && spkQs.length > 0) {
    const q = spkQs[spkIdx];
    const isLast = spkIdx + 1 >= spkQs.length;
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { speechRec.stop(); clearTimeout(spkTimerRef.current); setQuizType(null); }}>✕ Thoát</button>
          <span className="text-muted fw-bold">
            {TYPE_LABELS[quizType]?.icon} {TYPE_LABELS[quizType]?.title} — Câu {spkIdx + 1}/{spkQs.length}
          </span>
          {quizType === 'speakFast' && speechRec.listening && (
            <span className={`badge fs-6 ${spkTimer <= 2 ? 'bg-danger' : 'bg-secondary'}`}>⏱ {spkTimer}s</span>
          )}
          <span className="badge bg-warning text-dark fs-6">⭐ {spkScore}</span>
        </div>

        {/* Progress bar */}
        <div className="progress mb-4" style={{ height: 6 }}>
          <div className="progress-bar progress-bar-cowdi" style={{ width: `${((spkIdx + 1) / spkQs.length) * 100}%` }} />
        </div>

        {!speechRec.supported && (
          <div className="alert alert-warning text-center fw-bold">
            ⚠️ Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.<br />
            Hãy dùng <strong>Chrome</strong> hoặc <strong>Edge</strong> để luyện nói.
          </div>
        )}

        {/* Prompt card */}
        <div className="card shadow mb-4">
          <div className="card-body text-center py-4">
            <p className="text-muted mb-2 small fw-bold text-uppercase" style={{ letterSpacing: 1 }}>
              {quizType === 'speakWord' && '🇻🇳 Nhìn nghĩa → 🎤 Nói từ tiếng Anh'}
              {quizType === 'speakSentence' && '🇻🇳 Nhìn câu → 🎤 Nói câu tiếng Anh'}
              {quizType === 'readAloud' && '🇬🇧 Nhìn chữ → 🎤 Đọc to tiếng Anh'}
              {quizType === 'speakFast' && '🇻🇳 Nhìn nghĩa → ⚡ Nói nhanh tiếng Anh'}
            </p>
            <div className={`fw-bold mb-2 ${quizType === 'speakSentence' ? 'fs-5' : 'fs-2'}`} style={{ color: quizType === 'readAloud' ? '#1565C0' : '#388E3C' }}>
              {q.prompt}
            </div>
            {q.phonetic && quizType !== 'readAloud' && (
              <p className="text-muted small mb-2">{q.phonetic}</p>
            )}
            {q.meaning && quizType === 'readAloud' && (
              <p className="text-muted small mb-1">Nghĩa: {q.meaning}</p>
            )}
            {quizType === 'readAloud' && (
              <button className="btn btn-outline-info btn-sm mt-1" onClick={() => speakWord(q.expected)}>
                🔊 Nghe mẫu
              </button>
            )}
          </div>
        </div>

        {/* Mic section */}
        {!spkResult && speechRec.supported && (
          <div className="text-center mb-3">
            {speechRec.listening ? (
              <div>
                <div className="mb-2" style={{ fontSize: '3rem', animation: 'pulse 1s infinite' }}>🎤</div>
                <p className="text-danger fw-bold mb-2">Đang nghe... hãy nói rõ ràng!</p>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => speechRec.stop()}>Dừng</button>
              </div>
            ) : (
              <button className="btn btn-cowdi-primary btn-lg px-5" onClick={handleSpeak}>
                🎤 Bắt đầu nói
              </button>
            )}
          </div>
        )}

        {/* Result */}
        {spkResult && (
          <div className={`card shadow-sm mb-3 border-3 ${spkResult.correct ? 'border-success' : 'border-danger'}`}>
            <div className="card-body text-center py-3">
              <div className="fs-1 mb-1">{spkResult.correct ? '✅' : '❌'}</div>
              <p className="fw-bold mb-1 fs-5">{spkResult.correct ? 'Chính xác! 🎉' : 'Chưa đúng!'}</p>
              <p className="text-muted small mb-1">
                Bạn đã nói: &ldquo;<em>{spkResult.transcript || '(không nhận được giọng)'}</em>&rdquo;
              </p>
              {!spkResult.correct && (
                <p className="fw-bold text-success mb-1">Đáp án đúng: <span style={{ color: '#1565C0' }}>{q.expected}</span></p>
              )}
              <button className="btn btn-outline-info btn-sm mt-1" onClick={() => speakWord(q.expected)}>
                🔊 Nghe phát âm chuẩn
              </button>
            </div>
          </div>
        )}

        {spkResult && (
          <div className="text-center">
            <button className="btn btn-cowdi-primary btn-lg px-5" onClick={handleSpkNext}>
              {isLast ? 'Xem kết quả 🎉' : 'Tiếp theo →'}
            </button>
          </div>
        )}
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

      <div className="row g-2" key={qIndex}>
        {q.options.map((opt, i) => {
          let cls = 'btn w-100 quiz-option-btn';
          if (answered !== null) {
            cls += i === q.correct ? ' btn-success' : i === answered ? ' btn-danger' : ' btn-outline-secondary';
          } else {
            cls += ' btn-outline-primary';
          }
          return (
            <div className="col-12 col-md-6" key={`${qIndex}-${i}`}>
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

