import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import { usePet } from '../../../../hooks/usePet';
import { usePetDirector } from '../../../../pet-director/DirectorContext';
import { PetAvatar } from '../../../../pet-rig/PetAvatar';
import { speakWord, stopSpeaking as cancelSpeech } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';
import { REGIONS, REGION_COLOR } from '../../../../../shared/regions';
import { bossItems } from '../items';
import { createRng } from '../seededRandom';
import { applyBossDamage, evaluateBossOutcome } from './friendlyLogic';
import FriendlyFrame from './FriendlyFrame';
import FogBossSvg from './FogBossSvg';
import F03CatchWord from './F03CatchWord';

function buildGuestQuizQuestions(guestWords = [], vocabPool = [], rng) {
  const out = [];
  const allMeanings = [...new Set([...vocabPool, ...guestWords].map((w) => w?.meaning).filter(Boolean))];
  for (const g of guestWords.slice(0, 2)) {
    if (!g?.word || !g?.meaning) continue;
    const distractors = allMeanings.filter((m) => m !== g.meaning);
    for (let i = distractors.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
    }
    const opts = [g.meaning, ...distractors.slice(0, 3)];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    out.push({
      question: `Từ “${g.word}” có nghĩa là gì?`,
      audioText: g.word,
      options: opts,
      correct: opts.indexOf(g.meaning),
      targetWords: [getWordId(g)],
      skill: 'read',
      isGuest: true,
      explanation: `“${g.word}” nghĩa là “${g.meaning}”.`,
    });
  }
  return out;
}

/**
 * F-06 Boss sương mù (slot 'boss' — PHASE3 §2 F-06).
 * - 8–10 câu từ bossItems + 1–2 câu khách quen (không gộp vào bossScore chính).
 * - Pet HP trái (tối thiểu 10%), Boss HP phải. Combo 3 → kích hiệu ứng kỹ năng pet.
 * - Qua bài: Boss "tan biến" khi 100%, "bỏ chạy" khi chưa trọn.
 * - Chưa qua: Boss ở lại + 2 nút "Ôn từ sai" (chạy F-03 cho từ sai) và "Đánh lại".
 */
export default function F06FogBoss({
  lesson,
  items,
  rules,
  seed = 1,
  muted = false,
  play,
  onEvent,
  onDone,
  extra = {},
}) {
  const { getActivePetWithDecay } = usePet();
  const { dispatch } = usePetDirector();
  const activePet = getActivePetWithDecay();
  const defaultRate = rules?.ttsRate || 0.85;
  const passRate = rules?.lessonPassRate ?? 0.7;
  const region = extra.region || 'BD';
  const regionName = REGIONS[region]?.nameVi || 'Bến Đò Ông Tư';
  const regionColor = REGION_COLOR[region] || REGION_COLOR.BD;

  const startTimeRef = useRef(Date.now());
  const [attemptSeed, setAttemptSeed] = useState(seed);

  const questions = useMemo(() => {
    const rng = createRng(attemptSeed + 606);
    const base = (Array.isArray(items) && items.length > 0 ? items : bossItems(lesson)).slice(0, 10);
    const guestQs = buildGuestQuizQuestions(extra.guestWords || [], lesson?.vocabulary || [], rng);
    const combined = [
      ...base.map((q, i) => ({ ...q, _key: `b-${i}`, isGuest: false })),
      ...guestQs.map((q, i) => ({ ...q, _key: `g-${i}`, isGuest: true })),
    ];
    // Chèn guest ở vị trí giữa để nhịp boss tự nhiên
    if (guestQs.length > 0 && combined.length > 4) {
      const moved = combined.splice(base.length, guestQs.length);
      combined.splice(Math.min(3, combined.length), 0, moved[0]);
      if (moved[1]) combined.splice(Math.min(7, combined.length), 0, moved[1]);
    }
    return combined;
  }, [items, lesson, extra.guestWords, attemptSeed]);

  const lessonTotal = useMemo(() => questions.filter((q) => !q.isGuest).length, [questions]);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [petHp, setPetHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [bossAnim, setBossAnim] = useState('idle');
  const [skillFlash, setSkillFlash] = useState(false);
  const [combo, setCombo] = useState(0);
  const [lessonCorrect, setLessonCorrect] = useState(0);
  const [guestTotal, setGuestTotal] = useState(0);
  const [guestCorrect, setGuestCorrect] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [missedWordIds, setMissedWordIds] = useState([]);
  const [battleEnd, setBattleEnd] = useState(null); // null | { passed, perfect, bossState }
  const [reviewWrongMode, setReviewWrongMode] = useState(false);
  const [petText, setPetText] = useState(`Boss Sương ${regionName} xuất hiện! Trả lời đúng để giải sương nhé!`);
  const [petTone, setPetTone] = useState('neutral');

  const current = questions[qIdx] || null;

  useEffect(() => {
    dispatch('battle_start', { lessonId: lesson?.id, region });
  }, [dispatch, lesson?.id, region]);

  useEffect(() => {
    if (!current || battleEnd || reviewWrongMode) return undefined;
    setPicked(null);
    onEvent?.('item_shown', {
      itemId: current._key,
      wordIds: current.targetWords || [],
      skill: current.skill || 'read',
    });
    if (!muted && current.audioText) {
      const t = setTimeout(() => {
        speakWord(current.audioText, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }, 240);
      return () => { clearTimeout(t); cancelSpeech(); };
    }
    return undefined;
  }, [qIdx, current?._key, battleEnd, reviewWrongMode, muted, defaultRate, onEvent]);

  const finishAndEmit = useCallback((finalLessonCorrect, finalGuestTotal, finalGuestCorrect, finalWrongAnswers) => {
    const outcome = evaluateBossOutcome({ score: finalLessonCorrect, total: lessonTotal, passRate });
    setBattleEnd(outcome);
    if (outcome.passed) {
      setBossAnim(outcome.bossState); // 'dissolve' | 'flee'
      setPetTone('good');
      setPetText(
        outcome.perfect
          ? `Trọn điểm! Boss Sương ${regionName} đã tan biến hoàn toàn!`
          : `Đạt rồi! Boss Sương ${regionName} phải bỏ chạy rồi!`
      );
      dispatch('battle_win', { lessonId: lesson?.id, perfect: outcome.perfect });
      setTimeout(() => {
        onDone?.({
          code: 'F-06',
          slot: 'boss',
          total: lessonTotal,
          firstTryCorrect: finalLessonCorrect,
          score: finalLessonCorrect,
          guestTotal: finalGuestTotal,
          guestCorrect: finalGuestCorrect,
          wrongAnswers: finalWrongAnswers,
          durationMs: Date.now() - startTimeRef.current,
        });
      }, 950);
    } else {
      setBossAnim('idle');
      setPetTone('hint');
      setPetText(`Sương vẫn còn dày (cần ≥${Math.round(passRate * 100)}%). Ôn các từ vừa sai rồi đánh lại nha!`);
      dispatch('battle_lose', { lessonId: lesson?.id });
    }
  }, [lessonTotal, passRate, regionName, dispatch, lesson?.id, onDone]);

  const advanceNext = useCallback((nextLessonCorrect, nextGuestTotal, nextGuestCorrect, nextWrongAnswers) => {
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
    } else {
      finishAndEmit(nextLessonCorrect, nextGuestTotal, nextGuestCorrect, nextWrongAnswers);
    }
  }, [qIdx, questions.length, finishAndEmit]);

  const handlePickOption = (optIdx) => {
    if (!current || picked !== null || battleEnd) return;
    setPicked(optIdx);
    const isCorrect = optIdx === current.correct;
    const dmg = applyBossDamage({
      petHp,
      bossHp,
      isCorrect,
      totalQuestions: questions.length,
    });
    setPetHp(dmg.petHp);
    setBossHp(dmg.bossHp);

    const nextLessonCorrect = lessonCorrect + (!current.isGuest && isCorrect ? 1 : 0);
    const nextGuestTotal = guestTotal + (current.isGuest ? 1 : 0);
    const nextGuestCorrect = guestCorrect + (current.isGuest && isCorrect ? 1 : 0);
    let nextWrongAnswers = wrongAnswers;

    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setLessonCorrect(nextLessonCorrect);
      setGuestTotal(nextGuestTotal);
      setGuestCorrect(nextGuestCorrect);
      setBossAnim('hit');
      setTimeout(() => setBossAnim('idle'), 380);

      if (nextCombo >= 3 && nextCombo % 3 === 0) {
        setSkillFlash(true);
        play?.('combo');
        setTimeout(() => setSkillFlash(false), 500);
        setPetText(`⚡ Combo ${nextCombo}! Kỹ năng pet đánh tan một mảng sương lớn!`);
      } else {
        play?.('bossHit');
        setPetText('Chính xác! Pet vừa tung đòn đẩy lùi sương mù!');
      }
      setPetTone('good');
      dispatch('battle_hit', { combo: nextCombo });
      onEvent?.('item_correct', {
        itemId: current._key,
        wordIds: current.targetWords || [],
        skill: current.skill || 'read',
        isGuest: Boolean(current.isGuest),
      });
      setTimeout(() => advanceNext(nextLessonCorrect, nextGuestTotal, nextGuestCorrect, nextWrongAnswers), 1200);
    } else {
      setCombo(0);
      setGuestTotal(nextGuestTotal);
      play?.('bossFog');
      setPetTone('hint');
      const correctTxt = current.options?.[current.correct] || '';
      setPetText(`Boss phun sương rồi! Đáp án đúng là “${correctTxt}”. Chạm Tiếp để phản công!`);
      nextWrongAnswers = [
        ...wrongAnswers,
        {
          question: current.question,
          picked: current.options?.[optIdx] || '',
          correct: correctTxt,
          explanation: current.explanation || '',
        },
      ];
      setWrongAnswers(nextWrongAnswers);
      if (Array.isArray(current.targetWords) && current.targetWords.length > 0) {
        setMissedWordIds((prev) => [...new Set([...prev, ...current.targetWords])]);
      }
      dispatch('battle_hurt', {});
      onEvent?.('item_wrong', {
        itemId: current._key,
        wordIds: current.targetWords || [],
        correct: correctTxt,
        skill: current.skill || 'read',
        isGuest: Boolean(current.isGuest),
      });
    }
  };

  const resetBattle = () => {
    setAttemptSeed((s) => s + 17);
    setQIdx(0);
    setPicked(null);
    setPetHp(100);
    setBossHp(100);
    setBossAnim('idle');
    setCombo(0);
    setLessonCorrect(0);
    setGuestTotal(0);
    setGuestCorrect(0);
    setWrongAnswers([]);
    setMissedWordIds([]);
    setBattleEnd(null);
    setReviewWrongMode(false);
    setPetTone('neutral');
    setPetText(`Tái đấu Boss Sương ${regionName}! Cố lên nha!`);
  };

  // Chế độ "Ôn từ sai" → chạy F-03 cho các từ vừa sai rồi quay lại đánh lại Boss
  if (reviewWrongMode) {
    const missedVocab = (lesson?.vocabulary || []).filter((v) => missedWordIds.includes(getWordId(v)));
    const fallbackVocab = missedVocab.length > 0 ? missedVocab : (lesson?.vocabulary || []).slice(0, 4);
    return (
      <F03CatchWord
        lesson={lesson}
        rules={rules}
        seed={attemptSeed + 55}
        muted={muted}
        play={play}
        onEvent={onEvent}
        customWords={fallbackVocab}
        onDone={() => resetBattle()}
      />
    );
  }

  return (
    <FriendlyFrame
      skill="boss"
      title={`Boss Sương ${regionName}`}
      code="F-06"
      counter={`Câu ${Math.min(qIdx + 1, questions.length)}/${questions.length}`}
      extraRight={combo >= 3 ? <span className="ff-combo-chip">⚡ {combo} liền!</span> : null}
      petText={petText}
      petTone={petTone}
    >
      {/* Khung trận: HP Pet trái · Boss Sương phải */}
      <div
        className="ff-boss-stage"
        style={{ background: `linear-gradient(180deg, ${regionColor.sky} 0%, ${regionColor.ground} 100%)` }}
      >
        {skillFlash && <div className="ff-skill-flash" aria-hidden="true" />}

        <div className="text-center">
          <div className="d-flex justify-content-center" style={{ height: 84 }}>
            <PetAvatar
              petId={activePet?.speciesId || 'cowdi'}
              stage={(activePet?.evolution ?? 0) + 1}
              mode="battle"
              canvasBubble={false}
              style={{ width: 82, height: 82 }}
            />
          </div>
          <div className="d-flex justify-content-between small fw-bold px-1">
            <span>{activePet?.customName || 'Cowdi'}</span>
            <span>{Math.round(petHp)}%</span>
          </div>
          <div className="ff-hp-bar" aria-label={`HP Pet ${Math.round(petHp)}%`}>
            <div className="ff-hp-fill" style={{ width: `${petHp}%`, background: '#22C55E' }} />
          </div>
        </div>

        <div className="text-center">
          <div className="d-flex justify-content-center align-items-center" style={{ height: 84 }}>
            <FogBossSvg region={region} animState={bossAnim} size={96} />
          </div>
          <div className="d-flex justify-content-between small fw-bold px-1">
            <span>Boss Sương</span>
            <span>{Math.round(bossHp)}%</span>
          </div>
          <div className="ff-hp-bar" aria-label={`HP Boss ${Math.round(bossHp)}%`}>
            <div className="ff-hp-fill" style={{ width: `${bossHp}%`, background: '#64748B' }} />
          </div>
        </div>
      </div>

      {/* Khi chưa đạt ngưỡng → cho ôn từ sai (F-03) hoặc đánh lại */}
      {battleEnd && !battleEnd.passed ? (
        <div className="ff-card text-center">
          <h5 className="fw-bold mb-1">Chưa giải được hết sương!</h5>
          <p className="small text-muted mb-3">
            Bạn đúng <strong>{lessonCorrect}/{lessonTotal}</strong> câu chính (cần ≥{Math.round(passRate * 100)}%).
          </p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <button
              type="button"
              className="btn btn-warning ff-tap-btn px-3"
              onClick={() => setReviewWrongMode(true)}
            >
              🌿 Ôn từ sai (F-03)
            </button>
            <button
              type="button"
              className="btn btn-cowdi-primary ff-tap-btn px-3"
              onClick={resetBattle}
            >
              ⚔️ Đánh lại
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary ff-tap-btn px-3"
              onClick={() => onDone?.({
                code: 'F-06',
                slot: 'boss',
                total: lessonTotal,
                firstTryCorrect: lessonCorrect,
                score: lessonCorrect,
                guestTotal,
                guestCorrect,
                wrongAnswers,
                durationMs: Date.now() - startTimeRef.current,
              })}
            >
              Xem tổng kết
            </button>
          </div>
        </div>
      ) : current && !battleEnd ? (
        <>
          <div className="ff-card">
            <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
              {current.isGuest ? (
                <span className="ff-guest-badge">🌿 khách quen</span>
              ) : (
                <span className="small text-muted">Câu hỏi Boss</span>
              )}
              {current.audioText && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill"
                  onClick={() => speakWord(current.audioText, { rate: defaultRate, lang: 'en-US' }).catch(() => {})}
                >
                  <Icon name="sound" size={14} /> Nghe
                </button>
              )}
            </div>
            <div className="fw-bold" style={{ fontSize: '1.15rem', color: '#4A3420' }}>
              {current.question}
            </div>
          </div>

          <div className="row g-2">
            {(current.options || []).map((opt, oi) => {
              let cls = 'btn w-100 text-start ff-tap-btn ';
              if (picked !== null) {
                if (oi === current.correct) cls += 'btn-success';
                else if (oi === picked) cls += 'btn-danger';
                else cls += 'btn-outline-secondary';
              } else {
                cls += 'btn-outline-dark bg-white';
              }
              return (
                <div className="col-12 col-sm-6" key={oi}>
                  <button
                    type="button"
                    className={cls}
                    style={{ fontSize: '1.02rem' }}
                    disabled={picked !== null}
                    onClick={() => handlePickOption(oi)}
                  >
                    <strong className="me-1">{String.fromCharCode(65 + oi)}.</strong> {opt}
                  </button>
                </div>
              );
            })}
          </div>

          {picked !== null && picked !== current.correct && (
            <div className="d-flex justify-content-between align-items-center gap-2 p-2 rounded-3" style={{ background: '#FEF3C7', border: '1.5px solid #F59E0B' }}>
              <div className="small">
                Đáp án đúng: <strong>{current.options?.[current.correct]}</strong>
                {current.explanation && <div className="text-muted">{current.explanation}</div>}
              </div>
              <button
                type="button"
                className="btn btn-cowdi-primary ff-tap-btn px-3"
                onClick={() => advanceNext(lessonCorrect, guestTotal, guestCorrect, wrongAnswers)}
              >
                Tiếp →
              </button>
            </div>
          )}
        </>
      ) : null}
    </FriendlyFrame>
  );
}
