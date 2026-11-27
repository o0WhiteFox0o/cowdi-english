import { useState } from 'react';
import { BOSS_TINT } from '../../../../../shared/regions';

/**
 * FogBossSvg — Boss Sương Mù inline SVG (từ public/image/boss/fog.svg).
 * Ưu tiên ảnh /image/boss/fog.webp nếu tồn tại; mặc định dùng SVG inline để áp CSS variables
 * --fog-body, --fog-shade, --fog-eye từ BOSS_TINT[region] (ADDENDUM §2).
 */
export default function FogBossSvg({ region = 'BD', animState = 'idle', size = 128 }) {
  const [webpOk, setWebpOk] = useState(false);
  const [webpFailed, setWebpFailed] = useState(false);
  const tint = BOSS_TINT[region] || BOSS_TINT.BD;

  const stateCls = animState === 'hit'
    ? 'is-hit'
    : animState === 'dissolve'
      ? 'is-dissolve'
      : animState === 'flee'
        ? 'is-flee'
        : '';

  return (
    <div
      className={`ff-fog-wrap ${stateCls}`}
      style={{
        '--fog-body': tint.body,
        '--fog-shade': tint.shade,
        '--fog-eye': tint.eye,
        width: size,
        height: Math.round(size * 0.87),
      }}
    >
      {/* Kiểm tra ảnh fog.webp tùy chọn nếu sau này Sonny thêm */}
      {!webpFailed && (
        <img
          src="/image/boss/fog.webp"
          alt="Boss Sương Mù"
          onLoad={() => setWebpOk(true)}
          onError={() => setWebpFailed(true)}
          style={{
            display: webpOk ? 'block' : 'none',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      )}

      {!webpOk && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 260"
          width={size}
          height={Math.round(size * 0.87)}
          role="img"
          aria-label="Boss Sương Mù"
        >
          <g>
            <circle fill="var(--fog-shade, #C9D4DD)" cx="92" cy="160" r="70" />
            <circle fill="var(--fog-shade, #C9D4DD)" cx="214" cy="170" r="62" />
            <circle fill="var(--fog-body, #DCE3E9)" cx="150" cy="112" r="88" />
            <circle fill="var(--fog-body, #DCE3E9)" cx="78" cy="140" r="62" />
            <circle fill="var(--fog-body, #DCE3E9)" cx="226" cy="140" r="58" />
            <circle fill="var(--fog-shade, #C9D4DD)" cx="120" cy="206" r="48" />
            <circle fill="var(--fog-shade, #C9D4DD)" cx="186" cy="210" r="44" />
            <circle fill="var(--fog-body, #DCE3E9)" cx="150" cy="190" r="50" />
          </g>
          <g>
            <path
              fill="none"
              stroke="var(--fog-eye, #2B3640)"
              strokeWidth="7"
              strokeLinecap="round"
              d="M104 96 L136 110"
            />
            <path
              fill="none"
              stroke="var(--fog-eye, #2B3640)"
              strokeWidth="7"
              strokeLinecap="round"
              d="M196 96 L164 110"
            />
            <circle fill="var(--fog-eye, #2B3640)" cx="124" cy="128" r="11" />
            <circle fill="var(--fog-eye, #2B3640)" cx="176" cy="128" r="11" />
            <circle fill="#FFFFFF" cx="128" cy="124" r="3.5" />
            <circle fill="#FFFFFF" cx="180" cy="124" r="3.5" />
            <path
              fill="none"
              stroke="var(--fog-eye, #2B3640)"
              strokeWidth="7"
              strokeLinecap="round"
              d="M128 172 Q150 156 172 172"
            />
          </g>
        </svg>
      )}
    </div>
  );
}
