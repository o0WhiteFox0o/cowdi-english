import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

/**
 * QrScannerModal — Quét mã QR trực tiếp trong App (Camera sau hoặc chọn ảnh QR từ máy).
 * Dùng jsQR thuần JS để tương thích cả iOS Safari, Android Chrome và Desktop.
 */
export default function QrScannerModal({ open, onClose, onDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const detectedRef = useRef(false);

  const [cameraError, setCameraError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [imageError, setImageError] = useState(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        try { track.stop(); } catch {}
      }
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const handleSuccess = useCallback((decodedText) => {
    if (detectedRef.current) return;
    detectedRef.current = true;
    stopCamera();
    if (typeof onDetected === 'function') {
      onDetected(decodedText);
    }
  }, [stopCamera, onDetected]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      detectedRef.current = false;
      setCameraError(null);
      setImageError(null);
      return;
    }

    let cancelled = false;
    detectedRef.current = false;
    setCameraError(null);
    setImageError(null);

    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Trình duyệt không hỗ trợ mở camera trực tiếp. Hãy chọn ảnh QR từ thư viện ảnh bên dưới.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play();
        setCameraActive(true);

        let lastScan = 0;
        const tick = (ts) => {
          if (cancelled || detectedRef.current) return;
          if (ts - lastScan >= 120 && video.readyState === video.HAVE_ENOUGH_DATA) {
            lastScan = ts;
            const canvas = canvasRef.current;
            if (canvas) {
              const w = video.videoWidth || 480;
              const h = video.videoHeight || 480;
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d', { willReadFrequently: true });
              ctx.drawImage(video, 0, 0, w, h);
              const imgData = ctx.getImageData(0, 0, w, h);
              const code = jsQR(imgData.data, w, h, { inversionAttempts: 'dontInvert' });
              if (code && code.data) {
                handleSuccess(code.data);
                return;
              }
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (!cancelled) {
          setCameraError(
            err?.name === 'NotAllowedError'
              ? 'Bạn chưa cấp quyền camera. Có thể cấp quyền hoặc chọn ảnh QR từ máy bên dưới.'
              : 'Không mở được camera trên thiết bị này. Hãy chọn ảnh QR từ máy bên dưới.'
          );
        }
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera, handleSuccess]);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageError(null);
    try {
      const url = URL.createObjectURL(file);
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = url;
      });
      URL.revokeObjectURL(url);

      const maxDim = 1024;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imgData.data, w, h, { inversionAttempts: 'attemptBoth' });
      if (code && code.data) {
        handleSuccess(code.data);
      } else {
        setImageError('Không đọc được mã QR trong ảnh này. Hãy chọn ảnh rõ nét hơn nhé!');
      }
    } catch {
      setImageError('Không đọc được file ảnh này.');
    }
  }

  if (!open) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1100 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 p-3 shadow w-100"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0">📷 Quét mã QR bạn bè / thiệp mời</h6>
          <button type="button" className="btn btn-sm btn-light" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <p className="text-muted small mb-2">
          Hướng camera vào mã QR của bạn bè hoặc chọn ảnh QR đã lưu từ Zalo/máy.
        </p>

        {/* Camera viewport */}
        <div
          className="position-relative bg-dark rounded-3 overflow-hidden mb-3 d-flex align-items-center justify-content-center"
          style={{ width: '100%', aspectRatio: '1 / 1', maxHeight: 300 }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }}
          />
          {cameraActive && (
            <div
              style={{
                position: 'absolute',
                width: '68%',
                height: '68%',
                border: '3px solid rgba(255,255,255,0.85)',
                borderRadius: 16,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                pointerEvents: 'none',
              }}
            />
          )}
          {!cameraActive && !cameraError && (
            <div className="text-white small text-center p-3">
              <div className="spinner-border spinner-border-sm text-light mb-2" role="status" />
              <div>Đang mở camera...</div>
            </div>
          )}
          {cameraError && (
            <div className="text-white small text-center p-3">
              <div className="fs-3 mb-1">📸</div>
              <div>{cameraError}</div>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {imageError && (
          <div className="alert alert-warning py-2 px-3 small mb-2">{imageError}</div>
        )}

        <div className="d-grid gap-2">
          <label className="btn btn-outline-primary btn-sm mb-0">
            🖼️ Chọn ảnh QR từ máy / thư viện
            <input
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleImageUpload}
            />
          </label>
          <button type="button" className="btn btn-light btn-sm" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
