import { Fragment, useState } from 'react';
import Icon, { EMOJI_ICON } from './Icon';

/**
 * <Emoji e="🐮" size={24} />
 * Renders any emoji in the Cowdi kawaii style:
 *  1. if the glyph has a hand-drawn Icon → use it
 *  2. otherwise → Twemoji SVG rendered as an outlined "sticker"
 *  3. if the SVG fails to load → native emoji glyph
 */
const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/';

// Matches a full emoji sequence (keycaps, ZWJ, modifiers, flags, VS16)
const EMOJI_RE =
  /(?:\p{RI}\p{RI}|\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?)*|[0-9#*]\uFE0F?\u20E3)/gu;

function toCodePoints(str) {
  const out = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    // Twemoji drops FE0F except in keycap sequences
    if (cp === 0xfe0f && !str.includes('\u20E3')) continue;
    out.push(cp.toString(16));
  }
  return out.join('-');
}

const trimVS = (s) => s.replace(/\uFE0F/g, '');

export function emojiIconName(e) {
  if (!e) return null;
  return EMOJI_ICON[e] || EMOJI_ICON[trimVS(e)] || EMOJI_ICON[e + '\uFE0F'] || null;
}

export default function Emoji({ e, size = 24, className = '', title, style, sticker = true }) {
  const [broken, setBroken] = useState(false);
  if (!e) return null;
  const isCss = typeof size === 'string';
  const box = isCss ? { width: size, height: size, ...style } : style;
  const icon = emojiIconName(e);
  if (icon) return <Icon name={icon} size={isCss ? undefined : size} className={className} title={title} style={box} />;

  if (broken) {
    return (
      <span
        className={`emoji-native ${className}`}
        style={{ fontSize: isCss ? size : size * 0.85, lineHeight: 1, ...style }}
        role="img"
        aria-label={title}
      >
        {e}
      </span>
    );
  }
  return (
    <img
      className={`ic emoji-sticker ${sticker ? 'is-sticker' : ''} ${className}`}
      src={`${TWEMOJI_BASE}${toCodePoints(e)}.svg`}
      width={isCss ? undefined : size}
      height={isCss ? undefined : size}
      alt={title || ''}
      title={title}
      loading="lazy"
      draggable={false}
      onError={() => setBroken(true)}
      style={box}
    />
  );
}

/**
 * <EmojiText size={20}>Chào bạn 🐮 Học ngay 🔥</EmojiText>
 * Replaces every emoji inside a string with <Emoji>.
 */
export function EmojiText({ children, size = '1.1em', className, as: Tag = Fragment, ...rest }) {
  const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : String(children ?? '');
  const parts = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(EMOJI_RE)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<Emoji key={`e${i++}`} e={m[0]} size={size} className={className} />);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  if (Tag === Fragment) return <>{parts}</>;
  return <Tag {...rest}>{parts}</Tag>;
}

export { EMOJI_RE };
