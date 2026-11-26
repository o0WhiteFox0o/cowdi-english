// <PetThought> — bong bóng suy nghĩ Tầng 2: hình tròn trắng 50px + chấm nối 10px + icon SVG nét 26px.

const THOUGHT_LABEL = {
  book: 'Gợi ý học bài',
  milk: 'Gợi ý uống sữa',
  trophy: 'Chúc mừng hoàn thành',
  zzz: 'Giờ nghỉ ngơi',
  heart: 'Vui vẻ',
  question: 'Đang suy nghĩ',
  music: 'Âm nhạc',
};

function ThoughtSvg({ icon }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#5E9A35',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  switch (icon) {
    case 'book':
      return (
        <svg {...common}>
          <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z" />
          <path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
        </svg>
      );
    case 'milk':
      return (
        <svg {...common}>
          <path d="M8 3h8l1 4v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7l1-4z" />
          <path d="M7 11h10" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...common}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
          <path d="M8 6H5a2 2 0 0 0 0 4h3" />
          <path d="M16 6h3a2 2 0 0 1 0 4h-3" />
          <path d="M12 13v4" />
          <path d="M8 20h8" />
        </svg>
      );
    case 'zzz':
      return (
        <svg {...common}>
          <path d="M5 7h6l-6 6h6" />
          <path d="M13 11h6l-6 6h6" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.5-8.5-9A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8.5 4c-1.5 4.5-8.5 9-8.5 9z" />
        </svg>
      );
    case 'music':
      return (
        <svg {...common}>
          <path d="M9 18V6l10-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="16.5" cy="16" r="2.5" />
        </svg>
      );
    case 'question':
    default:
      return (
        <svg {...common}>
          <path d="M9.5 9a2.8 2.8 0 0 1 5.2 1.3c0 1.8-2.7 2.2-2.7 4.2" />
          <circle cx="12" cy="18" r="0.8" fill="#5E9A35" />
        </svg>
      );
  }
}

export default function PetThought({ icon, className = '' }) {
  if (!icon) return null;
  return (
    <div
      className={`pd-thought${className ? ` ${className}` : ''}`}
      role="status"
      aria-label={THOUGHT_LABEL[icon] || 'Biểu cảm pet'}
    >
      <div className="pd-thought-bubble">
        <ThoughtSvg icon={icon} />
      </div>
      <span className="pd-thought-dot" aria-hidden="true" />
    </div>
  );
}
