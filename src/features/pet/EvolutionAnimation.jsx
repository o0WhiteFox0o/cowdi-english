import { useEffect, useState } from 'react';

/**
 * EvolutionAnimation — hoạt ảnh tiến hóa kiểu Pokemon.
 *
 * Props:
 *  - oldEvo: { name, image?, emoji? }
 *  - newEvo: { name, image?, emoji? }
 *  - petName: tên custom của pet
 *  - onComplete: () => void  (gọi khi animation xong, để parent show kết quả)
 *  - onSkip: () => void
 */
export default function EvolutionAnimation({ oldEvo, newEvo, petName, onComplete, onSkip }) {
  // phases: intro (0.5s) → flashing (2.5s) → reveal (0.8s) → complete
  const [phase, setPhase] = useState('intro');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flashing'), 500);
    const t2 = setTimeout(() => setPhase('reveal'),   3000);
    const t3 = setTimeout(() => { setPhase('done'); onComplete && onComplete(); }, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showOld = phase === 'intro' || phase === 'flashing';
  const showNew = phase === 'reveal' || phase === 'done';
  const evo = showNew ? newEvo : oldEvo;

  return (
    <div className="cowdi-evo-overlay" role="dialog" aria-label="Pet đang tiến hóa">
      {/* Light rays rotating */}
      <div className={`cowdi-evo-rays ${phase}`} />
      {/* Sparkles */}
      <div className="cowdi-evo-sparkles">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="cowdi-evo-spark" style={{
            left: `${(i * 73) % 100}%`,
            top:  `${(i * 41) % 100}%`,
            animationDelay: `${(i * 137) % 1800}ms`,
          }}>✨</span>
        ))}
      </div>

      {/* Pet image (white-out flash overlay during flashing) */}
      <div className={`cowdi-evo-stage ${phase}`}>
        <div className="cowdi-evo-pet-wrap">
          {evo?.image ? (
            <img src={evo.image} alt={evo.name} className="cowdi-evo-pet-img" draggable={false} />
          ) : (
            <span className="cowdi-evo-pet-emoji">{evo?.emoji || '🥚'}</span>
          )}
          <div className="cowdi-evo-flash" />
        </div>

        <div className="cowdi-evo-caption">
          {phase === 'intro'    && <span>{petName || oldEvo?.name} đang tiến hóa…</span>}
          {phase === 'flashing' && <span>Một luồng sáng bao trùm…</span>}
          {(phase === 'reveal' || phase === 'done') && (
            <span className="cowdi-evo-newname">🎉 {newEvo?.name}!</span>
          )}
        </div>
      </div>

      <button type="button" className="cowdi-evo-skip" onClick={onSkip}>
        Bỏ qua ›
      </button>

      <style>{`
        .cowdi-evo-overlay {
          position: fixed; inset: 0; z-index: 1200;
          background: radial-gradient(circle at 50% 50%, #1a1330 0%, #060410 70%);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          animation: cowdiEvoFadeIn 0.3s ease-out;
        }
        @keyframes cowdiEvoFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .cowdi-evo-rays {
          position: absolute; inset: -25%;
          background: conic-gradient(from 0deg,
            rgba(255,255,255,0.0) 0deg, rgba(255,221,87,0.35) 12deg,
            rgba(255,255,255,0.0) 24deg, rgba(120,200,255,0.30) 36deg,
            rgba(255,255,255,0.0) 48deg, rgba(255,221,87,0.35) 60deg,
            rgba(255,255,255,0.0) 72deg);
          animation: cowdiEvoSpin 6s linear infinite;
          opacity: 0.6;
          mix-blend-mode: screen;
        }
        .cowdi-evo-rays.flashing { animation-duration: 1.5s; opacity: 0.95; }
        .cowdi-evo-rays.reveal   { animation-duration: 3s;   opacity: 0.85; }
        @keyframes cowdiEvoSpin { to { transform: rotate(360deg); } }

        .cowdi-evo-sparkles { position: absolute; inset: 0; pointer-events: none; }
        .cowdi-evo-spark {
          position: absolute; font-size: 1.4rem;
          animation: cowdiEvoSparkFloat 1.8s ease-in-out infinite;
          opacity: 0;
          filter: drop-shadow(0 0 6px #fff8a8);
        }
        @keyframes cowdiEvoSparkFloat {
          0%   { opacity: 0; transform: translateY(20px) scale(0.4); }
          50%  { opacity: 1; transform: translateY(-10px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.6); }
        }

        .cowdi-evo-stage {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center; gap: 24px;
        }
        .cowdi-evo-pet-wrap {
          position: relative; width: 220px; height: 220px;
          display: flex; align-items: center; justify-content: center;
        }
        .cowdi-evo-pet-img {
          width: 100%; height: 100%; object-fit: contain;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.6));
          animation: cowdiEvoBob 1.4s ease-in-out infinite;
        }
        .cowdi-evo-pet-emoji {
          font-size: 9rem; line-height: 1;
          animation: cowdiEvoBob 1.4s ease-in-out infinite;
        }
        @keyframes cowdiEvoBob {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-10px) scale(1.04); }
        }

        /* Flash overlay – white silhouette pulse during flashing phase */
        .cowdi-evo-flash {
          position: absolute; inset: 0;
          background: #fff; border-radius: 50%;
          opacity: 0; pointer-events: none;
          mix-blend-mode: screen;
        }
        .cowdi-evo-stage.flashing .cowdi-evo-flash {
          animation: cowdiEvoFlash 0.35s ease-in-out infinite alternate;
        }
        .cowdi-evo-stage.flashing .cowdi-evo-pet-img,
        .cowdi-evo-stage.flashing .cowdi-evo-pet-emoji {
          animation: cowdiEvoFlashShake 0.35s ease-in-out infinite alternate;
          filter: brightness(2) drop-shadow(0 0 30px #fff8a8);
        }
        @keyframes cowdiEvoFlash {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 0.85; transform: scale(1.15); }
        }
        @keyframes cowdiEvoFlashShake {
          0%   { transform: translateX(-6px) scale(1); }
          100% { transform: translateX(6px)  scale(1.08); }
        }

        /* Reveal: scale up burst */
        .cowdi-evo-stage.reveal .cowdi-evo-pet-img,
        .cowdi-evo-stage.reveal .cowdi-evo-pet-emoji {
          animation: cowdiEvoReveal 0.8s cubic-bezier(.2,1.4,.4,1) forwards;
        }
        @keyframes cowdiEvoReveal {
          0%   { transform: scale(0.4) rotate(-20deg); opacity: 0; filter: brightness(3); }
          60%  { transform: scale(1.25) rotate(8deg);  opacity: 1; filter: brightness(1.4); }
          100% { transform: scale(1) rotate(0); opacity: 1; filter: brightness(1); }
        }

        .cowdi-evo-caption {
          color: #fff; font-weight: 700; font-size: 1.15rem;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
          letter-spacing: 0.5px;
          text-align: center; min-height: 1.8em;
        }
        .cowdi-evo-newname {
          font-size: 1.6rem;
          background: linear-gradient(90deg, #ffd86b, #ff9a3c);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: cowdiEvoNamePop 0.6s ease-out;
        }
        @keyframes cowdiEvoNamePop {
          0%   { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }

        .cowdi-evo-skip {
          position: absolute; top: 18px; right: 18px;
          background: rgba(255,255,255,0.12);
          color: #fff; border: 1px solid rgba(255,255,255,0.25);
          padding: 6px 14px; border-radius: 999px; font-size: 0.9rem;
          backdrop-filter: blur(8px);
          cursor: pointer;
        }
        .cowdi-evo-skip:hover { background: rgba(255,255,255,0.22); }
      `}</style>
    </div>
  );
}
