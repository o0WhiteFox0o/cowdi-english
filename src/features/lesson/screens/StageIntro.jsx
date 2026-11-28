import { useState } from 'react';
import Icon from '../../../components/Icon';
import Emoji from '../../../components/Emoji';
import { SLOT_META } from '../../../data/config/screens';
import { PET_REGISTRY } from '../../../data/pets';
import { REGIONS, REGION_COLOR, getRegionVariant } from '../../../../shared/regions';
import { HUMAN_CAST } from '../../../../shared/human-cast';
import { getScreenTitle } from '../../../../shared/screen-scenarios';
import { speakWord } from '../../../utils/speech';
import { getStoryPetImage, getHumanNpcImage, isStorySeen, markStorySeen } from '../story/petImage';
import { resolveLessonStory } from '../story/resolveStory';
import { getScreen } from './registry';
import './friendly/friendly.css';

function resolveSpeakerInfo(speakerId, region, { companionId, companionC }) {
  if (speakerId) {
    if (HUMAN_CAST[speakerId]) {
      return {
        id: speakerId,
        name: HUMAN_CAST[speakerId].nameVi,
        isHuman: true,
        img: getHumanNpcImage(speakerId),
      };
    }
    if (PET_REGISTRY[speakerId]) {
      return {
        id: speakerId,
        name: PET_REGISTRY[speakerId].name,
        isHuman: false,
        img: getStoryPetImage(speakerId, { companionId, companionC }),
      };
    }
  }

  // Fallback theo vùng
  const reg = REGIONS[region];
  if (reg?.humanHost && HUMAN_CAST[reg.humanHost]) {
    return {
      id: reg.humanHost,
      name: HUMAN_CAST[reg.humanHost].nameVi,
      isHuman: true,
      img: getHumanNpcImage(reg.humanHost),
    };
  }
  const firstHost = reg?.hosts?.[0];
  if (firstHost && PET_REGISTRY[firstHost]) {
    return {
      id: firstHost,
      name: PET_REGISTRY[firstHost].name,
      isHuman: false,
      img: getStoryPetImage(firstHost, { companionId, companionC }),
    };
  }
  return {
    id: 'ong_tu',
    name: HUMAN_CAST.ong_tu.nameVi,
    isHuman: true,
    img: getHumanNpcImage('ong_tu'),
  };
}

function SpeakerAvatar({ speaker, size = 38 }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (speaker.img && !imgFailed) {
    return (
      <img
        src={speaker.img}
        alt={speaker.name}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        style={{ objectFit: 'contain', flexShrink: 0, borderRadius: speaker.isHuman ? '50%' : 6 }}
      />
    );
  }
  return (
    <span
      className="d-inline-flex align-items-center justify-content-center rounded-circle"
      style={{ width: size, height: size, background: '#FEF3C7', fontSize: '1.1rem', flexShrink: 0 }}
      aria-hidden="true"
    >
      {speaker.id === 'ong_tu' ? '🚣' : speaker.id === 'tom' ? '👨‍🏫' : '🙂'}
    </span>
  );
}

/**
 * StageIntro — Màn Mở ải + Thẻ Tới vùng (PHASE3 §3 + GEMINI-STORY-INTRO-S2 §1, §2, §4).
 * Chỉ 1 chạm vận hành ("Bắt đầu vượt ải") trước khi vào màn 1, dùng để mở khoá audio.
 */
export default function StageIntro({
  lesson,
  unitId = null,
  region = 'BD',
  screens = [],
  passRate = 0.7,
  openIntroText = '',
  companionId = 'cowdi',
  companionC = 1,
  companionName = '',
  sandbox = false,
  onStart,
}) {
  const [bgFailed, setBgFailed] = useState(false);
  const regionInfo = REGIONS[region] || REGIONS.BD;
  const regionColor = REGION_COLOR[region] || REGION_COLOR.BD;
  const variant = getRegionVariant(region);
  const bgUrl = `/image/regions/${region}-${variant.id}.webp`;

  const resolved = resolveLessonStory({
    lesson,
    unitId,
    region,
    companionId,
    companionC,
    companionName,
  });
  const { lessonStory, unitStory, landmarkName } = resolved;

  // Bài đầu tiên của unit Mùa 2 → hiện thẻ Tới vùng (arrival / homecoming) trước Mở ải
  const arrivalKey = unitStory ? `arrival:${lessonStory.unit}` : null;
  const shouldShowArrivalInit = Boolean(
    unitStory &&
    lessonStory?.landmark === 0 &&
    unitStory.arrival &&
    (sandbox || !isStorySeen(arrivalKey)),
  );
  const [showArrival, setShowArrival] = useState(shouldShowArrivalInit);

  const npc = resolveSpeakerInfo(resolved.narratorId, region, { companionId, companionC });
  const storyLine = resolved.openVi || openIntroText;
  const storyLineEn = resolved.openEn || '';
  const objectives = Array.isArray(lesson?.objectives) ? lesson.objectives.slice(0, 3) : [];
  const passPct = Math.round((passRate || 0.7) * 100);

  if (showArrival && unitStory) {
    const useHomecoming = Boolean(unitStory.homecoming && companionId === unitStory.homecoming.by);
    const card = useHomecoming ? unitStory.homecoming : unitStory.arrival;
    const hostSpeaker = resolveSpeakerInfo(card.by, region, { companionId, companionC });

    const handleContinueArrival = () => {
      if (!sandbox && arrivalKey) markStorySeen(arrivalKey);
      setShowArrival(false);
    };

    return (
      <div className="ff-shell" style={{ gap: 10 }}>
        <div
          className="ff-stage-hero"
          style={{
            background: `linear-gradient(180deg, ${regionColor.sky} 0%, ${regionColor.ground} 100%)`,
          }}
        >
          {!bgFailed && (
            <img
              src={bgUrl}
              alt=""
              aria-hidden="true"
              onError={() => setBgFailed(true)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.28,
                pointerEvents: 'none',
              }}
            />
          )}
          <div className="position-relative text-center py-2">
            <span className="badge rounded-pill mb-2" style={{ background: 'rgba(255,255,255,0.92)', color: '#4A3420', fontWeight: 800, fontSize: '0.75rem' }}>
              {useHomecoming ? '🏡 Về quê' : '🧭 Tới vùng mới'} · {regionInfo.nameVi}
            </span>
            <h2 className="h5 fw-bold mb-1" style={{ color: '#4A3420' }}>
              {unitStory.episodeVi}
            </h2>
            <p className="small mb-0" style={{ color: '#5E4630', lineHeight: 1.35 }}>
              {unitStory.premiseVi}
            </p>
          </div>
        </div>

        <div className="ff-card d-flex align-items-center gap-3 py-3 px-3">
          <SpeakerAvatar speaker={hostSpeaker} size={56} />
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div className="fw-bold text-uppercase mb-1" style={{ color: '#9A6324', fontSize: '0.72rem', letterSpacing: '0.03em' }}>
              {hostSpeaker.name}
            </div>
            <div className="fw-semibold" style={{ fontSize: '0.92rem', lineHeight: 1.35 }}>
              “{card.vi}”
            </div>
            {card.en && (
              <div className="d-flex align-items-center gap-2 mt-1">
                <span className="small fst-italic" style={{ color: '#7C6550' }}>{card.en}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-inline-flex align-items-center justify-content-center"
                  style={{ width: 24, height: 24 }}
                  aria-label="Nghe câu tiếng Anh"
                  onClick={() => speakWord(card.en, { rate: 0.85, lang: 'en-US' }).catch(() => {})}
                >
                  <Icon name="sound" size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-cowdi-primary w-100 ff-tap-btn d-inline-flex align-items-center justify-content-center gap-2"
          style={{ fontSize: '1rem' }}
          onClick={handleContinueArrival}
        >
          Vào tập này →
        </button>
      </div>
    );
  }

  return (
    <div className="ff-shell" style={{ gap: 8 }}>
      {/* Khung cảnh vùng + NPC + câu chuyện (gọn để 0 cuộn ở 360x640) */}
      <div
        className="ff-stage-hero"
        style={{
          background: `linear-gradient(180deg, ${regionColor.sky} 0%, ${regionColor.ground} 100%)`,
        }}
      >
        {!bgFailed && (
          <img
            src={bgUrl}
            alt=""
            aria-hidden="true"
            onError={() => setBgFailed(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.25,
              pointerEvents: 'none',
            }}
          />
        )}

        <div className="position-relative">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-1 flex-wrap">
            <span className="badge rounded-pill" style={{ background: 'rgba(255,255,255,0.9)', color: '#4A3420', fontWeight: 700, fontSize: '0.72rem' }}>
              📍 {regionInfo.nameVi}{landmarkName ? ` · ${landmarkName}` : ''}
            </span>
            <span className="badge rounded-pill" style={{ background: 'rgba(74,52,32,0.12)', color: '#4A3420', fontSize: '0.72rem' }}>
              {screens.length} màn
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 mb-2">
            <Emoji e={lesson?.icon || '📖'} size={24} />
            <h2 className="h5 fw-bold mb-0">{lesson?.title}</h2>
          </div>

          <div
            className="p-2 rounded-3 d-flex align-items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.92)', border: '1.5px solid #F0E2C4' }}
          >
            <SpeakerAvatar speaker={npc} size={38} />
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <div className="fw-bold text-uppercase" style={{ color: '#9A6324', fontSize: '0.68rem', letterSpacing: '0.03em' }}>
                {npc.name}
              </div>
              <div className="fw-semibold" style={{ fontSize: '0.84rem', lineHeight: 1.3 }}>
                “{storyLine}”
              </div>
              {storyLineEn && (
                <div className="fst-italic mt-1" style={{ fontSize: '0.74rem', color: '#7C6550' }}>
                  {storyLineEn}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Qua ải này, con sẽ */}
      {objectives.length > 0 && (
        <div className="ff-card py-2 px-3">
          <div className="fw-bold mb-1" style={{ color: '#7C6550', fontSize: '0.76rem' }}>Qua ải này, con sẽ:</div>
          <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem', lineHeight: 1.38 }}>
            {objectives.slice(0, 2).map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 6 màn đã trộn */}
      <div className="ff-card py-2 px-2">
        <div className="d-flex justify-content-between align-items-center mb-2 gap-1">
          <span className="fw-bold" style={{ color: '#7C6550', fontSize: '0.74rem' }}>Lộ trình {screens.length} màn</span>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>Ải sau xáo khác</span>
        </div>
        <div className="d-grid" style={{ gridTemplateColumns: `repeat(${Math.min(6, Math.max(3, screens.length))}, minmax(0, 1fr))`, gap: 4 }}>
          {screens.map((sc, idx) => {
            const slotMeta = SLOT_META[sc.slot] || SLOT_META.intro;
            const meta = getScreen(sc.code);
            return (
              <div
                key={`${sc.code}-${idx}`}
                className="d-flex flex-column align-items-center text-center"
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-white shadow-sm"
                  style={{ width: 30, height: 30, background: slotMeta.color }}
                >
                  <Icon name={slotMeta.icon} size={14} />
                </span>
                <small className="fw-bold mt-1" style={{ fontSize: '0.64rem', lineHeight: 1.12 }}>
                  {getScreenTitle(sc.code, region, meta?.name || slotMeta.label)}
                </small>
              </div>
            );
          })}
        </div>
        <div className="mt-2 pt-1 border-top text-muted text-center" style={{ fontSize: '0.74rem' }}>
          ☁️ {resolved.boss ? <>Boss: <strong>Legendary {resolved.boss.name}</strong></> : <>Boss Sương <strong>{regionInfo.nameVi}</strong></>} · Cần đúng <strong>{passPct}%</strong> để giải sương.
        </div>
      </div>

      {/* 1 chạm vận hành duy nhất để vào màn 1 và mở khoá audio */}
      <button
        type="button"
        className="btn btn-cowdi-primary w-100 ff-tap-btn d-inline-flex align-items-center justify-content-center gap-2"
        style={{ fontSize: '1rem' }}
        onClick={onStart}
      >
        <Icon name="play" size={18} /> Bắt đầu vượt ải
      </button>
    </div>
  );
}
