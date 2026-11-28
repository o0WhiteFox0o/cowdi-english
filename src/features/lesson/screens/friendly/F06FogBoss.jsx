import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Icon from '../../../../components/Icon';
import { PetAvatar, bondOf, topSkillOf } from '../../../../pet-rig/PetAvatar';
import { usePet } from '../../../../hooks/usePet';
import { usePetDirector } from '../../../../pet-director/DirectorContext';
import { PET_REGISTRY, ELEMENT_COLORS } from '../../../../data/pets';
import { speakWord, stopSpeaking as cancelSpeech } from '../../../../utils/speech';
import { getWordId } from '../../../vocab/wordProgress';
import { REGIONS } from '../../../../../shared/regions';
import { getScreenTitle } from '../../../../../shared/screen-scenarios';
import { bossFogLevel } from '../../../../../shared/story-season2';
import { resolveLessonStory } from '../../story/resolveStory';
import { bossItems } from '../items';
import { createRng } from '../seededRandom';
import { applyBossDamage, evaluateBossOutcome } from './friendlyLogic';
import FriendlyFrame from './FriendlyFrame';
import FogBossSvg from './FogBossSvg';
import F03CatchWord from './F03CatchWord';
import ScreenActionModal from '../ScreenActionModal';
import '../../../../styles/arena.css';

const ELEMENT_COLOR_HEX = {
  metal: '#E8C46A',
  wood: '#7FB05A',
  water: '#6FB3D9',
  fire: '#F08A5D',
  earth: '#B98D5E',
  dark: '#6B6BAA',
  light: '#F5D97A',
  neutral: '#94A3B8',
  wind: '#8FD1C4',
  thunder: '#9B8CE0',
};

function hpBarColor(hp) {
  if (hp > 50) return '#22C55E';
  if (hp > 25) return '#F59E0B';
  return '#EF4444';
}

function buildGuestQuizQuestions(guestWords = [], vocabPool = [], rng) {
  const out = [];
  const allMeanings = [...new Set([...vocabPool, ...guestWords].map((w) => w?.meaning).filter(Boolean))];
  for (const g of guestWords.slice(0, 2)) {
    if (!g?.word || !g?.meaning) continue;
    const wrong = allMeanings.filter((m) => m !== g.meaning);
    if (wrong.length < 3) continue;
    const picks = [];
    const pool = [...wrong];
    while (picks.length < 3 && pool.length > 0) {
      const idx = Math.floor(rng() * pool.length);
      picks.push(pool.splice(idx, 1)[0]);
    }
    const opts = [g.meaning, ...picks];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    out.push({
      question: `“${g.word}” có nghĩa là gì?`,
      options: opts,
      correct: opts.indexOf(g.meaning),
      explanation: `${g.word} = ${g.meaning}`,
      targetWords: [getWordId(g)],
      isGuest: true,
    });
  }
  return out;
}

/**
 * F-06 Giải sương Boss (slot 'boss'):
 * Dùng chung sân đấu Đấu trường (mây trời, đồi cỏ, HUD HP/Hệ, hoạt ảnh tấn công & sát thương)
 * + lớp sương mù quanh Boss tan dần theo HP.
 */
export default function F06FogBoss({
  lesson,
  items = [],
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
  const region = extra.region || 'BD';
  const regionName = REGIONS[region]?.nameVi || 'Bến Đò Ông Tư';
  const companionId = activePet?.speciesId || 'cowdi';
  const companionC = (activePet?.evolution ?? activePet?.stage ?? 0) + 1;
  const companionName = activePet?.customName || PET_REGISTRY[companionId]?.name || 'Cowdi';
  const mySpecies = PET_REGISTRY[companionId] || null;
  const myElement = mySpecies?.element || 'neutral';

  const resolvedStory = useMemo(
    () =>
      resolveLessonStory({
        lesson,
        unitId: extra.unitId || null,
        region,
        companionId,
        companionC,
        companionName,
      }),
    [lesson, extra.unitId, region, companionId, companionC, companionName],
  );
  const storyBoss = resolvedStory.boss;
  const bossSpecies = storyBoss?.id ? PET_REGISTRY[storyBoss.id] : null;
  const bossElement = bossSpecies?.element || 'dark';

  const baseFogOpacity = useMemo(() => {
    if (!storyBoss) return 0.7;
    if (resolvedStory.isSeason2 && resolvedStory.unitId) {
      return bossFogLevel(
        resolvedStory.unitId,
        extra.completedLessons || [],
        Boolean(extra.checkpointPassed),
      );
    }
    return 0.7;
  }, [storyBoss, resolvedStory.isSeason2, resolvedStory.unitId, extra.completedLessons, extra.checkpointPassed]);

  const hitIdxRef = useRef(0);
  const wrongIdxRef = useRef(0);
  const animTimerRef = useRef(null);
  const defaultRate = rules?.ttsRate || 0.85;
  const passRate = rules?.lessonPassRate ?? 0.7;

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
  const [battleAnim, setBattleAnim] = useState(null);
  const [effectClass, setEffectClass] = useState(null);
  const [damagePopup, setDamagePopup] = useState(null);
  const [combo, setCombo] = useState(0);
  const [lessonCorrect, setLessonCorrect] = useState(0);
  const [guestTotal, setGuestTotal] = useState(0);
  const [guestCorrect, setGuestCorrect] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [missedWordIds, setMissedWordIds] = useState([]);
  const [battleEnd, setBattleEnd] = useState(null);
  const [reviewWrongMode, setReviewWrongMode] = useState(false);
  const [petText, setPetText] = useState(
    storyBoss?.lines?.enter?.vi || `Boss Sương ${regionName} xuất hiện! Trả lời đúng để giải sương nhé!`,
  );
  const [petTone, setPetTone] = useState('neutral');

  const current = questions[qIdx] || null;
  // Sương mù mỏng dần theo lượng máu còn lại của Boss
  const liveFogOpacity = battleEnd?.passed
    ? 0.08
    : Math.max(0.15, Math.min(0.85, baseFogOpacity * (0.35 + (bossHp / 100) * 0.65)));

  useEffect(() => () => clearTimeout(animTimerRef.current), []);

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
    const qAudio = current.audioText || current.speak || '';
    if (!muted && qAudio) {
      const t = setTimeout(() => {
        speakWord(qAudio, { rate: defaultRate, lang: 'en-US' }).catch(() => {});
      }, 240);
      return () => { clearTimeout(t); cancelSpeech(); };
    }
    return undefined;
  }, [qIdx, current?._key, battleEnd, reviewWrongMode, muted, defaultRate, onEvent]);

  const finishAndEmit = useCallback((finalLessonCorrect, finalGuestTotal, finalGuestCorrect, finalWrongAnswers) => {
    const outcome = evaluateBossOutcome({ score: finalLessonCorrect, total: lessonTotal, passRate });
    setBattleEnd(outcome);
    if (outcome.passed) {
      setBossAnim(outcome.bossState);
      setPetTone('good');
      setPetText(
        storyBoss?.lines?.retreat?.vi ||
        (outcome.perfect
          ? `Trọn điểm! Boss Sương ${regionName} đã tan biến hoàn toàn!`
          : `Đạt rồi! Boss Sương ${regionName} phải bỏ chạy rồi!`)
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
      setPetText(
        storyBoss?.lines?.fail?.vi ||
        `Sương vẫn còn dày (cần ≥${Math.round(passRate * 100)}%). Ôn các từ vừa sai rồi đánh lại nha!`
      );
      dispatch('battle_lose', { lessonId: lesson?.id });
    }
  }, [lessonTotal, passRate, regionName, storyBoss, dispatch, lesson?.id, onDone]);

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

    const nextLessonCorrect = lessonCorrect + (!current.isGuest && isCorrect ? 1 : 0);
    const nextGuestTotal = guestTotal + (current.isGuest ? 1 : 0);
    const nextGuestCorrect = guestCorrect + (current.isGuest && isCorrect ? 1 : 0);
    let nextWrongAnswers = wrongAnswers;

    if (isCorrect) {
      const nextCombo = combo + 1;
      const isCrit = nextCombo >= 3 && nextCombo % 3 === 0;
      const dealt = Math.max(5, Math.round(bossHp - dmg.bossHp));
      setCombo(nextCombo);
      setLessonCorrect(nextLessonCorrect);
      setGuestTotal(nextGuestTotal);
      setGuestCorrect(nextGuestCorrect);

      // Hoạt ảnh tấn công giống Đấu trường
      setBattleAnim('attack-mine');
      play?.('battleAttack');
      clearTimeout(animTimerRef.current);
      animTimerRef.current = setTimeout(() => {
        setBattleAnim('damage-opponent');
        setBossAnim('hit');
        setBossHp(dmg.bossHp);
        setEffectClass(`effect-${myElement}`);
        setDamagePopup({ target: 'opponent', amount: dealt, isCritical: isCrit });
        if (isCrit) play?.('combo');
        else play?.('bossHit');

        animTimerRef.current = setTimeout(() => {
          setBattleAnim(null);
          setBossAnim('idle');
          setEffectClass(null);
          setDamagePopup(null);
          advanceNext(nextLessonCorrect, nextGuestTotal, nextGuestCorrect, nextWrongAnswers);
        }, 620);
      }, 280);

      const hitLines = storyBoss?.lines?.hit;
      const storyHitText = Array.isArray(hitLines) && hitLines.length > 0
        ? hitLines[hitIdxRef.current++ % hitLines.length]?.vi
        : null;

      setPetText(
        isCrit
          ? (storyHitText || `⚡ Combo ${nextCombo}! Đòn chí mạng đánh tan một mảng sương lớn!`)
          : (storyHitText || 'Chính xác! Pet vừa tung đòn đẩy lùi sương mù!')
      );
      setPetTone('good');
      dispatch('battle_hit', { combo: nextCombo });
      onEvent?.('item_correct', {
        itemId: current._key,
        wordIds: current.targetWords || [],
        skill: current.skill || 'read',
        isGuest: Boolean(current.isGuest),
      });
    } else {
      const taken = Math.max(5, Math.round(petHp - dmg.petHp));
      setCombo(0);
      setGuestTotal(nextGuestTotal);

      setBattleAnim('attack-opponent');
      play?.('bossFog');
      clearTimeout(animTimerRef.current);
      animTimerRef.current = setTimeout(() => {
        setBattleAnim('damage-mine');
        setPetHp(dmg.petHp);
        setEffectClass(`effect-${bossElement}`);
        setDamagePopup({ target: 'mine', amount: taken, isCritical: false });

        animTimerRef.current = setTimeout(() => {
          setBattleAnim(null);
          setEffectClass(null);
          setDamagePopup(null);
        }, 560);
      }, 280);

      setPetTone('hint');
      const correctTxt = current.options?.[current.correct] || '';
      const wrongLines = storyBoss?.lines?.wrong;
      const storyWrongText = Array.isArray(wrongLines) && wrongLines.length > 0
        ? wrongLines[wrongIdxRef.current++ % wrongLines.length]?.vi
        : null;
      setPetText(storyWrongText || `Boss phản công rồi! Đáp án đúng là “${correctTxt}”. Chạm Câu tiếp để phản công!`);
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
    clearTimeout(animTimerRef.current);
    setAttemptSeed((s) => s + 17);
    setQIdx(0);
    setPicked(null);
    setPetHp(100);
    setBossHp(100);
    setBossAnim('idle');
    setBattleAnim(null);
    setEffectClass(null);
    setDamagePopup(null);
    setCombo(0);
    setLessonCorrect(0);
    setGuestTotal(0);
    setGuestCorrect(0);
    setWrongAnswers([]);
    setMissedWordIds([]);
    setBattleEnd(null);
    setReviewWrongMode(false);
    setPetTone('neutral');
    setPetText(storyBoss ? `Tái đấu Legendary ${storyBoss.name}! Cố lên nha!` : `Tái đấu Boss Sương ${regionName}! Cố lên nha!`);
  };

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

  const qAudio = current?.audioText || current?.speak || '';

  return (
    <FriendlyFrame
      skill="boss"
      title={storyBoss ? `Boss: Legendary ${storyBoss.name}` : getScreenTitle('F-06', region, `Boss ${regionName}`)}
      code="F-06"
      counter={`${Math.min(qIdx + 1, questions.length)}/${questions.length}`}
      extraRight={combo >= 2 ? <span className="ff-combo-chip">🔥 Combo x{combo}</span> : null}
      petText={petText}
      petTone={petTone}
    >
      {/* ── Sân Đấu Trường Boss (đồi cỏ, mây trời, HUD 2 bên, hoạt ảnh chiến đấu & sương tan) ── */}
      <div className="arena-battlefield arena-battlefield--boss mb-1">
        <div className="arena-sun" />
        <div className="arena-cloud arena-cloud-1" />
        <div className="arena-cloud arena-cloud-2" />
        <div className="arena-hill-opponent" />
        <div className="arena-hill-mine" />

        {effectClass && <div className={`battle-effect ${effectClass}`} />}
        {damagePopup?.isCritical && <div className="battle-effect effect-critical" />}

        {/* HUD Phe mình (Trái trên) */}
        <div className="arena-hud-card arena-hud-mine">
          <div className="arena-hud-header">
            <div className="arena-pet-title">
              <span>{companionName}</span>
              <span className="arena-elem-badge" style={{ backgroundColor: ELEMENT_COLOR_HEX[myElement] || '#94A3B8' }}>
                {ELEMENT_COLORS[myElement]?.name || 'Vô'}
              </span>
            </div>
            <span className="arena-pet-level">C{companionC}</span>
          </div>
          <div className="arena-bar-wrap">
            <span className="arena-bar-label">HP</span>
            <div className="arena-bar-track">
              <div className="arena-hp-fill" style={{ width: `${Math.round(petHp)}%`, backgroundColor: hpBarColor(petHp) }} />
            </div>
            <span className="arena-bar-val">{Math.round(petHp)}/100</span>
          </div>
        </div>

        {/* HUD Boss Legendary (Phải trên) */}
        <div className="arena-hud-card arena-hud-opponent">
          <div className="arena-hud-header">
            <div className="arena-pet-title">
              <span>👑 {storyBoss?.name || 'Boss Sương'}</span>
              <span className="arena-elem-badge" style={{ backgroundColor: ELEMENT_COLOR_HEX[bossElement] || '#6B6BAA' }}>
                {ELEMENT_COLORS[bossElement]?.name || 'Bóng'}
              </span>
            </div>
            <span className="arena-pet-level">C5</span>
          </div>
          <div className="arena-bar-wrap">
            <span className="arena-bar-label">HP</span>
            <div className="arena-bar-track">
              <div className="arena-hp-fill" style={{ width: `${Math.round(bossHp)}%`, backgroundColor: '#6366F1' }} />
            </div>
            <span className="arena-bar-val">{Math.round(bossHp)}/100</span>
          </div>
        </div>

        {/* Pet của mình trên đồi trái */}
        <div
          className={`arena-pet-wrapper arena-pet-mine ${
            battleAnim === 'attack-mine' ? 'anim-attack-mine' :
            battleAnim === 'damage-mine' ? 'anim-damage' :
            petHp <= 0 ? 'anim-faint' : ''
          }`}
        >
          {damagePopup?.target === 'mine' && (
            <div className="arena-damage-pop">-{damagePopup.amount}</div>
          )}
          <div className="pet-render-slot">
            <PetAvatar
              petId={companionId}
              stage={companionC}
              group={mySpecies?.group}
              bond={bondOf(activePet?.skills)}
              topSkill={topSkillOf(activePet?.skills)}
              mode="battle"
              targetFacing="right"
              canvasBubble={false}
              alt={companionName}
            />
          </div>
        </div>

        {/* Boss Legendary trên đồi phải + lớp sương tan dần */}
        <div
          className={`arena-pet-wrapper arena-pet-opponent ${
            battleAnim === 'attack-opponent' ? 'anim-attack-opponent' :
            battleAnim === 'damage-opponent' ? 'anim-damage' :
            battleEnd?.passed ? 'anim-faint' : ''
          }`}
        >
          {damagePopup?.target === 'opponent' && (
            <div className="arena-damage-pop">
              {damagePopup.isCritical ? `💥 -${damagePopup.amount}` : `-${damagePopup.amount}`}
            </div>
          )}
          <div className={`pet-render-slot position-relative ff-fog-boss is-${bossAnim}`}>
            {storyBoss?.id ? (
              <>
                <PetAvatar
                  petId={storyBoss.id}
                  stage={5}
                  mode="battle"
                  targetFacing="left"
                  canvasBubble={false}
                  fallbackSrc={storyBoss.image || undefined}
                  alt={storyBoss.name}
                  imgStyle={{
                    filter: battleEnd?.passed ? 'none' : `saturate(${Math.max(0.3, 1 - liveFogOpacity * 0.65)})`,
                    transition: 'filter 0.35s ease',
                  }}
                />
                <img
                  src="/image/boss/fog.svg"
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: -8,
                    width: 'calc(100% + 16px)',
                    height: 'calc(100% + 16px)',
                    objectFit: 'contain',
                    opacity: liveFogOpacity,
                    pointerEvents: 'none',
                    transition: 'opacity 0.35s ease',
                  }}
                />
              </>
            ) : (
              <FogBossSvg region={region} animState={bossAnim} size={96} />
            )}
          </div>
        </div>
      </div>

      {/* ── Thẻ Câu hỏi & 4 Đáp án chuẩn Đấu trường (không bao giờ tàng hình chữ) ── */}
      {current && !battleEnd && (
        <>
          <div className="ff-card">
            <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
              {current.isGuest ? (
                <span className="ff-guest-badge">🌿 khách quen</span>
              ) : (
                <span className="arena-q-category-tag">CÂU HỎI BOSS</span>
              )}
              {qAudio && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
                  style={{ fontSize: '0.78rem', minHeight: 32 }}
                  onClick={() => speakWord(qAudio, { rate: defaultRate, lang: 'en-US' }).catch(() => {})}
                >
                  <Icon name="sound" size={14} /> Nghe
                </button>
              )}
            </div>
            <div className="fw-bold" style={{ fontSize: '1.02rem', color: '#334155', lineHeight: 1.35 }}>
              {current.question}
            </div>
          </div>

          <div className="arena-options-grid arena-options-grid--boss">
            {(current.options || []).map((opt, oi) => {
              let optClass = 'arena-option-btn arena-option-btn--boss';
              if (picked !== null) {
                if (oi === current.correct) optClass += ' opt-correct';
                else if (oi === picked) optClass += ' opt-wrong';
              }
              return (
                <button
                  key={`${qIdx}-${oi}`}
                  type="button"
                  className={optClass}
                  disabled={picked !== null}
                  onClick={() => handlePickOption(oi)}
                >
                  <span className="arena-option-key">{String.fromCharCode(65 + oi)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Popup phản hồi khi trả lời sai */}
      <ScreenActionModal
        open={Boolean(current && !battleEnd && picked !== null && picked !== current.correct)}
        title="Boss phản công rồi!"
        tone="warning"
        primaryLabel={qIdx + 1 < questions.length ? 'Câu tiếp →' : 'Xem kết quả →'}
        onPrimary={() => advanceNext(lessonCorrect, guestTotal, guestCorrect, wrongAnswers)}
      >
        <div>Đáp án đúng: <strong>{current?.options?.[current?.correct]}</strong></div>
        {current?.explanation && <div className="small text-muted mt-1">{current.explanation}</div>}
      </ScreenActionModal>

      {/* Popup khi chưa đạt ngưỡng Boss */}
      <ScreenActionModal
        open={Boolean(battleEnd && !battleEnd.passed)}
        title="Chưa giải được hết sương!"
        tone="warning"
        primaryLabel="⚔️ Đánh lại"
        onPrimary={resetBattle}
        secondaryLabel="🌿 Ôn từ sai"
        onSecondary={() => setReviewWrongMode(true)}
        tertiaryLabel="Xem tổng kết"
        onTertiary={() => onDone?.({
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
        Bạn đúng <strong>{lessonCorrect}/{lessonTotal}</strong> câu chính (cần ≥{Math.round(passRate * 100)}%). Hãy ôn nhanh các từ sai rồi phản công nhé!
      </ScreenActionModal>
    </FriendlyFrame>
  );
}
