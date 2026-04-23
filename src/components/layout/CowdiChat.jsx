import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { usePet } from '../../hooks/usePet';
import { PET_REGISTRY, getPetMood, getPetMessage, getPetEvolution } from '../../data/pets';

// ── Snap positions (% of viewport, stored as {x,y} in px) ──
const SNAP_MARGIN = 16; // px from edge

// ── Per-page tips shown when navigating ─────────────────────
const PAGE_TIPS = {
  '/':              ['🏠 Chào mừng về trang chủ! Xem tiến độ và nhiệm vụ hàng ngày của bạn nhé!', '✨ Hôm nay học gì? Kiểm tra thử thách hàng ngày đi!'],
  '/lessons':       ['📚 Chọn bài học theo trình độ của bạn. Học từ dễ đến khó nhé!', '💡 Mỗi bài học có từ vựng, ngữ pháp và bài tập!'],
  '/vocabulary':    ['📖 Trang từ vựng theo chủ đề! Nhấn vào từ để nghe phát âm.', '🔊 Mẹo: Nghe và lặp lại to thành tiếng để nhớ lâu hơn!'],
  '/practice':      ['🎯 Luyện tập tổng hợp — chọn kỹ năng bạn muốn cải thiện!', '💪 Luyện tập đều đặn mỗi ngày, dù chỉ 10 phút thôi!'],
  '/review':        ['🔁 Ôn tập lại các từ và bài học đã học. Đừng để quên!', '⚡ Flashcard giúp ghi nhớ nhanh hơn rất nhiều đó!'],
  '/learning-path': ['🗺️ Lộ trình học của bạn! Theo dõi từng bước tiến bộ.', '🎯 Hoàn thành từng mốc để mở khóa nội dung mới!'],
  '/progress':      ['📊 Xem toàn bộ tiến độ học tập và thành tích của bạn!', '🏆 Bạn đã đi được bao xa rồi? Tiếp tục cố gắng nhé!'],
  '/pet':           ['🐾 Đây là pet của bạn! Chăm sóc và cho ăn để pet khỏe mạnh.', '💝 Pet hạnh phúc sẽ cho bạn thêm điểm thưởng khi học!'],
  '/collection':    ['🌟 Bộ sưu tập pet của bạn! Mở khóa pet mới bằng cách học giỏi.', '🥚 Một số pet đặc biệt cần điều kiện đặc biệt để mở khóa!'],
  '/shop':          ['🛒 Cửa hàng! Dùng coin để mua đồ cho pet và tăng sức mạnh.', '🪙 Kiếm coin bằng cách hoàn thành bài học và quiz!'],
  '/leaderboard':   ['🏆 Bảng xếp hạng! Xem bạn đang đứng ở đâu so với mọi người.', '📈 Học đều mỗi ngày để leo hạng nhanh hơn!'],
  '/duel':          ['⚔️ Đấu trường! Tạo thách đấu hoặc chấp nhận thách đấu từ người khác.', '🎯 Trả lời đúng để pet tấn công — trả lời sai thì bị tấn công!', '🔥 Combo 3 câu đúng liên tiếp để gây sát thương cực mạnh!'],
  '/mini-games':    ['🎮 Mini games vui mà vẫn học được! Thử hết 6 game xem bạn thích cái nào.', '🐝 Spelling Bee khó nhất đó — nghe và đánh vần chính xác!'],
  '/student-ranking': ['👥 Xếp hạng học sinh! Xem bạn bè cùng lớp đang học như thế nào.', '💪 Thi đua với bạn bè để cùng tiến bộ!'],
  '/account':       ['👤 Trang tài khoản — cập nhật thông tin và cài đặt của bạn.'],
};

function getPageTip(pathname) {
  const tips = PAGE_TIPS[pathname];
  if (!tips || tips.length === 0) return null;
  return tips[Math.floor(Math.random() * tips.length)];
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export default function CowdiChat() {
  const { getActivePetWithDecay } = usePet();
  const location = useLocation();
  const [open, setOpen]     = useState(false);
  const [msg, setMsg]       = useState('');
  const [pos, setPos]       = useState(null);   // null = use CSS default
  const [dragging, setDragging] = useState(false);

  // ── Show page tip on route change ───────────────────────
  useEffect(() => {
    const tip = getPageTip(location.pathname);
    if (!tip) return;
    setMsg(tip);
    setOpen(true);
    // Auto-hide after 5 seconds
    const t = setTimeout(() => setOpen(false), 5000);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const btnRef    = useRef(null);
  const dragState = useRef(null); // { startX, startY, origX, origY }

  // Only enable drag on touch devices or narrow screens
  const isMobile = () => window.innerWidth < 992;

  // ── Pointer-down: start drag ─────────────────────────────
  const onPointerDown = useCallback((e) => {
    if (!isMobile()) return;
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX:  rect.left,
      origY:  rect.top,
      moved:  false,
    };
    btn.setPointerCapture(e.pointerId);
    setDragging(false);
  }, []);

  // ── Pointer-move: move button ────────────────────────────
  const onPointerMove = useCallback((e) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (!dragState.current.moved && Math.hypot(dx, dy) < 5) return;
    dragState.current.moved = true;
    setDragging(true);

    const btn = btnRef.current;
    const btnW = btn?.offsetWidth  || 60;
    const btnH = btn?.offsetHeight || 60;
    const maxX = window.innerWidth  - btnW - SNAP_MARGIN;
    const maxY = window.innerHeight - btnH - SNAP_MARGIN;

    setPos({
      x: clamp(dragState.current.origX + dx, SNAP_MARGIN, maxX),
      y: clamp(dragState.current.origY + dy, SNAP_MARGIN, maxY),
    });
  }, []);

  // ── Pointer-up: snap to nearest edge ────────────────────
  const onPointerUp = useCallback((e) => {
    if (!dragState.current) return;
    const wasMoved = dragState.current.moved;
    dragState.current = null;

    if (!wasMoved) {
      // Tap — toggle bubble
      setDragging(false);
      toggle();
      return;
    }

    setDragging(false);
    // Snap to nearest horizontal edge
    setPos(prev => {
      if (!prev) return prev;
      const btn = btnRef.current;
      const btnW = btn?.offsetWidth || 60;
      const mid  = window.innerWidth / 2;
      const maxX = window.innerWidth - btnW - SNAP_MARGIN;
      return {
        x: prev.x + btnW / 2 < mid ? SNAP_MARGIN : maxX,
        y: clamp(prev.y, SNAP_MARGIN, window.innerHeight - (btn?.offsetHeight || 60) - SNAP_MARGIN),
      };
    });
  }, []);

  // ── Toggle bubble (desktop click / tap) ─────────────────
  function toggle() {
    setOpen(v => !v);
    if (!open) {
      const pet = getActivePetWithDecay();
      const mood = pet ? getPetMood(pet.needs) : 'happy';
      setMsg(getPetMessage(pet?.speciesId || 'cowdi', mood));
    }
  }

  // Desktop click (pointer-up without drag)
  function handleDesktopClick() {
    if (isMobile()) return; // handled by pointer-up
    toggle();
  }

  // Recalculate on resize
  useEffect(() => {
    function onResize() {
      if (!isMobile()) {
        setPos(null); // reset to CSS default on desktop
      }
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const pet     = getActivePetWithDecay();
  const species = pet ? PET_REGISTRY[pet.speciesId] : null;
  const evo     = pet && species ? getPetEvolution(pet.speciesId, pet.totalXpEarned) : null;
  const petEmoji = evo?.emoji || '🐮';
  const petImage = evo?.image || null;

  // Dynamic style when dragging/dragged on mobile
  const btnStyle = pos && isMobile() ? {
    position: 'fixed',
    left: pos.x,
    top:  pos.y,
    bottom: 'auto',
    right:  'auto',
    transition: dragging ? 'none' : 'left 0.25s ease, top 0.25s ease',
    touchAction: 'none',
  } : {};

  // Bubble follows button
  const bubbleStyle = pos && isMobile() ? {
    position: 'fixed',
    left:   pos.x > window.innerWidth / 2
              ? 'auto'
              : pos.x,
    right:  pos.x > window.innerWidth / 2
              ? window.innerWidth - pos.x - (btnRef.current?.offsetWidth || 60)
              : 'auto',
    top:    pos.y > 200 ? pos.y - 100 : pos.y + 70,
    bottom: 'auto',
  } : {};

  return (
    <>
      {open && (
        <div className="cowdi-chat-bubble" style={bubbleStyle}>
          <button
            className="cowdi-chat-close"
            onClick={() => setOpen(false)}
            aria-label="Đóng"
          >×</button>
          <p className="mb-0 text-dark small">{msg}</p>
        </div>
      )}
      <button
        ref={btnRef}
        className={`cowdi-chat-btn${dragging ? ' dragging' : ''}`}
        style={btnStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={handleDesktopClick}
        title={`Chat với ${species?.name || 'Cowdi'}`}
      >
        {petImage ? (
          <img src={petImage} alt={species?.name || 'Cowdi'} className="cowdi-chat-img" />
        ) : (
          petEmoji
        )}
      </button>
    </>
  );
}

