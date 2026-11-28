import { useState } from 'react';
import Icon from '../../../components/Icon';
import Emoji from '../../../components/Emoji';
import { SLOT_META, SHORT_NAME } from '../../../data/config/screens';
import { PET_REGISTRY } from '../../../data/pets';
import { REGIONS, REGION_COLOR, getRegionVariant, getRegionImageUrl } from '../../../../shared/regions';
import { HUMAN_CAST } from '../../../../shared/human-cast';
import { getScreenTitle } from '../../../../shared/screen-scenarios';
import { speakWord } from '../../../utils/speech';
import { resolveImage } from '../../../utils/imageOverrides';
import { getStoryPetImage, getHumanNpcImage, isStorySeen, markStorySeen } from '../story/petImage';
import { resolveLessonStory } from '../story/resolveStory';
import { getScreen } from './registry';
import './friendly/friendly.css';
import './stage-intro.css';

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

function SpeakerAvatar({ speaker, size = 56 }) {
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
 * StageIntro — Màn Mở ải + Thẻ Tới vùng (artboard Intro — ui/stage-intro).
 * Giữ nguyên logic resolveLessonStory, thẻ Tới vùng và onStart.
 */
export default function StageIntro({
  lesson,
  unitId = null,
  region = 'BD',
  stageNumber = 1,
  stageTotal = 1,
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
  const [narratorFailed, setNarratorFailed] = useState(false);
  const [companionFailed, setCompanionFailed] = useState(false);
  const [bossImgFailed, setBossImgFailed] = useState(false);

  const regionInfo = REGIONS[region] || REGIONS.BD;
  const regionColor = REGION_COLOR[region] || REGION_COLOR.BD;
  const variant = getRegionVariant(region);
  const bgUrl = resolveImage(`story:region_${region}_fog`, getRegionImageUrl(region, variant.id));

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
  const companionImg = getStoryPetImage(companionId, { companionId, companionC });
  const companionLabel = companionName || PET_REGISTRY[companionId]?.name || 'Cowdi';

  const storyLine = resolved.openVi || openIntroText;
  const storyLineEn = resolved.openEn || '';
  const objectives = Array.isArray(lesson?.objectives) ? lesson.objectives.slice(0, 2) : [];
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
          className="si-cta"
          onClick={handleContinueArrival}
        >
          Vào tập này →
        </button>
      </div>
    );
  }

  const stageChipText = `Ải ${stageNumber}/${stageTotal} · ${regionInfo.nameVi}${landmarkName ? ` · ${landmarkName}` : ''}`;
  const cols = Math.min(6, Math.max(3, screens.length || 6));

  return (
    <div className="si-wrap">
      {/* 2.1 Hero cảnh vùng + người dẫn + bóng thoại + pet đồng hành */}
      <section
        className="si-hero"
        style={{
          background: `linear-gradient(180deg, ${regionColor.sky} 0%, ${regionColor.ground} 100%)`,
        }}
        aria-label={`Cảnh mở ải tại ${regionInfo.nameVi}`}
      >
        {bgUrl && !bgFailed && (
          <img
            src={bgUrl}
            alt=""
            aria-hidden="true"
            className="si-hero-bg"
            onError={() => setBgFailed(true)}
          />
        )}
        <div className="si-hero-scrim" aria-hidden="true" />

        <div className="si-hero-top">
          <span className="si-chip-dark" title={stageChipText}>
            {stageChipText}
          </span>
          <span className="si-chip-count">{screens.length} màn</span>
        </div>

        {/* Người dẫn đứng trong cảnh (trái-dưới) */}
        <div className="si-narrator">
          {npc.img && !narratorFailed ? (
            <img
              src={npc.img}
              alt={npc.name}
              className="si-narrator-img"
              onError={() => setNarratorFailed(true)}
            />
          ) : (
            <span className="si-narrator-fallback" aria-hidden="true">
              {npc.id === 'ong_tu' ? '🚣' : npc.id === 'tom' ? '👨‍🏫' : '🙂'}
            </span>
          )}
        </div>

        {/* Bóng thoại trắng viền đậm + nút loa đọc tiếng Việt */}
        <div className="si-bubble">
          <div className="si-bubble-row">
            <div className="si-bubble-body">
              <p className="si-bubble-vi">{storyLine}</p>
              {storyLineEn && <div className="si-bubble-en">{storyLineEn}</div>}
              <div className="si-bubble-sign">— {npc.name}</div>
            </div>
            <button
              type="button"
              className="si-speak-btn"
              aria-label="Nghe lời dẫn tiếng Việt"
              title="Nghe lời dẫn"
              onClick={() => speakWord(storyLine, { rate: 0.92, lang: 'vi-VN' }).catch(() => {})}
            >
              <Icon name="sound" size={16} />
            </button>
          </div>
        </div>

        {/* Pet đồng hành (phải-dưới, ẩn ở desktop >= 992px vì PetStage đã hiện) */}
        {companionImg && !companionFailed && (
          <div className="si-companion" aria-hidden="true">
            <img
              src={companionImg}
              alt={companionLabel}
              className="si-companion-img"
              onError={() => setCompanionFailed(true)}
            />
          </div>
        )}
      </section>

      {/* 2.2 Khối tiêu đề bài học */}
      <header className="si-title">
        <div className="si-title-sub">
          ẢI {stageNumber} · {regionInfo.nameVi}
        </div>
        <div className="si-title-row">
          <Emoji e={lesson?.icon || '📖'} size={24} />
          <h2 className="si-title-text" title={lesson?.title || ''}>
            {lesson?.title}
          </h2>
        </div>
      </header>

      {/* 2.3 Mục tiêu */}
      {objectives.length > 0 && (
        <section className="si-card" aria-label="Mục tiêu bài học">
          <div className="si-card-label">QUA ẢI NÀY, CON SẼ</div>
          <ul className="si-obj-list">
            {objectives.map((obj, idx) => (
              <li key={idx} className="si-obj-item">
                {obj}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 2.4 Lộ trình 6 màn (đúng 2 dòng cố định, không xuống dòng) */}
      <section className="si-route" aria-label={`Lộ trình ${screens.length} màn`}>
        <div className="si-route-head">
          <span className="si-route-title">{screens.length} MÀN CỦA ẢI NÀY</span>
          <span className="si-route-note">ải sau xáo thứ tự khác</span>
        </div>
        <div className="si-route-grid" style={{ '--si-cols': cols }}>
          {screens.map((sc, idx) => {
            const slotMeta = SLOT_META[sc.slot] || SLOT_META.intro;
            const meta = getScreen(sc.code);
            const fullTitle = getScreenTitle(sc.code, region, meta?.name || slotMeta.label);
            const shortTitle = SHORT_NAME[sc.code] || slotMeta.label;
            return (
              <div
                key={`${sc.code}-${idx}`}
                className="si-route-cell"
                title={`${slotMeta.label} · ${fullTitle}`}
                aria-label={`${slotMeta.label}: ${fullTitle}`}
              >
                <span className="si-route-circle" style={{ background: slotMeta.color }}>
                  <Icon name={slotMeta.icon} size={20} />
                </span>
                <span className="si-route-slot">{slotMeta.label}</span>
                <span className="si-route-name">{shortTitle}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2.5 Thanh Boss nền nâu đậm + ảnh Boss C5 phủ sương */}
      <section className="si-boss" aria-label="Thông tin Boss cuối ải">
        <div className="si-boss-avatar">
          {resolved.boss?.image && !bossImgFailed ? (
            <>
              <img
                src={resolved.boss.image}
                alt={`Legendary ${resolved.boss.name}`}
                className="si-boss-pet"
                onError={() => setBossImgFailed(true)}
              />
              <img
                src="/image/boss/fog.svg"
                alt=""
                aria-hidden="true"
                className="si-boss-fog"
              />
            </>
          ) : (
            <span className="si-boss-cloud" aria-hidden="true">☁️</span>
          )}
        </div>
        <div className="si-boss-text">
          <div className="si-boss-title">
            {resolved.boss
              ? `Legendary ${resolved.boss.name} chờ ở cuối ải.`
              : `Boss Sương ${regionInfo.nameVi} chờ ở cuối ải.`}
          </div>
          <div className="si-boss-sub">
            Trả lời đúng {passPct}% để giải sương.
          </div>
        </div>
      </section>

      {/* 2.6 Nút vàng CTA duy nhất để vào màn 1 và mở khoá audio */}
      <button type="button" className="si-cta" onClick={onStart}>
        <Icon name="play" size={20} />
        <span>Bắt đầu vượt ải</span>
      </button>
    </div>
  );
}
