import { useState } from 'react';
import Icon from '../../../components/Icon';
import Emoji from '../../../components/Emoji';
import { SLOT_META } from '../../../data/config/screens';
import { PET_REGISTRY } from '../../../data/pets';
import { REGIONS, REGION_COLOR, getRegionVariant } from '../../../../shared/regions';
import { HUMAN_CAST, isValidNpc } from '../../../../shared/human-cast';
import { getScreen } from './registry';
import './friendly/friendly.css';

function resolveNpcInfo(npcId, region) {
  if (npcId && isValidNpc(npcId, region, REGIONS)) {
    if (HUMAN_CAST[npcId]) {
      return { id: npcId, name: HUMAN_CAST[npcId].nameVi, isHuman: true };
    }
    if (PET_REGISTRY[npcId]) {
      return {
        id: npcId,
        name: PET_REGISTRY[npcId].name,
        isHuman: false,
        img: PET_REGISTRY[npcId].evolutions?.[0]?.image || null,
      };
    }
    return { id: npcId, name: npcId, isHuman: false };
  }
  // Mặc định theo vùng
  const reg = REGIONS[region];
  if (reg?.humanHost && HUMAN_CAST[reg.humanHost]) {
    return { id: reg.humanHost, name: HUMAN_CAST[reg.humanHost].nameVi, isHuman: true };
  }
  const firstHost = reg?.hosts?.[0];
  if (firstHost && PET_REGISTRY[firstHost]) {
    return {
      id: firstHost,
      name: PET_REGISTRY[firstHost].name,
      isHuman: false,
      img: PET_REGISTRY[firstHost].evolutions?.[0]?.image || null,
    };
  }
  return { id: 'ong_tu', name: HUMAN_CAST.ong_tu.nameVi, isHuman: true };
}

/**
 * StageIntro — Màn Mở ải (dẫn nhập ải — PHASE3 §3, test P10).
 * Chỉ 1 chạm vận hành ("Bắt đầu vượt ải") trước khi vào màn 1, dùng để mở khoá audio.
 */
export default function StageIntro({
  lesson,
  region = 'BD',
  screens = [],
  passRate = 0.7,
  openIntroText = '',
  onStart,
}) {
  const [bgFailed, setBgFailed] = useState(false);
  const regionInfo = REGIONS[region] || REGIONS.BD;
  const regionColor = REGION_COLOR[region] || REGION_COLOR.BD;
  const variant = getRegionVariant(region);
  const bgUrl = `/image/regions/${region}-${variant.id}.webp`;

  const npc = resolveNpcInfo(lesson?.story?.npc, region);
  const storyLine = lesson?.story?.introVi || openIntroText || `Chào con đến với ${regionInfo.nameVi}! Cùng Cowdi vượt qua các màn thử thách hôm nay nhé!`;
  const objectives = Array.isArray(lesson?.objectives) ? lesson.objectives.slice(0, 3) : [];
  const passPct = Math.round((passRate || 0.7) * 100);

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
          <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
            <span className="badge rounded-pill" style={{ background: 'rgba(255,255,255,0.9)', color: '#4A3420', fontWeight: 700, fontSize: '0.72rem' }}>
              📍 {regionInfo.nameVi}
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
            {npc.img ? (
              <img src={npc.img} alt={npc.name} width={36} height={36} style={{ objectFit: 'contain', flexShrink: 0 }} />
            ) : (
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 34, height: 34, background: '#FEF3C7', fontSize: '1.1rem', flexShrink: 0 }}
                aria-hidden="true"
              >
                {npc.id === 'ong_tu' ? '🚣' : npc.id === 'tom' ? '👨‍🏫' : '🙂'}
              </span>
            )}
            <div style={{ minWidth: 0 }}>
              <div className="fw-bold text-uppercase" style={{ color: '#9A6324', fontSize: '0.68rem', letterSpacing: '0.03em' }}>
                {npc.name}
              </div>
              <div className="fw-semibold" style={{ fontSize: '0.84rem', lineHeight: 1.3 }}>
                “{storyLine}”
              </div>
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
                  {meta?.name || slotMeta.label}
                </small>
              </div>
            );
          })}
        </div>
        <div className="mt-2 pt-1 border-top text-muted text-center" style={{ fontSize: '0.74rem' }}>
          ☁️ Boss Sương <strong>{regionInfo.nameVi}</strong> · Cần đúng <strong>{passPct}%</strong> để giải sương.
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
