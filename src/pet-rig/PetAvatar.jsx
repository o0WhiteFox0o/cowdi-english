// <PetAvatar> — bọc PetRig cho React.
// Tự tải dữ liệu đã duyệt từ GET /api/pet-motion/:petId (cache trong bộ nhớ theo petId).
// Nếu pet-cấp chưa có rig đã duyệt: hiển thị ảnh tĩnh hiện có và bỏ qua mọi lệnh emit, không lỗi.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PET_REGISTRY } from '../data/pets';
import { PetRig } from './PetRig.js';
import { fetchPetMotion, getCachedPetMotion, getMotionApiBase } from './motionCache.js';

export const PetAvatar = forwardRef(function PetAvatar(
  {
    petId,
    stage = 1,
    group,
    bond = 0,
    topSkill = 'reading',
    mode = 'home',
    motion: motionProp,
    basePath = getMotionApiBase(),
    fallbackSrc,
    alt,
    className,
    style,
    imgClassName,
    imgStyle,
    timeScale = 1,
    onClip,
    onDiagnostic,
  },
  ref
) {
  const { token } = useAuth();
  const reg = PET_REGISTRY[petId] || null;
  const resolvedGroup = group || reg?.group || 'farm';
  const clampedStage = Math.max(1, Math.min(5, Number(stage) || 1));
  const evo = reg?.evolutions?.[clampedStage - 1] || reg?.evolutions?.[0] || null;
  const staticSrc = fallbackSrc || evo?.image || '/assets/images/logo/MiniLogoCowdi.svg';
  const label = alt || evo?.name || reg?.name || 'Pet của bạn';

  const [fetchedMotion, setFetchedMotion] = useState(() =>
    motionProp !== undefined ? motionProp : getCachedPetMotion(petId) || null
  );
  const [rigFailed, setRigFailed] = useState(false);

  const motion = motionProp !== undefined ? motionProp : fetchedMotion;
  const stageApproved = Boolean(
    !rigFailed && motion?.[`c${clampedStage}`]?.rig && Array.isArray(motion[`c${clampedStage}`].rig.slots)
  );

  const canvasRef = useRef(null);
  const rigRef = useRef(null);
  const pendingEventsRef = useRef([]);

  // Tải dữ liệu đã duyệt 1 lần mỗi petId (cache trong bộ nhớ)
  useEffect(() => {
    if (motionProp !== undefined) {
      setFetchedMotion(motionProp);
      return;
    }
    setRigFailed(false);
    if (!petId || !token) {
      setFetchedMotion({});
      pendingEventsRef.current = [];
      return;
    }
    const cached = getCachedPetMotion(petId);
    if (cached !== undefined) {
      setFetchedMotion(cached);
      return;
    }
    let cancelled = false;
    fetchPetMotion(petId, token, { apiBase: basePath }).then((data) => {
      if (!cancelled) setFetchedMotion(data);
    });
    return () => {
      cancelled = true;
    };
  }, [petId, token, motionProp, basePath]);

  // Xoá hàng đợi sự kiện nếu đã tải xong mà pet-cấp chưa duyệt rig
  useEffect(() => {
    if (motion !== null && !stageApproved) {
      pendingEventsRef.current = [];
    }
  }, [motion, stageApproved]);

  // Khởi tạo PetRig chỉ khi pet-cấp có rig đã duyệt
  useEffect(() => {
    if (!stageApproved || !canvasRef.current) {
      if (rigRef.current) {
        rigRef.current.destroy();
        rigRef.current = null;
      }
      return;
    }

    const rig = new PetRig(canvasRef.current, {
      petId,
      stage: clampedStage,
      group: resolvedGroup,
      bond,
      topSkill,
      mode,
      motion,
      basePath,
      timeScale,
      onClip,
      onDiagnostic,
    });
    rigRef.current = rig;
    let active = true;
    rig
      .load(motion)
      .then(() => {
        if (!active || rigRef.current !== rig) return;
        const now = Date.now();
        const queued = pendingEventsRef.current.splice(0);
        for (const item of queued) {
          if (now - item.ts <= 4000) {
            rig.emit(item.event, item.data);
          }
        }
      })
      .catch(() => {
        if (active) setRigFailed(true);
      });

    return () => {
      active = false;
      rig.destroy();
      if (rigRef.current === rig) rigRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId, stageApproved, motion, basePath]);

  useEffect(() => {
    rigRef.current?.setStage(clampedStage);
  }, [clampedStage]);
  useEffect(() => {
    if (rigRef.current) rigRef.current.o.group = resolvedGroup;
  }, [resolvedGroup]);
  useEffect(() => {
    rigRef.current?.setBond(bond);
  }, [bond]);
  useEffect(() => {
    rigRef.current?.setTopSkill(topSkill);
  }, [topSkill]);
  useEffect(() => {
    rigRef.current?.setMode(mode);
  }, [mode]);
  useEffect(() => {
    rigRef.current?.setTimeScale(timeScale);
  }, [timeScale]);
  useEffect(() => {
    if (rigRef.current) rigRef.current.o.onDiagnostic = onDiagnostic || null;
  }, [onDiagnostic]);
  useEffect(() => {
    if (rigRef.current) rigRef.current.o.onClip = onClip || null;
  }, [onClip]);

  useImperativeHandle(
    ref,
    () => ({
      emit: (event, data) => {
        if (stageApproved && rigRef.current) {
          rigRef.current.emit(event, data);
        } else if (motion === null && !rigFailed) {
          // Chờ tải xong dữ liệu lần đầu rồi phát lại sự kiện mở màn (app_open, lesson_start, battle_start...)
          pendingEventsRef.current.push({ event, data, ts: Date.now() });
          if (pendingEventsRef.current.length > 4) pendingEventsRef.current.shift();
        } else if (onDiagnostic) {
          onDiagnostic({
            event,
            requested: null,
            played: null,
            fallback: false,
            skipped: true,
            reason: 'unapproved_rig',
            currentClip: null,
          });
        }
      },
      say: (text, ms) => {
        if (stageApproved) rigRef.current?.say(text, ms);
      },
      setMicLevel: (v) => {
        if (stageApproved) rigRef.current?.setMicLevel(v);
      },
      setVoiceLevel: (v) => {
        if (stageApproved) rigRef.current?.setVoiceLevel(v);
      },
      getCurrentClip: () => rigRef.current?.cur?.name || null,
      hasApprovedRig: () => stageApproved,
    }),
    [stageApproved, motion, rigFailed, onDiagnostic]
  );

  if (!stageApproved) {
    return (
      <img
        src={staticSrc}
        alt={label}
        className={imgClassName || className}
        style={{ objectFit: 'contain', display: 'block', ...style, ...imgStyle }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        aspectRatio: '420 / 460',
        touchAction: 'none',
        display: 'block',
        ...(className ? {} : { width: '100%' }),
        ...style,
      }}
      aria-label={`${label}, chạm để tương tác`}
    />
  );
});

/** Kỹ năng mạnh nhất từ pet.skills ({listening, speaking, reading, writing}) */
export function topSkillOf(skills = {}) {
  const order = ['listening', 'speaking', 'reading', 'writing'];
  return order.reduce((best, k) => ((skills[k] || 0) > (skills[best] || 0) ? k : best), 'reading');
}

/** Tổng điểm gắn bó */
export function bondOf(skills = {}) {
  return (skills.listening || 0) + (skills.speaking || 0) + (skills.reading || 0) + (skills.writing || 0);
}
