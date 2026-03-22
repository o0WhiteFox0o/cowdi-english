import { useState, useMemo, useCallback } from 'react';
import { LESSONS } from '../data/lessons';
import { VOCAB_TOPICS, getTopicWordCount } from '../data/vocab-topics';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { useToast } from '../components/Toast';

// ── Views: topics → subtopics → words (flashcard / list) ──────────────
export default function VocabularyPage() {
  const { userData, setWordStatus, getWordStatus } = useUser();
  const { onVocabReview } = usePet();
  const showToast = useToast();

  // Navigation state
  const [view, setView] = useState('topics');       // topics | subtopics | words
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  // Word view state
  const [mode, setMode] = useState('flashcard');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [search, setSearch] = useState('');

  // Lesson-based words (original)
  const lessonWords = useMemo(() => LESSONS.flatMap((l) => l.vocabulary), []);

  // Topic-based total word count
  const topicWordCount = useMemo(() => getTopicWordCount(), []);

  // Current word list for word view
  const activeWords = useMemo(() => {
    if (view === 'words' && selectedSub) return selectedSub.words;
    return [];
  }, [view, selectedSub]);

  const filteredWords = useMemo(() => {
    if (!search) return activeWords;
    const s = search.toLowerCase();
    return activeWords.filter(
      (w) => w.word.toLowerCase().includes(s) || w.meaning.toLowerCase().includes(s)
    );
  }, [activeWords, search]);

  const currentWord = filteredWords[cardIndex] || filteredWords[0];

  // Progress helpers
  const getSubtopicProgress = useCallback((sub) => {
    const learned = sub.words.filter((w) => getWordStatus(w.word) === 'learned').length;
    return { learned, total: sub.words.length };
  }, [getWordStatus]);

  const getTopicProgress = useCallback((topic) => {
    let learned = 0, total = 0;
    topic.subtopics.forEach((sub) => {
      const p = getSubtopicProgress(sub);
      learned += p.learned;
      total += p.total;
    });
    return { learned, total };
  }, [getSubtopicProgress]);

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }, []);

  function openTopic(topic) {
    setSelectedTopic(topic);
    setSelectedSub(null);
    setView('subtopics');
  }

  function openSubtopic(sub) {
    setSelectedSub(sub);
    setCardIndex(0);
    setFlipped(false);
    setSearch('');
    setView('words');
  }

  function goBack() {
    if (view === 'words') {
      setSelectedSub(null);
      setView('subtopics');
    } else if (view === 'subtopics') {
      setSelectedTopic(null);
      setView('topics');
    }
  }

  function nextCard() {
    setFlipped(false);
    setCardIndex((i) => (i + 1) % filteredWords.length);
  }

  function prevCard() {
    setFlipped(false);
    setCardIndex((i) => (i - 1 + filteredWords.length) % filteredWords.length);
  }

  function markWord(word, status) {
    setWordStatus(word, status);
    onVocabReview();
    showToast(
      status === 'learned' ? `Đã đánh dấu "${word}" là đã thuộc! ✅` : `Đã đánh dấu "${word}" cần ôn lại 📝`,
      'success'
    );
  }

  // ─── Topics Mind Map ───────────────────────────────────────────────────
  if (view === 'topics') {
    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <h2 className="fw-bold">
            <i className="fas fa-language text-cowdi me-2"></i>Từ vựng
          </h2>
          <p className="text-muted">
            {topicWordCount + lessonWords.length} từ ({VOCAB_TOPICS.length} chủ đề + {lessonWords.length} từ bài học) | Đã thuộc: {userData.wordsLearned}
          </p>
        </div>

        {/* Mind map visual */}
        <div className="vocab-mindmap mb-4">
          <div className="mindmap-center">
            <div className="mindmap-hub">🧠<br /><small>Từ vựng</small></div>
          </div>
          <div className="mindmap-branches">
            {VOCAB_TOPICS.map((topic) => {
              const progress = getTopicProgress(topic);
              const pct = progress.total > 0 ? Math.round((progress.learned / progress.total) * 100) : 0;
              return (
                <div
                  key={topic.id}
                  className="mindmap-node"
                  style={{ '--node-color': topic.color }}
                  onClick={() => openTopic(topic)}
                >
                  <div className="mindmap-node-icon">{topic.icon}</div>
                  <div className="mindmap-node-label">{topic.name}</div>
                  <div className="mindmap-node-sub">{topic.nameVi}</div>
                  <div className="mindmap-node-count">{progress.total} từ</div>
                  <div className="mindmap-progress">
                    <div className="mindmap-progress-bar" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lesson vocab quick access */}
        <div className="card shadow-sm">
          <div className="card-body text-center">
            <h5 className="fw-bold mb-2">📚 Từ vựng bài học</h5>
            <p className="text-muted small mb-0">{lessonWords.length} từ từ {LESSONS.length} bài học</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Subtopics View ────────────────────────────────────────────────────
  if (view === 'subtopics' && selectedTopic) {
    const topicProgress = getTopicProgress(selectedTopic);
    return (
      <div className="fade-in">
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={goBack}>
          ⬅️ Quay lại
        </button>

        <div className="text-center mb-4">
          <div style={{ fontSize: '3rem' }}>{selectedTopic.icon}</div>
          <h2 className="fw-bold" style={{ color: selectedTopic.color }}>
            {selectedTopic.name}
          </h2>
          <p className="text-muted">{selectedTopic.description}</p>
          <p className="text-muted small">
            {topicProgress.learned} / {topicProgress.total} từ đã thuộc
          </p>
          <div className="progress mx-auto" style={{ maxWidth: 300, height: 8 }}>
            <div
              className="progress-bar"
              style={{
                width: `${topicProgress.total > 0 ? (topicProgress.learned / topicProgress.total) * 100 : 0}%`,
                backgroundColor: selectedTopic.color,
              }}
            ></div>
          </div>
        </div>

        <div className="row g-3">
          {selectedTopic.subtopics.map((sub) => {
            const prog = getSubtopicProgress(sub);
            const pct = prog.total > 0 ? Math.round((prog.learned / prog.total) * 100) : 0;
            return (
              <div className="col-6 col-md-4" key={sub.id}>
                <div
                  className="card shadow-sm h-100 subtopic-card"
                  style={{ cursor: 'pointer', borderLeft: `4px solid ${selectedTopic.color}` }}
                  onClick={() => openSubtopic(sub)}
                >
                  <div className="card-body text-center py-3">
                    <div style={{ fontSize: '2rem' }}>{sub.icon}</div>
                    <h6 className="fw-bold mb-1">{sub.name}</h6>
                    <small className="text-muted d-block">{sub.nameVi}</small>
                    <span className="badge bg-light text-dark mt-2">{prog.total} từ</span>
                    <div className="progress mt-2" style={{ height: 5 }}>
                      <div
                        className="progress-bar"
                        style={{ width: `${pct}%`, backgroundColor: selectedTopic.color }}
                      ></div>
                    </div>
                    {pct > 0 && <small className="text-muted">{pct}%</small>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Words View (flashcard / list) ─────────────────────────────────────
  return (
    <div className="fade-in">
      <button className="btn btn-sm btn-outline-secondary mb-3" onClick={goBack}>
        ⬅️ Quay lại
      </button>

      <div className="text-center mb-3">
        <div style={{ fontSize: '2rem' }}>{selectedSub?.icon}</div>
        <h3 className="fw-bold">{selectedSub?.name}</h3>
        <p className="text-muted small">{selectedSub?.nameVi} — {filteredWords.length} từ</p>
      </div>

      {/* Controls */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="btn-group">
          <button
            className={`btn btn-sm ${mode === 'flashcard' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setMode('flashcard')}
          >
            🃏 Flashcard
          </button>
          <button
            className={`btn btn-sm ${mode === 'list' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setMode('list')}
          >
            📋 Danh sách
          </button>
        </div>
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: '280px' }}
          placeholder="🔍 Tìm từ vựng..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCardIndex(0); setFlipped(false); }}
        />
      </div>

      {/* Flashcard mode */}
      {mode === 'flashcard' && currentWord && (
        <div className="text-center">
          <div
            className="flashcard-wrapper mx-auto mb-3"
            onClick={() => setFlipped(!flipped)}
          >
            <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
              <div className="flashcard-front">
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{currentWord.illustration}</div>
                <h2 className="mb-2">{currentWord.word}</h2>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>{currentWord.phonetic}</p>
                <button
                  className="btn btn-sm btn-light mb-2"
                  onClick={(e) => { e.stopPropagation(); speakWord(currentWord.word); }}
                >
                  🔊
                </button>
                <small style={{ color: 'rgba(255,255,255,0.6)' }}>Nhấn để lật thẻ</small>
              </div>
              <div className="flashcard-back">
                <h2 className="text-cowdi-primary mb-2">{currentWord.meaning}</h2>
                <p className="fst-italic text-muted">"{currentWord.example}"</p>
                <small className="text-muted">Nhấn để lật lại</small>
              </div>
            </div>
          </div>

          <p className="text-muted mb-3">{cardIndex + 1} / {filteredWords.length}</p>

          <div className="d-flex justify-content-center gap-3 mb-3">
            <button className="btn btn-outline-secondary" onClick={prevCard}>⬅️ Trước</button>
            <button className="btn btn-outline-secondary" onClick={nextCard}>Sau ➡️</button>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-success fw-bold" onClick={() => markWord(currentWord.word, 'learned')}>
              ✅ Đã thuộc
            </button>
            <button className="btn btn-warning fw-bold" onClick={() => markWord(currentWord.word, 'learning')}>
              📝 Đang học
            </button>
          </div>
        </div>
      )}

      {/* List mode */}
      {mode === 'list' && (
        <div className="row g-2">
          {filteredWords.map((w) => {
            const status = getWordStatus(w.word);
            return (
              <div className="col-12" key={w.word}>
                <div className={`card shadow-sm ${status === 'learned' ? 'border-success' : status === 'learning' ? 'border-warning' : ''}`}>
                  <div className="card-body d-flex align-items-start gap-3 flex-wrap py-2">
                    <div className="me-2" style={{ fontSize: '1.5rem' }}>{w.illustration}</div>
                    <div className="flex-grow-1">
                      <span className="fw-bold text-cowdi-primary me-2">{w.word}</span>
                      <span className="text-muted font-monospace small me-2">{w.phonetic}</span>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => speakWord(w.word)}>🔊</button>
                      <div className="mt-1">{w.meaning}</div>
                      <div className="text-muted small fst-italic">{w.example}</div>
                    </div>
                    <div className="d-flex gap-2 align-self-center">
                      <button
                        className={`btn btn-sm ${status === 'learned' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => markWord(w.word, 'learned')}
                        title="Đã thuộc"
                      >✅</button>
                      <button
                        className={`btn btn-sm ${status === 'learning' ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => markWord(w.word, 'learning')}
                        title="Đang học"
                      >📝</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

