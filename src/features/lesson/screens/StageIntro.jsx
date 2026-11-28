import { useState } from 'react';
import Icon from '../../../components/Icon';
import Emoji from '../../../components/Emoji';
import { SLOT_META, SHORT_NAME, resolveBossStage } from '../../../data/config/screens';
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
  if (region === 'BD') {
    return {
      id: 'ong_tu',
      name: HUMAN_CAST.ong_tu.nameVi,
      isHuman: true,
      img: getHumanNpcImage('ong_tu'),
    };
  }
  return {
    id: 'tom',
    name: HUMAN_CAST.tom.nameVi,
    isHuman: true,
    img: getHumanNpcImage('tom'),
  };
}

/** Rút gọn tối đa 2 mục tiêu ngắn gọn cho thẻ mục tiêu Mở ải. */
function buildObjectives(lesson) {
  const out = [];
  const vocabCount = (lesson?.vocabulary || []).length;
  if (vocabCount > 0) {
    out.push(`Nắm vững ${Math.min(vocabCount, 13)} từ vựng trọng tâm của bài.`);
  }
  const grammars = lesson?.grammar || [];
  if (grammars.length > 0 && grammars[0]?.title) {
    out.push(`Dùng được mẫu câu: ${grammars[0].title}.`);
  } else if (lesson?.reading?.title) {
    out.push(`Đọc hiểu và trả lời câu hỏi về “${lesson.reading.title}”.`);
  }
  if (out.length === 0) {
    out.push('Luyện đủ 4 kỹ năng Nghe · Đọc · Viết · Nói.');
  }
  return out.slice(0, 2);
}

/**
 * StageIntro — Màn Mở ải (Tách dữ liệu chuẩn):
 * - Hero: nhân vật + mascot + bong bóng CHỈ chứa dialogue.text_en (tối đa 2 dòng, tự co chữ, không cắt "...") + tên người nói + nút loa en-US.
 * - intro_vi: khối riêng NGAY DƯỚI ảnh hero, hiện đủ chữ, có nút loa vi-VN riêng.
 * - Chip trên ảnh: "Ải X/Y · <tên cảnh>" (không cắt, tự xuống dòng); không lặp tên ải ở tiêu đề.
 * - Thẻ Boss: tên & ảnh từ region.boss (PET_REGISTRY[pet_id]); ô 6 ghi "Boss" + boss_stage.label_vi.
 */
export default function StageIntro({
  lesson,
  unitId = null,
  region = 'BD',
  stageNumber = 1,
  stageTotal = 4,
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

  const resolved = resolveLessonStory({
    lesson,
    unitId,
    region,
    companionId,
    companionC,
    companionName,
  });
  const { lessonStory, unitStory, scene, dialogue, intro_vi: resolvedIntroVi, regionBoss } = resolved;

  // Ảnh cảnh nền ưu tiên: server override theo scene → ảnh của scene → ảnh vùng
  const bgUrl = resolveImage(
    `story:${scene?.id || `region_${region}_fog`}`,
    scene?.image || getRegionImageUrl(region, variant.id),
  );

  // Bài đầu tiên của unit Mùa 2 → hiện thẻ Tới vùng (arrival / homecoming) trước Mở ải
  const arrivalKey = unitStory ? `arrival:${lessonStory.unit}` : null;
  const shouldShowArrivalInit = Boolean(
    unitStory &&
    lessonStory?.landmark === 0 &&
    unitStory.arrival &&
    (sandbox || !isStorySeen(arrivalKey)),
  );
  const [showArrival, setShowArrival] = useState(shouldShowArrivalInit);

  const handleContinueArrival = () => {
    if (!sandbox && arrivalKey) markStorySeen(arrivalKey);
    setShowArrival(false);
  };

  const speaker = resolveSpeakerInfo(dialogue?.speaker_id || resolved.narratorId, region, {
    companionId,
    companionC,
  });

  // Tách bạch hoàn toàn:
  // - dialogueEn: chỉ câu tiếng Anh trong bong bóng thoại (TTS en-US)
  // - introVi: chỉ lời dẫn truyện tiếng Việt ở khối riêng dưới ảnh hero (TTS vi-VN riêng)
  const dialogueEn = String(dialogue?.text_en || '').trim() || "Let's learn together!";
  const introVi = String(resolvedIntroVi || openIntroText || '').trim();
  const isLongDialogue = dialogueEn.length > 26;

  const companionImg = getStoryPetImage(companionId, { companionId, companionC });
  const companionLabel = companionName || PET_REGISTRY[companionId]?.name || 'Cowdi';

  const objectives = buildObjectives(lesson);
  const passPct = Math.round(passRate * 100);
  const isFinalStage = stageNumber >= stageTotal;

  // ── Chế độ 1: Thẻ Tới vùng (chỉ hiện 1 lần ở bài đầu unit Mùa 2) ───────────
  if (showArrival && unitStory?.arrival) {
    const card = unitStory.homecoming && companionId === 'cowdi' ? unitStory.homecoming : unitStory.arrival;
    const hostSpeaker = resolveSpeakerInfo(card.by, region, { companionId, companionC });
    return (
      <div className="si-wrap">
        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <span className="si-chip-dark">{unitStory.episodeVi}</span>
          <span className="si-chip-count">{regionInfo.nameVi}</span>
        </div>

        <div className="si-card">
          <div className="si-card-label">CHUYỆN Ở VÙNG NÀY</div>
          <p className="mb-0" style={{ fontSize: '14px', lineHeight: 1.45, color: '#4A3420', fontWeight: 600 }}>
            {unitStory.premiseVi}
          </p>
        </div>

        <div className="si-card d-flex align-items-center gap-3">
          {hostSpeaker.img ? (
            <img
              src={hostSpeaker.img}
              alt={hostSpeaker.name}
              style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0 }}
            />
          ) : (
            <span style={{ fontSize: 40 }}>🚣</span>
          )}
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div className="fw-bold text-uppercase mb-1" style={{ color: '#9A6324', fontSize: '12px', letterSpacing: '0.03em' }}>
              {hostSpeaker.name}
            </div>
            <div className="fw-semibold" style={{ fontSize: '14px', lineHeight: 1.4, color: '#4A3420' }}>
              {card.vi}
            </div>
            {card.en && (
              <div className="d-flex align-items-center gap-2 mt-1">
                <span className="small fst-italic" style={{ color: '#7C6550' }}>{card.en}</span>
                <button
                  type="button"
                  className="si-speak-btn"
                  aria-label="Nghe câu tiếng Anh"
                  onClick={() => speakWord(card.en, { rate: 0.85, lang: 'en-US' }).catch(() => {})}
                >
                  <Icon name="sound" size={14} />
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

  const sceneDisplayName = scene?.name_vi || regionInfo.nameVi;
  const stageChipText = `Ải ${stageNumber}/${stageTotal} · ${sceneDisplayName}`;
  const cols = Math.min(6, Math.max(3, screens.length || 6));

  // Dòng mô tả trên thẻ Boss theo đúng ải đang xem
  const bossTitleLine = regionBoss
    ? (isFinalStage
        ? `Legendary ${regionBoss.name}`
        : `Legendary ${regionBoss.name} chờ ở cuối vùng`)
    : (isFinalStage
        ? `Boss vùng ${regionInfo.nameVi}`
        : `Boss vùng ${regionInfo.nameVi} chờ ở cuối vùng`);
  const bossSubLine = isFinalStage
    ? `Ải cuối (${stageNumber}/${stageTotal}): đối đầu trực tiếp · Đạt ${passPct}% để giải sương.`
    : `Trả lời đúng ${passPct}% để làm mỏng sương vùng ${regionInfo.nameVi}.`;

  return (
    <div className="si-wrap">
      {/* 2.1 Hero cảnh vùng + nhân vật + mascot + bong bóng CHỈ chứa câu tiếng Anh */}
      <section
        className="si-hero"
        style={{
          background: `linear-gradient(180deg, ${regionColor.sky} 0%, ${regionColor.ground} 100%)`,
        }}
        aria-label={`Cảnh mở ải tại ${sceneDisplayName}`}
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
          <span className="si-chip-dark">
            {stageChipText}
          </span>
          <span className="si-chip-count">{screens.length} màn</span>
        </div>

        {/* Nhân vật đứng trong cảnh (trái-dưới) */}
        <div className="si-narrator">
          {speaker.img && !narratorFailed ? (
            <img
              src={speaker.img}
              alt={speaker.name}
              className="si-narrator-img"
              onError={() => setNarratorFailed(true)}
            />
          ) : (
            <span className="si-narrator-fallback" aria-hidden="true">
              {speaker.id === 'ong_tu' ? '🚣' : speaker.id === 'tom' ? '👨‍🏫' : '🙂'}
            </span>
          )}
        </div>

        {/* Bong bóng thoại CHỈ chứa dialogue.text_en (tối đa 2 dòng, tự co chữ, KHÔNG cắt "...") + tên người nói + loa en-US */}
        <div className="si-bubble">
          <div className="si-bubble-row">
            <div className="si-bubble-body">
              <p className={`si-bubble-en-main${isLongDialogue ? ' is-compact' : ''}`}>
                “{dialogueEn}”
              </p>
              <div className="si-bubble-sign">— {speaker.name}</div>
            </div>
            <button
              type="button"
              className="si-speak-btn"
              aria-label="Nghe câu thoại tiếng Anh"
              title="Nghe câu tiếng Anh (en-US)"
              onClick={() => speakWord(dialogueEn, { rate: 0.85, lang: 'en-US' }).catch(() => {})}
            >
              <Icon name="sound" size={16} />
            </button>
          </div>
        </div>

        {/* Pet đồng hành (phải-dưới, ẩn ở desktop >= 992px vì PetStage bên trái đã hiện) */}
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

      {/* 2.1b Khối lời dẫn truyện tiếng Việt (intro_vi) riêng ngay dưới ảnh hero — hiện đủ chữ, loa vi-VN riêng */}
      {introVi && (
        <section className="si-intro-box" aria-label="Lời dẫn truyện">
          <p className="si-intro-text">{introVi}</p>
          <button
            type="button"
            className="si-speak-btn si-speak-btn--vi"
            aria-label="Nghe lời dẫn tiếng Việt"
            title="Nghe lời dẫn (vi-VN)"
            onClick={() => speakWord(introVi, { rate: 0.92, lang: 'vi-VN' }).catch(() => {})}
          >
            <Icon name="sound" size={14} />
          </button>
        </section>
      )}

      {/* 2.2 Khối tiêu đề bài học (chỉ giữ tên bài, bỏ phần lặp tên ải) */}
      <header className="si-title">
        <div className="si-title-row">
          <Emoji e={lesson?.icon || '📖'} size={24} />
          <h2 className="si-title-text">
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

      {/* 2.4 Lộ trình 6 màn (ô thứ 6 ghi "Boss" + boss_stage.label_vi thống nhất, không cắt chữ) */}
      <section className="si-route" aria-label={`Lộ trình ${screens.length} màn`}>
        <div className="si-route-head">
          <span className="si-route-title">{screens.length} MÀN CỦA ẢI NÀY</span>
          <span className="si-route-note">ải sau xáo thứ tự khác</span>
        </div>
        <div className="si-route-grid" style={{ '--si-cols': cols }}>
          {screens.map((sc, idx) => {
            const slotMeta = SLOT_META[sc.slot] || SLOT_META.intro;
            const meta = getScreen(sc.code);
            const isBossSlot = sc.slot === 'boss';
            const bossStage = isBossSlot ? resolveBossStage(sc.code) : null;
            const fullTitle = isBossSlot
              ? `${slotMeta.label} · ${bossStage.label_vi}`
              : getScreenTitle(sc.code, region, meta?.name || slotMeta.label);
            const shortTitle = isBossSlot
              ? bossStage.label_vi
              : (SHORT_NAME[sc.code] || slotMeta.label);
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

      {/* 2.5 Thanh Boss nền nâu đậm — ảnh & tên từ region.boss, mô tả đúng ải đang xem */}
      <section className="si-boss" aria-label="Thông tin Boss vùng">
        <div className="si-boss-avatar">
          {regionBoss?.image && !bossImgFailed ? (
            <>
              <img
                src={regionBoss.image}
                alt={`Legendary ${regionBoss.name}`}
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
          <div className="si-boss-title">{bossTitleLine}</div>
          <div className="si-boss-sub">{bossSubLine}</div>
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
