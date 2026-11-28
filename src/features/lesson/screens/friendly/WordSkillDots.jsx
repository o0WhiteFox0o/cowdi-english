import { TRACKED_SKILLS } from '../../../vocab/wordProgress';

const SKILL_DOT_META = {
  listen: { label: 'Nghe', color: '#2F7FD1' },
  read:   { label: 'Đọc',  color: '#B26B00' },
  write:  { label: 'Viết', color: '#6D4FC2' },
  speak:  { label: 'Nói',  color: '#C43D7A' },
};

/**
 * 4 chấm kỹ năng Nghe / Đọc / Viết / Nói của một từ (PHASE3 §6).
 */
export default function WordSkillDots({ progress, showLabels = false, compact = false }) {
  const sh = progress?.skillsHit || {};
  return (
    <span className="ff-skill-dots" aria-label="Tiến độ 4 kỹ năng của từ">
      {TRACKED_SKILLS.map((sk) => {
        const hit = Boolean(sh[sk]);
        const meta = SKILL_DOT_META[sk];
        return (
          <span
            key={sk}
            className="d-inline-flex align-items-center gap-1"
            title={`${meta.label}: ${hit ? 'Đã luyện' : 'Chưa luyện'}`}
          >
            <span
              className={`ff-skill-dot${hit ? ' is-hit' : ''}`}
              style={{
                backgroundColor: hit ? meta.color : undefined,
                width: compact ? 8 : 10,
                height: compact ? 8 : 10,
              }}
            />
            {showLabels && (
              <span style={{ fontSize: '0.72rem', color: hit ? meta.color : '#9A8470', fontWeight: hit ? 700 : 500 }}>
                {meta.label}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
