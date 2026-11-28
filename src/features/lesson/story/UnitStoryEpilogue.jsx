import { useState } from 'react';
import Icon from '../../../components/Icon';
import { PET_REGISTRY } from '../../../data/pets';
import { HUMAN_CAST } from '../../../../shared/human-cast';
import { REGIONS, REGION_COLOR } from '../../../../shared/regions';
import { SEASON2_UNITS } from '../../../../shared/story-season2';
import { speakWord } from '../../../utils/speech';
import {
  getUnitBossInfo,
  getStoryPetImage,
  getHumanNpcImage,
  markStorySeen,
} from './petImage';

function EpilogueAvatar({ speakerId, companionId, companionC, size = 48 }) {
  const [failed, setFailed] = useState(false);
  const isHuman = Boolean(HUMAN_CAST[speakerId]);
  const name = isHuman ? HUMAN_CAST[speakerId].nameVi : (PET_REGISTRY[speakerId]?.name || speakerId);
  const img = isHuman
    ? getHumanNpcImage(speakerId)
    : getStoryPetImage(speakerId, { companionId, companionC });

  if (img && !failed) {
    return (
      <img
        src={img}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        style={{ objectFit: 'contain', flexShrink: 0, borderRadius: isHuman ? '50%' : 8 }}
      />
    );
  }
  return (
    <span
      className="d-inline-flex align-items-center justify-content-center rounded-circle"
      style={{ width: size, height: size, background: '#FEF3C7', fontSize: '1.3rem', flexShrink: 0 }}
      aria-hidden="true"
    >
      {speakerId === 'ong_tu' ? '🚣' : speakerId === 'tom' ? '👨‍🏫' : '🙂'}
    </span>
  );
}

/**
 * UnitStoryEpilogue — Màn kết tập sau khi qua kiểm tra unit (GEMINI-STORY-INTRO-S2 §3).
 * Hiện Boss C5 đã giải sương (không phủ fog) + câu Truth (freed) → Manh mối Shadow → Kết tập (epilogue).
 * Chỉ hiện 1 lần mỗi unit (ghi cờ `story_seen` cục bộ).
 */
export default function UnitStoryEpilogue({
  unitId,
  companionId = 'cowdi',
  companionC = 1,
  onClose,
}) {
  const unitStory = SEASON2_UNITS[unitId];
  const boss = getUnitBossInfo(unitId, companionId);
  if (!unitStory || !boss) return null;

  const regionColor = REGION_COLOR[unitStory.region] || REGION_COLOR.BD;
  const regionName = REGIONS[unitStory.region]?.nameVi || '';
  const epSpeakerId = unitStory.epilogue?.by || 'ong_tu';
  const epSpeakerName = HUMAN_CAST[epSpeakerId]?.nameVi || PET_REGISTRY[epSpeakerId]?.name || epSpeakerId;

  const handleFinish = () => {
    markStorySeen(`epilogue:${unitId}`);
    onClose?.();
  };

  return (
    <div className="fade-in py-3" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div
        className="p-3 rounded-4 mb-3 text-center"
        style={{
          background: `linear-gradient(180deg, ${regionColor.sky} 0%, ${regionColor.ground} 100%)`,
          border: '2px solid #F0E2C4',
        }}
      >
        <span className="badge rounded-pill mb-2" style={{ background: 'rgba(255,255,255,0.92)', color: '#4A3420', fontWeight: 800 }}>
          ✨ Đã giải sương · {regionName}
        </span>
        <h2 className="h5 fw-bold mb-2" style={{ color: '#4A3420' }}>{unitStory.episodeVi}</h2>

        {boss.image && (
          <div className="d-flex justify-content-center my-2">
            <img
              src={boss.image}
              alt={boss.name}
              width={110}
              height={110}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 6px 14px rgba(74,52,32,0.18))' }}
            />
          </div>
        )}

        <div className="p-2 rounded-3 bg-white text-start" style={{ border: '1.5px solid #F0E2C4' }}>
          <div className="fw-bold text-uppercase" style={{ color: '#9A6324', fontSize: '0.72rem' }}>
            {boss.name} (Đã giải sương)
          </div>
          <div className="fw-semibold" style={{ fontSize: '0.92rem', color: '#4A3420' }}>
            “{boss.lines.freed.vi}”
          </div>
          {boss.lines.freed.en && (
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className="small fst-italic" style={{ color: '#7C6550' }}>{boss.lines.freed.en}</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-circle p-0 d-inline-flex align-items-center justify-content-center"
                style={{ width: 24, height: 24 }}
                aria-label="Nghe câu tiếng Anh"
                onClick={() => speakWord(boss.lines.freed.en, { rate: 0.85, lang: 'en-US' }).catch(() => {})}
              >
                <Icon name="sound" size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manh mối Shadow */}
      {boss.clueVi && (
        <div
          className="p-3 rounded-3 mb-3 small"
          style={{ background: '#F4F1FA', border: '1.5px solid #D9CEE8', color: '#3F3252' }}
        >
          <div className="fw-bold mb-1">🌫️ Manh mối từ làn sương</div>
          <div>{boss.clueVi}</div>
        </div>
      )}

      {/* Kết tập */}
      {unitStory.epilogue && (
        <div
          className="p-3 rounded-3 mb-3 d-flex align-items-center gap-3 bg-white"
          style={{ border: '1.5px solid #F0E2C4' }}
        >
          <EpilogueAvatar
            speakerId={epSpeakerId}
            companionId={companionId}
            companionC={companionC}
            size={48}
          />
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div className="fw-bold text-uppercase" style={{ color: '#9A6324', fontSize: '0.72rem' }}>
              {epSpeakerName}
            </div>
            <div className="fw-semibold" style={{ fontSize: '0.9rem', color: '#4A3420' }}>
              “{unitStory.epilogue.vi}”
            </div>
            {unitStory.epilogue.en && (
              <div className="small fst-italic mt-1" style={{ color: '#7C6550' }}>
                {unitStory.epilogue.en}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn btn-cowdi-primary w-100 py-2 fw-bold"
        onClick={handleFinish}
      >
        Xem kết quả kiểm tra →
      </button>
    </div>
  );
}
