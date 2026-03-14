import { useState, useMemo, useCallback } from 'react';
import { LESSONS } from '../data/lessons';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { useToast } from '../components/Toast';

export default function VocabularyPage() {
  const { userData, setWordStatus, getWordStatus } = useUser();
  const { onVocabReview } = usePet();
  const showToast = useToast();
  const [mode, setMode] = useState('flashcard');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [search, setSearch] = useState('');

  const allWords = useMemo(() => LESSONS.flatMap((l) => l.vocabulary), []);

  const filteredWords = useMemo(() => {
    if (!search) return allWords;
    const s = search.toLowerCase();
    return allWords.filter(
      (w) => w.word.toLowerCase().includes(s) || w.meaning.toLowerCase().includes(s)
    );
  }, [allWords, search]);

  const currentWord = filteredWords[cardIndex] || filteredWords[0];

  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }, []);

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

  return (
    <div className="fade-in">
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          <i className="fas fa-language text-cowdi me-2"></i>Từ vựng
        </h2>
        <p className="text-muted">
          Tổng cộng {allWords.length} từ | Đã thuộc: {userData.wordsLearned}
        </p>
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

