import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const QUICK_COLORS = [
  '#231f20', '#ffffff', '#2f9e4f', '#6ecb63', '#c8efbc', '#1b4332',
  '#f6c343', '#ff8c42', '#ef6f8c', '#e04f5f', '#4ea8de', '#8b5a2b',
];

const TOOLS = [
  { id: 'brush',      icon: '🖌️', label: 'Cọ vẽ',           key: 'B' },
  { id: 'eraser',     icon: '🧽', label: 'Tẩy',             key: 'E' },
  { id: 'fill',       icon: '🪣', label: 'Tô vùng',         key: 'G' },
  { id: 'eyedropper', icon: '💉', label: 'Hút màu',         key: 'I' },
  { id: 'rect',       icon: '▭',  label: 'Chọn chữ nhật',   key: 'M' },
  { id: 'ellipse',    icon: '◯',  label: 'Chọn bầu dục',    key: 'O' },
  { id: 'lasso',      icon: '➰', label: 'Chọn tự do',      key: 'L' },
  { id: 'wand',       icon: '🪄', label: 'Đũa thần',        key: 'W' },
  { id: 'move',       icon: '✥',  label: 'Di chuyển lớp',   key: 'V' },
];

const BRUSH_TIPS = [
  { id: 'round',       label: 'Tròn' },
  { id: 'square',      label: 'Vuông pixel' },
  { id: 'calligraphy', label: 'Nét nghiêng' },
];

const RULER_SIZE = 22;

function hexToRgba(hex, alpha = 255) {
  const clean = String(hex || '#000000').replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16) || 0;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255, alpha];
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
      .join('')
  );
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function cloneImageData(imgData) {
  return new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
}

/** Kiểm tra điểm (px, py) có nằm trong đa giác lasso không (ray-casting) */
function pointInPolygon(px, py, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x;
    const yi = pts[i].y;
    const xj = pts[j].x;
    const yj = pts[j].y;
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Tính bbox của selection mask (Uint8Array) */
function maskBounds(mask, w, h) {
  if (!mask) return null;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      if (mask[row + x]) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < x0) return null;
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Tính danh sách pixel biên của selection mask để vẽ nét đứt */
function computeMaskEdges(mask, w, h) {
  if (!mask) return [];
  const edges = [];
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      if (!mask[row + x]) continue;
      const top = y === 0 || !mask[row - w + x];
      const bot = y === h - 1 || !mask[row + w + x];
      const left = x === 0 || !mask[row + x - 1];
      const right = x === w - 1 || !mask[row + x + 1];
      if (top || bot || left || right) {
        edges.push(x, y, (top ? 1 : 0) | (bot ? 2 : 0) | (left ? 4 : 0) | (right ? 8 : 0));
      }
    }
  }
  return edges;
}

/** Kết hợp mask mới vào mask cũ theo chế độ replace / add / sub */
function applyMaskOp(existing, next, mode) {
  if (mode === 'replace' || !existing) return next;
  const out = new Uint8Array(existing);
  for (let i = 0; i < out.length; i++) {
    if (mode === 'add') {
      if (next[i]) out[i] = 255;
    } else if (mode === 'sub') {
      if (next[i]) out[i] = 0;
    }
  }
  return out;
}

/** Magic wand: trả về Uint8Array mask theo màu tại (sx, sy) */
function magicWandMask(imageData, sx, sy, tolerance = 28, contiguous = true) {
  const { width, height, data } = imageData;
  const out = new Uint8Array(width * height);
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return out;
  const sIdx = (sy * width + sx) * 4;
  const sr = data[sIdx];
  const sg = data[sIdx + 1];
  const sb = data[sIdx + 2];
  const sa = data[sIdx + 3];
  const tol = Math.max(0, tolerance);
  const match = (idx) => {
    if (sa <= 20) return data[idx + 3] <= 20 + tol;
    return (
      Math.abs(data[idx] - sr) <= tol &&
      Math.abs(data[idx + 1] - sg) <= tol &&
      Math.abs(data[idx + 2] - sb) <= tol &&
      Math.abs(data[idx + 3] - sa) <= tol
    );
  };
  if (!contiguous) {
    for (let i = 0; i < width * height; i++) {
      if (match(i * 4)) out[i] = 255;
    }
    return out;
  }
  const stack = [sx, sy];
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    const pos = y * width + x;
    if (out[pos]) continue;
    if (!match(pos * 4)) continue;
    out[pos] = 255;
    if (x > 0 && !out[pos - 1]) stack.push(x - 1, y);
    if (x + 1 < width && !out[pos + 1]) stack.push(x + 1, y);
    if (y > 0 && !out[pos - width]) stack.push(x, y - 1);
    if (y + 1 < height && !out[pos + width]) stack.push(x, y + 1);
  }
  return out;
}

/** Flood fill có hỗ trợ giới hạn trong selection mask */
function floodFill(imageData, sx, sy, fillRgba, tolerance = 28, selMask = null, contiguous = true) {
  const { width, height, data } = imageData;
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return false;
  if (selMask && !selMask[sy * width + sx]) return false;

  const startIdx = (sy * width + sx) * 4;
  const sr = data[startIdx];
  const sg = data[startIdx + 1];
  const sb = data[startIdx + 2];
  const sa = data[startIdx + 3];

  const [fr, fg, fb, fa] = fillRgba;
  if (sr === fr && sg === fg && sb === fb && sa === fa) return false;

  const tol = Math.max(0, tolerance);
  const match = (pos) => {
    if (selMask && !selMask[pos]) return false;
    const idx = pos * 4;
    if (sa <= 20) return data[idx + 3] <= 20 + tol;
    return (
      Math.abs(data[idx] - sr) <= tol &&
      Math.abs(data[idx + 1] - sg) <= tol &&
      Math.abs(data[idx + 2] - sb) <= tol &&
      Math.abs(data[idx + 3] - sa) <= tol
    );
  };

  let changed = false;
  if (!contiguous) {
    for (let pos = 0; pos < width * height; pos++) {
      if (!match(pos)) continue;
      const idx = pos * 4;
      data[idx] = fr;
      data[idx + 1] = fg;
      data[idx + 2] = fb;
      data[idx + 3] = fa;
      changed = true;
    }
    return changed;
  }

  const visited = new Uint8Array(width * height);
  const stack = [sx, sy];
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    const pos = y * width + x;
    if (visited[pos] || !match(pos)) continue;
    visited[pos] = 1;
    const idx = pos * 4;
    data[idx] = fr;
    data[idx + 1] = fg;
    data[idx + 2] = fb;
    data[idx + 3] = fa;
    changed = true;
    if (x > 0 && !visited[pos - 1]) stack.push(x - 1, y);
    if (x + 1 < width && !visited[pos + 1]) stack.push(x + 1, y);
    if (y > 0 && !visited[pos - width]) stack.push(x, y - 1);
    if (y + 1 < height && !visited[pos + width]) stack.push(x, y + 1);
  }
  return changed;
}

/**
 * Trình sửa ảnh bộ phận dạng studio:
 * - Bố cục 3 cột cố định: thanh công cụ trái + sân khấu tối kèm thước đo + bảng thuộc tính & Layer bên phải
 *   (chuyển giữa mọi công cụ B/E/G/I/M/O/L/W/V không bao giờ giật khung hình)
 * - Hỗ trợ nhiều Layer (thêm, nhân đôi, gộp xuống, sắp xếp, ẩn/hiện, khoá, độ mờ, xem thumbnail)
 * - Hỗ trợ Lớp tham chiếu riêng cho từng bộ phận khác
 * - Thước đo X/Y theo pixel + vạch theo con trỏ + đo kích thước vùng chọn
 * - Vùng chọn (Chữ nhật, Bầu dục, Tự do, Đũa thần) với nét đứt, cắt/xoá/đảo/tách layer mới & cắt nét vẽ theo vùng chọn
 * - Tuỳ chỉnh cọ sâu: đầu cọ (Tròn, Vuông pixel, Nét nghiêng), cỡ, độ mờ, độ cứng viền, khoảng cách nét, làm mượt nét + xem trước nét cọ
 */
export default function PartPaintModal({
  part,
  partLabel,
  petLabel,
  stage,
  image,
  referenceLayers = [],
  initialDirty = false,
  initialTool = 'brush',
  suggestedSources = [],
  onLoadSuggestedSource = null,
  saving = false,
  onSave,
  onClose,
}) {
  const imgW = image?.naturalWidth || image?.width || 512;
  const imgH = image?.naturalHeight || image?.height || 512;

  const calcFitZoom = useCallback(() => {
    const maxDim = Math.max(imgW, imgH, 1);
    const target = 440;
    const raw = target / maxDim;
    return Math.max(0.5, Math.min(20, +(raw < 1 ? raw : Math.round(raw * 2) / 2)));
  }, [imgW, imgH]);

  // ── Tool & Brush states ────────────────────────────────────────
  const [tool, setTool] = useState(initialTool || 'brush');
  const [color, setColor] = useState('#231f20');
  const [recentColors, setRecentColors] = useState([]);
  const [brushTip, setBrushTip] = useState('round'); // 'round' | 'square' | 'calligraphy'
  const [brushSize, setBrushSize] = useState(() => (Math.max(imgW, imgH) <= 48 ? 2 : 6));
  const [opacity, setOpacity] = useState(100);
  const [hardness, setHardness] = useState(100); // 0..100
  const [spacing, setSpacing] = useState(20); // 10..100 (% of brushSize)
  const [smoothing, setSmoothing] = useState(25); // 0..80 (%)
  const [fillTol, setFillTol] = useState(28);
  const [contiguous, setContiguous] = useState(true);
  const [selMode, setSelMode] = useState('replace'); // 'replace' | 'add' | 'sub'

  // ── Viewport states ────────────────────────────────────────────
  const [zoom, setZoom] = useState(calcFitZoom);
  const [showRulers, setShowRulers] = useState(true);
  const [showGrid, setShowGrid] = useState(() => Math.max(imgW, imgH) <= 48);
  const [refVisible, setRefVisible] = useState(() => {
    const init = {};
    const defaultOn = !String(part).startsWith('eye');
    referenceLayers.forEach((l) => { init[l.name] = defaultOn; });
    return init;
  });
  const [refOpacity, setRefOpacity] = useState(35);
  const [cursorPos, setCursorPos] = useState(null);

  // ── Layers & Selection states ──────────────────────────────────
  const [layers, setLayers] = useState([]); // [{ id, name, visible, locked, opacity, rev }]
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [selBounds, setSelBounds] = useState(null);
  const [dragInfo, setDragInfo] = useState(null); // live drag rect/ellipse/lasso readout

  // ── History & dirty flags ──────────────────────────────────────
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [dirty, setDirty] = useState(Boolean(initialDirty));
  const [selectedSourceIdx, setSelectedSourceIdx] = useState(0);
  const [loadingSource, setLoadingSource] = useState(false);

  // ── Refs for fast 60fps canvas drawing ─────────────────────────
  const layerCanvasesRef = useRef(new Map()); // id -> HTMLCanvasElement
  const nextLayerNumRef = useRef(2);
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const activeLayerIdRef = useRef(activeLayerId);
  activeLayerIdRef.current = activeLayerId;

  const selMaskRef = useRef(null); // Uint8Array(imgW * imgH) | null
  const selEdgesRef = useRef([]); // flat [x, y, bitmask, ...]
  const antsOffsetRef = useRef(0);

  const displayCanvasRef = useRef(null);
  const rulerTopRef = useRef(null);
  const rulerLeftRef = useRef(null);
  const stageScrollRef = useRef(null);
  const brushPreviewRef = useRef(null);
  const historyRef = useRef({ stack: [], index: -1 });
  const interactionRef = useRef(null);
  const strokeScratchRef = useRef(null); // temp canvas for selection-clipped stroke

  const activeLayer = useMemo(
    () => layers.find((l) => l.id === activeLayerId) || layers[layers.length - 1] || null,
    [layers, activeLayerId]
  );

  const pushRecentColor = useCallback((hex) => {
    const clean = hex.toLowerCase();
    setRecentColors((prev) => [clean, ...prev.filter((c) => c !== clean)].slice(0, 8));
  }, []);

  const syncHistoryFlags = useCallback(() => {
    const h = historyRef.current;
    setCanUndo(h.index > 0);
    setCanRedo(h.index >= 0 && h.index < h.stack.length - 1);
  }, []);

  const pushSnapshot = useCallback((customLayers = null, customActiveId = null) => {
    const list = customLayers || layersRef.current;
    const actId = customActiveId ?? activeLayerIdRef.current;
    const snap = {
      activeLayerId: actId,
      layers: list.map((l) => {
        const c = layerCanvasesRef.current.get(l.id);
        const data = c
          ? cloneImageData(c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, imgW, imgH))
          : new ImageData(imgW, imgH);
        return {
          id: l.id,
          name: l.name,
          visible: l.visible,
          locked: l.locked,
          opacity: l.opacity,
          data,
        };
      }),
    };
    const h = historyRef.current;
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(snap);
    if (h.stack.length > 25) h.stack.shift();
    h.index = h.stack.length - 1;
    syncHistoryFlags();
  }, [imgW, imgH, syncHistoryFlags]);

  const setSelectionMask = useCallback((mask) => {
    const b = maskBounds(mask, imgW, imgH);
    if (!b) {
      selMaskRef.current = null;
      selEdgesRef.current = [];
      setHasSelection(false);
      setSelBounds(null);
    } else {
      selMaskRef.current = mask;
      selEdgesRef.current = computeMaskEdges(mask, imgW, imgH);
      setHasSelection(true);
      setSelBounds(b);
    }
  }, [imgW, imgH]);

  // ── Draw Rulers (X top & Y left) ───────────────────────────────
  const drawRulers = useCallback((curPt = cursorPos) => {
    if (!showRulers) return;
    const dispW = Math.max(1, Math.round(imgW * zoom));
    const dispH = Math.max(1, Math.round(imgH * zoom));

    // Chọn bước vạch chia dễ đọc theo mức zoom
    const majorStep = zoom >= 8 ? 5 : zoom >= 3 ? 10 : zoom >= 1.5 ? 20 : 50;
    const minorStep = majorStep >= 50 ? 10 : majorStep >= 20 ? 5 : majorStep >= 10 ? 2 : 1;

    const drawAxis = (canvas, len, maxPx, isX) => {
      if (!canvas) return;
      const w = isX ? len : RULER_SIZE;
      const h = isX ? RULER_SIZE : len;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#252c35';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#6c7a89';
      ctx.fillStyle = '#c5d1dc';
      ctx.font = '10px ui-monospace, Menlo, monospace';
      ctx.lineWidth = 1;

      // Vùng chọn highlight trên thước
      const sb = selBounds;
      if (sb) {
        ctx.fillStyle = 'rgba(47, 158, 79, 0.35)';
        if (isX) ctx.fillRect(sb.x0 * zoom, 0, sb.w * zoom, h);
        else ctx.fillRect(0, sb.y0 * zoom, w, sb.h * zoom);
        ctx.fillStyle = '#c5d1dc';
      }

      ctx.beginPath();
      for (let p = 0; p <= maxPx; p += minorStep) {
        const pos = Math.round(p * zoom) + 0.5;
        const isMajor = p % majorStep === 0;
        const tickLen = isMajor ? 10 : 5;
        if (isX) {
          ctx.moveTo(pos, h);
          ctx.lineTo(pos, h - tickLen);
          if (isMajor && p < maxPx - 2) {
            ctx.fillText(String(p), pos + 2, 10);
          }
        } else {
          ctx.moveTo(w, pos);
          ctx.lineTo(w - tickLen, pos);
          if (isMajor && p < maxPx - 2) {
            ctx.save();
            ctx.translate(10, pos + 3);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(String(p), 0, 0);
            ctx.restore();
          }
        }
      }
      ctx.stroke();

      // Vạch chỉ vị trí con trỏ
      if (curPt) {
        const cp = Math.round((isX ? curPt.x : curPt.y) * zoom) + 0.5;
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (isX) { ctx.moveTo(cp, 0); ctx.lineTo(cp, h); }
        else { ctx.moveTo(0, cp); ctx.lineTo(w, cp); }
        ctx.stroke();
      }
    };

    drawAxis(rulerTopRef.current, dispW, imgW, true);
    drawAxis(rulerLeftRef.current, dispH, imgH, false);
  }, [showRulers, imgW, imgH, zoom, cursorPos, selBounds]);

  // ── Render Display Canvas ──────────────────────────────────────
  const renderDisplay = useCallback(() => {
    const dc = displayCanvasRef.current;
    if (!dc) return;
    const dispW = Math.max(1, Math.round(imgW * zoom));
    const dispH = Math.max(1, Math.round(imgH * zoom));
    if (dc.width !== dispW || dc.height !== dispH) {
      dc.width = dispW;
      dc.height = dispH;
    }
    const ctx = dc.getContext('2d');
    ctx.clearRect(0, 0, dispW, dispH);

    // 1. Nền ca-rô trong suốt dịu mắt
    const tile = Math.max(8, Math.min(16, Math.round(8 * Math.max(1, zoom / 2))));
    ctx.fillStyle = '#f8faf8';
    ctx.fillRect(0, 0, dispW, dispH);
    ctx.fillStyle = '#e0e7e2';
    for (let y = 0; y < dispH; y += tile) {
      for (let x = ((y / tile) % 2) * tile; x < dispW; x += tile * 2) {
        ctx.fillRect(x, y, tile, tile);
      }
    }

    ctx.save();
    ctx.imageSmoothingEnabled = zoom < 3;
    ctx.imageSmoothingQuality = 'high';

    // 2. Các bộ phận tham chiếu đang bật
    if (referenceLayers.length > 0) {
      ctx.save();
      ctx.globalAlpha = refOpacity / 100;
      for (const layer of referenceLayers) {
        if (!refVisible[layer.name] || !layer.img?.width) continue;
        const ox = (layer.off?.[0] || 0) * zoom;
        const oy = (layer.off?.[1] || 0) * zoom;
        const sc = layer.sc || 1;
        ctx.drawImage(
          layer.img,
          ox,
          oy,
          layer.img.width * sc * zoom,
          layer.img.height * sc * zoom
        );
      }
      ctx.restore();
    }

    // 3. Các Layer vẽ từ dưới lên trên
    for (const l of layersRef.current) {
      if (!l.visible) continue;
      const c = layerCanvasesRef.current.get(l.id);
      if (!c) continue;
      ctx.save();
      ctx.globalAlpha = (l.opacity ?? 100) / 100;
      ctx.drawImage(c, 0, 0, dispW, dispH);
      ctx.restore();
    }
    ctx.restore();

    // 4. Lưới pixel
    if (showGrid && zoom >= 4) {
      ctx.save();
      ctx.strokeStyle = 'rgba(20, 50, 31, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 1; x < imgW; x++) {
        const px = Math.round(x * zoom) + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, dispH);
      }
      for (let y = 1; y < imgH; y++) {
        const py = Math.round(y * zoom) + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(dispW, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 5. Vẽ viền nét đứt vùng chọn (marching ants)
    const edges = selEdgesRef.current;
    if (edges.length > 0) {
      ctx.save();
      ctx.lineWidth = 1.5;
      const drawEdgesPath = () => {
        ctx.beginPath();
        for (let i = 0; i < edges.length; i += 3) {
          const x = edges[i] * zoom;
          const y = edges[i + 1] * zoom;
          const b = edges[i + 2];
          if (b & 1) { ctx.moveTo(x, y); ctx.lineTo(x + zoom, y); }
          if (b & 2) { ctx.moveTo(x, y + zoom); ctx.lineTo(x + zoom, y + zoom); }
          if (b & 4) { ctx.moveTo(x, y); ctx.lineTo(x, y + zoom); }
          if (b & 8) { ctx.moveTo(x + zoom, y); ctx.lineTo(x + zoom, y + zoom); }
        }
        ctx.stroke();
      };
      ctx.strokeStyle = '#ffffff';
      ctx.setLineDash([]);
      drawEdgesPath();
      ctx.strokeStyle = '#111827';
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -antsOffsetRef.current;
      drawEdgesPath();
      ctx.restore();
    }

    // 6. Xem trước vùng chọn đang kéo (Rect / Ellipse / Lasso)
    const inter = interactionRef.current;
    if (inter && (inter.kind === 'rect' || inter.kind === 'ellipse' || inter.kind === 'lasso')) {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.fillStyle = 'rgba(34, 197, 94, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      if (inter.kind === 'rect') {
        const rx = Math.min(inter.x0, inter.x1) * zoom;
        const ry = Math.min(inter.y0, inter.y1) * zoom;
        const rw = Math.abs(inter.x1 - inter.x0) * zoom;
        const rh = Math.abs(inter.y1 - inter.y0) * zoom;
        ctx.rect(rx, ry, rw, rh);
      } else if (inter.kind === 'ellipse') {
        const cx = ((inter.x0 + inter.x1) / 2) * zoom;
        const cy = ((inter.y0 + inter.y1) / 2) * zoom;
        const rx = Math.abs(inter.x1 - inter.x0) * 0.5 * zoom;
        const ry = Math.abs(inter.y1 - inter.y0) * 0.5 * zoom;
        ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      } else if (inter.kind === 'lasso' && inter.pts.length > 1) {
        ctx.moveTo(inter.pts[0].x * zoom, inter.pts[0].y * zoom);
        for (let i = 1; i < inter.pts.length; i++) {
          ctx.lineTo(inter.pts[i].x * zoom, inter.pts[i].y * zoom);
        }
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }, [imgW, imgH, zoom, referenceLayers, refVisible, refOpacity, showGrid]);

  // ── Marching-ants animation khi có vùng chọn ───────────────────
  useEffect(() => {
    if (!hasSelection) return;
    const iv = setInterval(() => {
      antsOffsetRef.current = (antsOffsetRef.current + 1) % 8;
      renderDisplay();
    }, 120);
    return () => clearInterval(iv);
  }, [hasSelection, renderDisplay]);

  // ── Brush preview stroke trong Inspector ───────────────────────
  useEffect(() => {
    const c = brushPreviewRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width;
    const h = c.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f2f5f3';
    ctx.fillRect(0, 0, w, h);
    const previewSize = Math.min(26, Math.max(1, brushSize));
    const step = Math.max(1, (previewSize * spacing) / 100);
    const [r, g, b] = hexToRgba(tool === 'eraser' ? '#e04f5f' : color);
    ctx.save();
    ctx.globalAlpha = opacity / 100;
    for (let x = 22; x <= w - 22; x += step) {
      const t = (x - 22) / (w - 44);
      const y = h / 2 + Math.sin(t * Math.PI * 2) * 9;
      if (brushTip === 'square') {
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x - previewSize / 2, y - previewSize / 2, previewSize, previewSize);
      } else if (brushTip === 'calligraphy') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 5);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, previewSize * 0.65, Math.max(1, previewSize * 0.22), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (hardness < 95 && previewSize >= 3) {
        const rad = previewSize / 2;
        const inner = rad * (hardness / 100);
        const grad = ctx.createRadialGradient(x, y, inner, x, y, rad);
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(x, y, previewSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }, [brushTip, brushSize, opacity, hardness, spacing, color, tool]);

  // ── Init Layer 1 từ ảnh gốc ────────────────────────────────────
  useEffect(() => {
    layerCanvasesRef.current.clear();
    const baseId = 'layer-1';
    const c = makeCanvas(imgW, imgH);
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, imgW, imgH);
    if (image && image.width) ctx.drawImage(image, 0, 0, imgW, imgH);
    layerCanvasesRef.current.set(baseId, c);
    nextLayerNumRef.current = 2;

    const initLayers = [{ id: baseId, name: 'Ảnh gốc', visible: true, locked: false, opacity: 100, rev: 0 }];
    layersRef.current = initLayers;
    activeLayerIdRef.current = baseId;
    setLayers(initLayers);
    setActiveLayerId(baseId);
    setSelectionMask(null);
    historyRef.current = { stack: [], index: -1 };
    pushSnapshot(initLayers, baseId);
    setDirty(Boolean(initialDirty));
    if (initialTool) setTool(initialTool);
    setSelectedSourceIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, imgW, imgH, part, initialDirty, initialTool]);

  useEffect(() => {
    renderDisplay();
    drawRulers();
  }, [renderDisplay, drawRulers, layers]);

  // ── Layer operations ───────────────────────────────────────────
  const bumpLayerRev = (layerId) => {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, rev: l.rev + 1 } : l)));
  };

  const restoreSnapshot = useCallback((snap) => {
    if (!snap) return;
    layerCanvasesRef.current.clear();
    const nextLayers = snap.layers.map((sl) => {
      const c = makeCanvas(imgW, imgH);
      c.getContext('2d', { willReadFrequently: true }).putImageData(cloneImageData(sl.data), 0, 0);
      layerCanvasesRef.current.set(sl.id, c);
      return {
        id: sl.id,
        name: sl.name,
        visible: sl.visible,
        locked: sl.locked,
        opacity: sl.opacity,
        rev: Math.random(),
      };
    });
    layersRef.current = nextLayers;
    activeLayerIdRef.current = snap.activeLayerId;
    setLayers(nextLayers);
    setActiveLayerId(snap.activeLayerId);
    syncHistoryFlags();
  }, [imgW, imgH, syncHistoryFlags]);

  const handleUndo = useCallback(() => {
    const h = historyRef.current;
    if (h.index <= 0) return;
    h.index -= 1;
    restoreSnapshot(h.stack[h.index]);
  }, [restoreSnapshot]);

  const handleRedo = useCallback(() => {
    const h = historyRef.current;
    if (h.index >= h.stack.length - 1) return;
    h.index += 1;
    restoreSnapshot(h.stack[h.index]);
  }, [restoreSnapshot]);

  const handleAddLayer = useCallback((customName = null, sourceCanvas = null) => {
    const num = nextLayerNumRef.current++;
    const id = `layer-${Date.now()}-${num}`;
    const c = makeCanvas(imgW, imgH);
    if (sourceCanvas) {
      c.getContext('2d', { willReadFrequently: true }).drawImage(sourceCanvas, 0, 0);
    }
    layerCanvasesRef.current.set(id, c);
    const next = [...layersRef.current, {
      id,
      name: customName || `Layer ${num}`,
      visible: true,
      locked: false,
      opacity: 100,
      rev: 0,
    }];
    layersRef.current = next;
    activeLayerIdRef.current = id;
    setLayers(next);
    setActiveLayerId(id);
    pushSnapshot(next, id);
    setDirty(true);
    return id;
  }, [imgW, imgH, pushSnapshot]);

  const handleDuplicateLayer = () => {
    if (!activeLayer) return;
    const src = layerCanvasesRef.current.get(activeLayer.id);
    handleAddLayer(`${activeLayer.name} (bản sao)`, src);
  };

  const handleDeleteLayer = (id) => {
    if (layersRef.current.length <= 1) return;
    const idx = layersRef.current.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const next = layersRef.current.filter((l) => l.id !== id);
    layerCanvasesRef.current.delete(id);
    const nextActive = activeLayerIdRef.current === id
      ? (next[Math.max(0, idx - 1)]?.id || next[0].id)
      : activeLayerIdRef.current;
    layersRef.current = next;
    activeLayerIdRef.current = nextActive;
    setLayers(next);
    setActiveLayerId(nextActive);
    pushSnapshot(next, nextActive);
    setDirty(true);
  };

  const handleMoveLayer = (id, dir) => {
    const list = [...layersRef.current];
    const idx = list.findIndex((l) => l.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    layersRef.current = list;
    setLayers(list);
    pushSnapshot(list, activeLayerIdRef.current);
    setDirty(true);
  };

  const handleMergeDown = (id) => {
    const list = [...layersRef.current];
    const idx = list.findIndex((l) => l.id === id);
    if (idx <= 0) return;
    const topL = list[idx];
    const botL = list[idx - 1];
    const topC = layerCanvasesRef.current.get(topL.id);
    const botC = layerCanvasesRef.current.get(botL.id);
    if (topC && botC) {
      const ctx = botC.getContext('2d', { willReadFrequently: true });
      ctx.save();
      ctx.globalAlpha = (topL.opacity ?? 100) / 100;
      ctx.drawImage(topC, 0, 0);
      ctx.restore();
    }
    layerCanvasesRef.current.delete(topL.id);
    list.splice(idx, 1);
    list[idx - 1] = { ...botL, rev: botL.rev + 1 };
    layersRef.current = list;
    activeLayerIdRef.current = botL.id;
    setLayers(list);
    setActiveLayerId(botL.id);
    pushSnapshot(list, botL.id);
    setDirty(true);
  };

  const updateLayerProp = (id, patch) => {
    const next = layersRef.current.map((l) => (l.id === id ? { ...l, ...patch } : l));
    layersRef.current = next;
    setLayers(next);
  };

  // ── Selection actions ──────────────────────────────────────────
  const clearSelectedPixels = useCallback(() => {
    if (!selMaskRef.current || !activeLayer || activeLayer.locked) return;
    const c = layerCanvasesRef.current.get(activeLayer.id);
    if (!c) return;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const imgData = ctx.getImageData(0, 0, imgW, imgH);
    const mask = selMaskRef.current;
    let changed = false;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] && imgData.data[i * 4 + 3] > 0) {
        imgData.data[i * 4] = 0;
        imgData.data[i * 4 + 1] = 0;
        imgData.data[i * 4 + 2] = 0;
        imgData.data[i * 4 + 3] = 0;
        changed = true;
      }
    }
    if (changed) {
      ctx.putImageData(imgData, 0, 0);
      bumpLayerRev(activeLayer.id);
      pushSnapshot();
      setDirty(true);
      renderDisplay();
    }
  }, [activeLayer, imgW, imgH, pushSnapshot, renderDisplay]);

  /** Giữ lại đúng phần trong vùng chọn và xoá sạch bên ngoài (tách bộ phận 1 chạm) */
  const keepSelectedPixels = useCallback(() => {
    if (!selMaskRef.current || !activeLayer || activeLayer.locked) return;
    const c = layerCanvasesRef.current.get(activeLayer.id);
    if (!c) return;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const imgData = ctx.getImageData(0, 0, imgW, imgH);
    const mask = selMaskRef.current;
    let changed = false;
    for (let i = 0; i < mask.length; i++) {
      if (!mask[i] && imgData.data[i * 4 + 3] > 0) {
        imgData.data[i * 4] = 0;
        imgData.data[i * 4 + 1] = 0;
        imgData.data[i * 4 + 2] = 0;
        imgData.data[i * 4 + 3] = 0;
        changed = true;
      }
    }
    if (changed) {
      ctx.putImageData(imgData, 0, 0);
      bumpLayerRev(activeLayer.id);
      pushSnapshot();
      setDirty(true);
      renderDisplay();
    }
  }, [activeLayer, imgW, imgH, pushSnapshot, renderDisplay]);

  /** Chèn ảnh hiện có của pet vào Layer mới (để tự cắt) hoặc đặt làm phôi mờ bên dưới (để vẽ lại) */
  const handleInsertSuggestedSource = useCallback(async (asUnderlayGuide = false) => {
    const srcItem = suggestedSources[selectedSourceIdx];
    if (!srcItem || !onLoadSuggestedSource || loadingSource) return;
    setLoadingSource(true);
    try {
      const loadedImg = await onLoadSuggestedSource(srcItem);
      if (!loadedImg) return;
      const srcW = loadedImg.naturalWidth || loadedImg.width || imgW;
      const srcH = loadedImg.naturalHeight || loadedImg.height || imgH;
      const fitScale = Math.min(imgW / srcW, imgH / srcH);
      const drawW = Math.round(srcW * fitScale);
      const drawH = Math.round(srcH * fitScale);
      const dx = Math.round((imgW - drawW) / 2);
      const dy = Math.round((imgH - drawH) / 2);

      const c = makeCanvas(imgW, imgH);
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(loadedImg, dx, dy, drawW, drawH);

      const num = nextLayerNumRef.current++;
      const id = `layer-${Date.now()}-${num}`;
      layerCanvasesRef.current.set(id, c);

      if (asUnderlayGuide) {
        const guideLayer = {
          id,
          name: `Phôi: ${srcItem.shortLabel || srcItem.label}`,
          visible: true,
          locked: true,
          opacity: 38,
          rev: 0,
        };
        const drawLayerId = `layer-${Date.now()}-${nextLayerNumRef.current++}`;
        layerCanvasesRef.current.set(drawLayerId, makeCanvas(imgW, imgH));
        const drawLayer = {
          id: drawLayerId,
          name: `Vẽ lại (${partLabel || part})`,
          visible: true,
          locked: false,
          opacity: 100,
          rev: 0,
        };
        const next = [guideLayer, ...layersRef.current, drawLayer];
        layersRef.current = next;
        activeLayerIdRef.current = drawLayerId;
        setLayers(next);
        setActiveLayerId(drawLayerId);
        pushSnapshot(next, drawLayerId);
        setTool('brush');
      } else {
        const cutLayer = {
          id,
          name: srcItem.shortLabel || srcItem.label,
          visible: true,
          locked: false,
          opacity: 100,
          rev: 0,
        };
        const next = [...layersRef.current, cutLayer];
        layersRef.current = next;
        activeLayerIdRef.current = id;
        setLayers(next);
        setActiveLayerId(id);
        pushSnapshot(next, id);
        setTool('lasso');
      }
      setDirty(true);
      renderDisplay();
    } finally {
      setLoadingSource(false);
    }
  }, [suggestedSources, selectedSourceIdx, onLoadSuggestedSource, loadingSource, imgW, imgH, partLabel, part, pushSnapshot, renderDisplay]);

  const invertSelection = useCallback(() => {
    const cur = selMaskRef.current;
    const next = new Uint8Array(imgW * imgH);
    for (let i = 0; i < next.length; i++) {
      next[i] = cur && cur[i] ? 0 : 255;
    }
    setSelectionMask(next);
    renderDisplay();
  }, [imgW, imgH, setSelectionMask, renderDisplay]);

  const selectAll = useCallback(() => {
    const next = new Uint8Array(imgW * imgH);
    next.fill(255);
    setSelectionMask(next);
    renderDisplay();
  }, [imgW, imgH, setSelectionMask, renderDisplay]);

  const selectionToNewLayer = useCallback(() => {
    if (!selMaskRef.current || !activeLayer) return;
    const srcC = layerCanvasesRef.current.get(activeLayer.id);
    if (!srcC) return;
    const srcData = srcC.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, imgW, imgH);
    const outC = makeCanvas(imgW, imgH);
    const outCtx = outC.getContext('2d', { willReadFrequently: true });
    const outData = outCtx.createImageData(imgW, imgH);
    const mask = selMaskRef.current;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i]) {
        const k = i * 4;
        outData.data[k] = srcData.data[k];
        outData.data[k + 1] = srcData.data[k + 1];
        outData.data[k + 2] = srcData.data[k + 2];
        outData.data[k + 3] = srcData.data[k + 3];
      }
    }
    outCtx.putImageData(outData, 0, 0);
    handleAddLayer(`Vùng chọn (${activeLayer.name})`, outC);
  }, [activeLayer, imgW, imgH, handleAddLayer]);

  const handleResetOriginal = () => {
    const baseId = 'layer-1';
    layerCanvasesRef.current.clear();
    const c = makeCanvas(imgW, imgH);
    if (image && image.width) c.getContext('2d', { willReadFrequently: true }).drawImage(image, 0, 0, imgW, imgH);
    layerCanvasesRef.current.set(baseId, c);
    const next = [{ id: baseId, name: 'Ảnh gốc', visible: true, locked: false, opacity: 100, rev: Date.now() }];
    layersRef.current = next;
    activeLayerIdRef.current = baseId;
    setLayers(next);
    setActiveLayerId(baseId);
    setSelectionMask(null);
    pushSnapshot(next, baseId);
    setDirty(false);
  };

  // ── Keyboard shortcuts ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches('input,select,textarea')) return;
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && k === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && k === 'd') {
        e.preventDefault();
        setSelectionMask(null);
        renderDisplay();
      } else if ((e.metaKey || e.ctrlKey) && k === 'a') {
        e.preventDefault();
        selectAll();
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && k === 'i') {
        e.preventDefault();
        invertSelection();
      } else if ((e.metaKey || e.ctrlKey) && k === 'j') {
        e.preventDefault();
        selectionToNewLayer();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selMaskRef.current) {
          e.preventDefault();
          clearSelectedPixels();
        }
      } else if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const hit = TOOLS.find((t) => t.key.toLowerCase() === k);
        if (hit) setTool(hit.id);
        else if (e.key === '[') setBrushSize((s) => Math.max(1, s - 1));
        else if (e.key === ']') setBrushSize((s) => Math.min(50, s + 1));
        else if (e.key === 'Escape' && !saving) onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo, handleRedo, setSelectionMask, selectAll, invertSelection, selectionToNewLayer, clearSelectedPixels, renderDisplay, onClose, saving]);

  // ── Brush stamping (có cắt theo vùng chọn nếu đang bật selection) ──
  const stampDab = (ctx, x, y, isErase) => {
    const [r, g, b] = hexToRgba(color);
    const sz = brushSize;
    if (brushTip === 'square') {
      if (isErase) {
        ctx.fillStyle = '#000';
      } else {
        ctx.fillStyle = `rgb(${r},${g},${b})`;
      }
      const px = sz <= 1.5 ? Math.floor(x) : x - sz / 2;
      const py = sz <= 1.5 ? Math.floor(y) : y - sz / 2;
      ctx.fillRect(px, py, Math.max(1, sz), Math.max(1, sz));
    } else if (brushTip === 'calligraphy') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 5);
      ctx.fillStyle = isErase ? '#000' : `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(1, sz * 0.65), Math.max(0.8, sz * 0.22), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (hardness < 95 && sz >= 3) {
      const rad = sz / 2;
      const inner = rad * (hardness / 100);
      const grad = ctx.createRadialGradient(x, y, inner, x, y, rad);
      if (isErase) {
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
      } else {
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    } else if (sz <= 1.5) {
      ctx.fillStyle = isErase ? '#000' : `rgb(${r},${g},${b})`;
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    } else {
      ctx.fillStyle = isErase ? '#000' : `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(x, y, sz / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const applyStrokeSegment = (x0, y0, x1, y1, isErase) => {
    const lay = activeLayer;
    if (!lay || lay.locked || !lay.visible) return;
    const targetC = layerCanvasesRef.current.get(lay.id);
    if (!targetC) return;

    const dist = Math.hypot(x1 - x0, y1 - y0);
    const step = Math.max(0.5, (brushSize * spacing) / 100);
    const count = Math.max(1, Math.ceil(dist / step));

    if (!selMaskRef.current) {
      const ctx = targetC.getContext('2d', { willReadFrequently: true });
      ctx.save();
      ctx.globalCompositeOperation = isErase ? 'destination-out' : 'source-over';
      ctx.globalAlpha = opacity / 100;
      for (let i = 0; i <= count; i++) {
        const t = count === 0 ? 0 : i / count;
        stampDab(ctx, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, isErase);
      }
      ctx.restore();
    } else {
      // Vẽ lên canvas tạm rồi chỉ chép các pixel nằm trong vùng chọn
      let scratch = strokeScratchRef.current;
      if (!scratch || scratch.width !== imgW || scratch.height !== imgH) {
        scratch = makeCanvas(imgW, imgH);
        strokeScratchRef.current = scratch;
      }
      const sctx = scratch.getContext('2d', { willReadFrequently: true });
      sctx.clearRect(0, 0, imgW, imgH);
      sctx.globalAlpha = opacity / 100;
      for (let i = 0; i <= count; i++) {
        const t = count === 0 ? 0 : i / count;
        stampDab(sctx, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, false);
      }
      const sData = sctx.getImageData(0, 0, imgW, imgH).data;
      const tctx = targetC.getContext('2d', { willReadFrequently: true });
      const tImg = tctx.getImageData(0, 0, imgW, imgH);
      const td = tImg.data;
      const mask = selMaskRef.current;
      for (let i = 0; i < mask.length; i++) {
        if (!mask[i]) continue;
        const k = i * 4;
        const sa = sData[k + 3] / 255;
        if (sa <= 0) continue;
        if (isErase) {
          td[k + 3] = Math.round(td[k + 3] * (1 - sa));
        } else {
          const da = td[k + 3] / 255;
          const outA = sa + da * (1 - sa);
          if (outA > 0) {
            td[k] = Math.round((sData[k] * sa + td[k] * da * (1 - sa)) / outA);
            td[k + 1] = Math.round((sData[k + 1] * sa + td[k + 1] * da * (1 - sa)) / outA);
            td[k + 2] = Math.round((sData[k + 2] * sa + td[k + 2] * da * (1 - sa)) / outA);
            td[k + 3] = Math.round(outA * 255);
          }
        }
      }
      tctx.putImageData(tImg, 0, 0);
    }
    renderDisplay();
  };

  // ── Sample color (eyedropper) từ tất cả layer hiển thị + lớp tham chiếu ──
  const sampleColorAt = (pt) => {
    const ix = Math.max(0, Math.min(imgW - 1, Math.floor(pt.x)));
    const iy = Math.max(0, Math.min(imgH - 1, Math.floor(pt.y)));
    const tmp = makeCanvas(imgW, imgH);
    const tctx = tmp.getContext('2d', { willReadFrequently: true });
    for (const layer of referenceLayers) {
      if (!refVisible[layer.name] || !layer.img?.width) continue;
      const sc = layer.sc || 1;
      tctx.drawImage(layer.img, layer.off?.[0] || 0, layer.off?.[1] || 0, layer.img.width * sc, layer.img.height * sc);
    }
    for (const l of layersRef.current) {
      if (!l.visible) continue;
      const c = layerCanvasesRef.current.get(l.id);
      if (!c) continue;
      tctx.save();
      tctx.globalAlpha = (l.opacity ?? 100) / 100;
      tctx.drawImage(c, 0, 0);
      tctx.restore();
    }
    const d = tctx.getImageData(ix, iy, 1, 1).data;
    if (d[3] > 15) {
      const hex = rgbToHex(d[0], d[1], d[2]);
      setColor(hex);
      pushRecentColor(hex);
      setTool('brush');
    }
  };

  // ── Pointer Handlers ───────────────────────────────────────────
  const pointerToImg = (e) => {
    const dc = displayCanvasRef.current;
    if (!dc) return { x: 0, y: 0 };
    const r = dc.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * imgW,
      y: ((e.clientY - r.top) / r.height) * imgH,
    };
  };

  const onPointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const pt = pointerToImg(e);
    setCursorPos(pt);
    drawRulers(pt);

    if (tool === 'eyedropper' || e.altKey) {
      sampleColorAt(pt);
      return;
    }

    if (tool === 'wand') {
      if (!activeLayer) return;
      const c = layerCanvasesRef.current.get(activeLayer.id);
      if (!c) return;
      const imgData = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, imgW, imgH);
      const next = magicWandMask(imgData, Math.floor(pt.x), Math.floor(pt.y), fillTol, contiguous);
      const effMode = e.shiftKey ? 'add' : selMode;
      setSelectionMask(applyMaskOp(selMaskRef.current, next, effMode));
      renderDisplay();
      return;
    }

    if (tool === 'fill') {
      if (!activeLayer || activeLayer.locked || !activeLayer.visible) return;
      const c = layerCanvasesRef.current.get(activeLayer.id);
      if (!c) return;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      const imgData = ctx.getImageData(0, 0, imgW, imgH);
      const rgba = hexToRgba(color, Math.round((opacity / 100) * 255));
      const changed = floodFill(
        imgData,
        Math.floor(pt.x),
        Math.floor(pt.y),
        rgba,
        fillTol,
        selMaskRef.current,
        contiguous
      );
      if (changed) {
        ctx.putImageData(imgData, 0, 0);
        pushRecentColor(color);
        bumpLayerRev(activeLayer.id);
        pushSnapshot();
        setDirty(true);
        renderDisplay();
      }
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);

    if (tool === 'rect' || tool === 'ellipse') {
      interactionRef.current = {
        kind: tool,
        x0: pt.x,
        y0: pt.y,
        x1: pt.x,
        y1: pt.y,
        mode: e.shiftKey ? 'add' : selMode,
      };
      setDragInfo({ w: 0, h: 0 });
      return;
    }

    if (tool === 'lasso') {
      interactionRef.current = {
        kind: 'lasso',
        pts: [{ x: pt.x, y: pt.y }],
        mode: e.shiftKey ? 'add' : selMode,
      };
      return;
    }

    if (tool === 'move') {
      if (!activeLayer || activeLayer.locked || !activeLayer.visible) return;
      const c = layerCanvasesRef.current.get(activeLayer.id);
      if (!c) return;
      const snap = makeCanvas(imgW, imgH);
      snap.getContext('2d').drawImage(c, 0, 0);
      interactionRef.current = { kind: 'move', startX: pt.x, startY: pt.y, snap, moved: false };
      return;
    }

    // Brush / Eraser
    if (!activeLayer || activeLayer.locked || !activeLayer.visible) return;
    if (tool === 'brush') pushRecentColor(color);
    interactionRef.current = {
      kind: tool,
      lastX: pt.x,
      lastY: pt.y,
      smoothX: pt.x,
      smoothY: pt.y,
    };
    applyStrokeSegment(pt.x, pt.y, pt.x, pt.y, tool === 'eraser');
    setDirty(true);
  };

  const onPointerMove = (e) => {
    const pt = pointerToImg(e);
    setCursorPos(pt);
    drawRulers(pt);
    const inter = interactionRef.current;
    if (!inter) return;

    if (inter.kind === 'brush' || inter.kind === 'eraser') {
      const k = 1 - smoothing / 100;
      const nx = inter.smoothX + (pt.x - inter.smoothX) * Math.max(0.15, k);
      const ny = inter.smoothY + (pt.y - inter.smoothY) * Math.max(0.15, k);
      applyStrokeSegment(inter.lastX, inter.lastY, nx, ny, inter.kind === 'eraser');
      inter.lastX = nx;
      inter.lastY = ny;
      inter.smoothX = nx;
      inter.smoothY = ny;
    } else if (inter.kind === 'rect' || inter.kind === 'ellipse') {
      inter.x1 = pt.x;
      inter.y1 = pt.y;
      setDragInfo({
        w: Math.round(Math.abs(inter.x1 - inter.x0)),
        h: Math.round(Math.abs(inter.y1 - inter.y0)),
      });
      renderDisplay();
    } else if (inter.kind === 'lasso') {
      const prev = inter.pts[inter.pts.length - 1];
      if (Math.hypot(pt.x - prev.x, pt.y - prev.y) >= 1.5) {
        inter.pts.push({ x: pt.x, y: pt.y });
        renderDisplay();
      }
    } else if (inter.kind === 'move' && activeLayer) {
      const dx = Math.round(pt.x - inter.startX);
      const dy = Math.round(pt.y - inter.startY);
      const c = layerCanvasesRef.current.get(activeLayer.id);
      if (!c) return;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.clearRect(0, 0, imgW, imgH);
      ctx.drawImage(inter.snap, dx, dy);
      inter.moved = dx !== 0 || dy !== 0;
      setDragInfo({ dx, dy });
      renderDisplay();
    }
  };

  const onPointerUp = () => {
    const inter = interactionRef.current;
    if (!inter) return;
    interactionRef.current = null;
    setDragInfo(null);

    if (inter.kind === 'brush' || inter.kind === 'eraser') {
      if (activeLayer) bumpLayerRev(activeLayer.id);
      pushSnapshot();
    } else if (inter.kind === 'move') {
      if (inter.moved && activeLayer) {
        bumpLayerRev(activeLayer.id);
        pushSnapshot();
        setDirty(true);
      }
    } else if (inter.kind === 'rect') {
      const x0 = Math.max(0, Math.floor(Math.min(inter.x0, inter.x1)));
      const y0 = Math.max(0, Math.floor(Math.min(inter.y0, inter.y1)));
      const x1 = Math.min(imgW - 1, Math.ceil(Math.max(inter.x0, inter.x1)));
      const y1 = Math.min(imgH - 1, Math.ceil(Math.max(inter.y0, inter.y1)));
      if (x1 - x0 < 1 || y1 - y0 < 1) {
        if (inter.mode === 'replace') setSelectionMask(null);
      } else {
        const next = new Uint8Array(imgW * imgH);
        for (let y = y0; y <= y1; y++) {
          const row = y * imgW;
          for (let x = x0; x <= x1; x++) next[row + x] = 255;
        }
        setSelectionMask(applyMaskOp(selMaskRef.current, next, inter.mode));
      }
      renderDisplay();
    } else if (inter.kind === 'ellipse') {
      const cx = (inter.x0 + inter.x1) / 2;
      const cy = (inter.y0 + inter.y1) / 2;
      const rx = Math.abs(inter.x1 - inter.x0) / 2;
      const ry = Math.abs(inter.y1 - inter.y0) / 2;
      if (rx < 1 || ry < 1) {
        if (inter.mode === 'replace') setSelectionMask(null);
      } else {
        const next = new Uint8Array(imgW * imgH);
        const y0 = Math.max(0, Math.floor(cy - ry));
        const y1 = Math.min(imgH - 1, Math.ceil(cy + ry));
        const x0 = Math.max(0, Math.floor(cx - rx));
        const x1 = Math.min(imgW - 1, Math.ceil(cx + rx));
        for (let y = y0; y <= y1; y++) {
          const dy = (y + 0.5 - cy) / ry;
          const row = y * imgW;
          for (let x = x0; x <= x1; x++) {
            const dx = (x + 0.5 - cx) / rx;
            if (dx * dx + dy * dy <= 1) next[row + x] = 255;
          }
        }
        setSelectionMask(applyMaskOp(selMaskRef.current, next, inter.mode));
      }
      renderDisplay();
    } else if (inter.kind === 'lasso') {
      if (inter.pts.length < 3) {
        if (inter.mode === 'replace') setSelectionMask(null);
      } else {
        let minX = imgW;
        let minY = imgH;
        let maxX = 0;
        let maxY = 0;
        for (const p of inter.pts) {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        }
        const x0 = Math.max(0, Math.floor(minX));
        const y0 = Math.max(0, Math.floor(minY));
        const x1 = Math.min(imgW - 1, Math.ceil(maxX));
        const y1 = Math.min(imgH - 1, Math.ceil(maxY));
        const next = new Uint8Array(imgW * imgH);
        for (let y = y0; y <= y1; y++) {
          const row = y * imgW;
          for (let x = x0; x <= x1; x++) {
            if (pointInPolygon(x + 0.5, y + 0.5, inter.pts)) next[row + x] = 255;
          }
        }
        setSelectionMask(applyMaskOp(selMaskRef.current, next, inter.mode));
      }
      renderDisplay();
    }
  };

  const onWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    setZoom((z) => Math.max(0.5, Math.min(20, +(z * factor).toFixed(2))));
  };

  // ── Export phẳng tất cả Layer đang bật thành PNG ───────────────
  const handleSaveClick = () => {
    if (saving) return;
    const flat = makeCanvas(imgW, imgH);
    const ctx = flat.getContext('2d');
    for (const l of layersRef.current) {
      if (!l.visible) continue;
      const c = layerCanvasesRef.current.get(l.id);
      if (!c) continue;
      ctx.save();
      ctx.globalAlpha = (l.opacity ?? 100) / 100;
      ctx.drawImage(c, 0, 0);
      ctx.restore();
    }
    flat.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${part}.png`, { type: 'image/png' });
      onSave?.(file);
    }, 'image/png');
  };

  const dispW = Math.max(1, Math.round(imgW * zoom));
  const dispH = Math.max(1, Math.round(imgH * zoom));
  const isSelTool = ['rect', 'ellipse', 'lasso', 'wand'].includes(tool);
  const isBrushTool = tool === 'brush' || tool === 'eraser';
  const currentToolMeta = TOOLS.find((t) => t.id === tool) || TOOLS[0];

  return (
    <div
      className="pm-modal-backdrop pm-studio-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Vẽ sửa bộ phận ${partLabel}`}
    >
      <div className="pm-studio">
        {/* 1. Top Header Bar (cố định 1 hàng, không bao giờ đổi chiều cao) */}
        <header className="pm-studio-top">
          <div className="pm-studio-title">
            <span className="pm-studio-badge">{petLabel} C{stage}</span>
            <strong>{partLabel}</strong>
            <span className="pm-studio-dim">{part} · {imgW}×{imgH}px</span>
          </div>

          <div className="pm-studio-top-center">
            <button type="button" className="pm-st-btn" onClick={handleUndo} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)">
              ↶
            </button>
            <button type="button" className="pm-st-btn" onClick={handleRedo} disabled={!canRedo} title="Làm lại (Ctrl+Shift+Z)">
              ↷
            </button>
            <span className="pm-st-sep" />
            <button
              type="button"
              className="pm-st-btn"
              onClick={() => setZoom((z) => Math.max(0.5, +(z / 1.25).toFixed(2)))}
              title="Thu nhỏ"
            >
              −
            </button>
            <span className="pm-st-zoom">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className="pm-st-btn"
              onClick={() => setZoom((z) => Math.min(20, +(z * 1.25).toFixed(2)))}
              title="Phóng to"
            >
              +
            </button>
            <button type="button" className="pm-st-btn" onClick={() => setZoom(calcFitZoom())}>
              Vừa
            </button>
            <span className="pm-st-sep" />
            <button
              type="button"
              className={`pm-st-btn ${showRulers ? 'active' : ''}`}
              onClick={() => setShowRulers((v) => !v)}
              title="Bật/tắt thước đo pixel"
            >
              📏 Thước
            </button>
            <button
              type="button"
              className={`pm-st-btn ${showGrid ? 'active' : ''}`}
              onClick={() => setShowGrid((v) => !v)}
              title="Bật/tắt lưới pixel (khi zoom ≥ 400%)"
            >
              # Lưới
            </button>
          </div>

          <div className="pm-studio-top-right">
            <button type="button" className="pm-st-btn" onClick={handleResetOriginal} disabled={!dirty || saving}>
              Ảnh gốc
            </button>
            <button type="button" className="pm-st-btn" onClick={onClose} disabled={saving}>
              Đóng
            </button>
            <button
              type="button"
              className="pm-st-btn primary"
              onClick={handleSaveClick}
              disabled={saving || !dirty}
            >
              {saving ? 'Đang lưu…' : '💾 Lưu bản nháp'}
            </button>
          </div>
        </header>

        {/* 2. Body: Left Tool Rail + Center Dark Canvas + Right Inspector */}
        <div className="pm-studio-body">
          {/* Left Vertical Tool Rail */}
          <aside className="pm-studio-rail" aria-label="Công cụ vẽ">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`pm-rail-btn ${tool === t.id ? 'active' : ''}`}
                onClick={() => setTool(t.id)}
                title={`${t.label} (${t.key})`}
              >
                <span className="pm-rail-ico">{t.icon}</span>
                <span className="pm-rail-key">{t.key}</span>
              </button>
            ))}

            {/* Ô màu hiện tại ở chân thanh trái */}
            <label className="pm-rail-color" title="Chọn màu vẽ">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  if (tool === 'eraser' || tool === 'eyedropper') setTool('brush');
                }}
              />
              <span className="pm-rail-color-box" style={{ background: color }} />
            </label>
          </aside>

          {/* Center Canvas Stage + Rulers */}
          <main className="pm-studio-stage" ref={stageScrollRef} onWheel={onWheel}>
            <div
              className="pm-studio-board"
              style={{
                paddingLeft: showRulers ? RULER_SIZE : 0,
                paddingTop: showRulers ? RULER_SIZE : 0,
              }}
            >
              {showRulers && (
                <>
                  <div className="pm-ruler-corner" style={{ width: RULER_SIZE, height: RULER_SIZE }}>px</div>
                  <canvas
                    ref={rulerTopRef}
                    className="pm-ruler-top"
                    style={{ left: RULER_SIZE, width: dispW, height: RULER_SIZE }}
                  />
                  <canvas
                    ref={rulerLeftRef}
                    className="pm-ruler-left"
                    style={{ top: RULER_SIZE, width: RULER_SIZE, height: dispH }}
                  />
                </>
              )}

              <div className="pm-paint-canvas-wrap" style={{ width: dispW, height: dispH }}>
                <canvas
                  ref={displayCanvasRef}
                  className={`pm-paint-canvas tool-${tool}`}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onPointerLeave={() => {
                    setCursorPos(null);
                    drawRulers(null);
                  }}
                />
                {cursorPos && isBrushTool && (
                  <div
                    className="pm-paint-cursor"
                    style={{
                      left: cursorPos.x * zoom,
                      top: cursorPos.y * zoom,
                      width: Math.max(4, brushSize * zoom),
                      height: Math.max(4, brushSize * zoom),
                      borderRadius: brushTip === 'square' ? '2px' : '50%',
                      borderColor: tool === 'eraser' ? '#f87171' : '#111827',
                    }}
                  />
                )}
              </div>
            </div>
          </main>

          {/* Right Fixed-Width Inspector (Tuỳ chỉnh công cụ + Layer + Lớp tham chiếu) */}
          <aside className="pm-studio-inspector">
            {/* Section A: Tuỳ chỉnh cọ / công cụ */}
            <section className="pm-ins-sec">
              <div className="pm-ins-head">
                <span>{currentToolMeta.icon} {currentToolMeta.label}</span>
                <span className="pm-ins-key">{currentToolMeta.key}</span>
              </div>

              {isBrushTool && (
                <>
                  <canvas ref={brushPreviewRef} width={232} height={42} className="pm-brush-preview" />
                  <div className="pm-tip-row">
                    {BRUSH_TIPS.map((bt) => (
                      <button
                        key={bt.id}
                        type="button"
                        className={`pm-st-btn pm-st-xs ${brushTip === bt.id ? 'active' : ''}`}
                        onClick={() => setBrushTip(bt.id)}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>
                  <label className="pm-ins-slider">
                    <span>Cỡ cọ</span><b>{brushSize}px</b>
                    <input type="range" min={1} max={50} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
                  </label>
                  <label className="pm-ins-slider">
                    <span>Độ đậm</span><b>{opacity}%</b>
                    <input type="range" min={5} max={100} step={5} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
                  </label>
                  {brushTip === 'round' && (
                    <label className="pm-ins-slider">
                      <span>Độ cứng viền</span><b>{hardness}%</b>
                      <input type="range" min={0} max={100} step={5} value={hardness} onChange={(e) => setHardness(Number(e.target.value))} />
                    </label>
                  )}
                  <label className="pm-ins-slider">
                    <span>Khoảng cách nét</span><b>{spacing}%</b>
                    <input type="range" min={10} max={100} step={5} value={spacing} onChange={(e) => setSpacing(Number(e.target.value))} />
                  </label>
                  <label className="pm-ins-slider">
                    <span>Làm mượt nét</span><b>{smoothing}%</b>
                    <input type="range" min={0} max={80} step={5} value={smoothing} onChange={(e) => setSmoothing(Number(e.target.value))} />
                  </label>
                </>
              )}

              {(tool === 'fill' || tool === 'wand') && (
                <>
                  <label className="pm-ins-slider">
                    <span>Độ lan màu</span><b>{fillTol}</b>
                    <input type="range" min={0} max={100} value={fillTol} onChange={(e) => setFillTol(Number(e.target.value))} />
                  </label>
                  {tool === 'fill' && (
                    <label className="pm-ins-slider">
                      <span>Độ đậm</span><b>{opacity}%</b>
                      <input type="range" min={5} max={100} step={5} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
                    </label>
                  )}
                  <label className="pm-ins-check">
                    <input type="checkbox" checked={contiguous} onChange={(e) => setContiguous(e.target.checked)} />
                    <span>Chỉ vùng liền kề (Contiguous)</span>
                  </label>
                </>
              )}

              {isSelTool && (
                <>
                  <div className="pm-tip-row">
                    {[
                      { id: 'replace', label: 'Mới' },
                      { id: 'add', label: '+ Thêm' },
                      { id: 'sub', label: '− Trừ' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`pm-st-btn pm-st-xs ${selMode === m.id ? 'active' : ''}`}
                        onClick={() => setSelMode(m.id)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <p className="pm-ins-note">
                    {tool === 'wand'
                      ? 'Click vào vùng màu trên layer đang chọn. Giữ Shift để chọn thêm.'
                      : 'Kéo trên ảnh để tạo vùng chọn. Cọ vẽ & Tẩy sẽ chỉ vẽ trong vùng chọn.'}
                  </p>
                </>
              )}

              {tool === 'eyedropper' && (
                <p className="pm-ins-note">
                  Click lên bất kỳ điểm nào trên ảnh (kể cả lớp tham chiếu) để lấy màu — tự chuyển về Cọ vẽ. Mẹo: khi đang dùng Cọ có thể giữ <code>Alt + Click</code> để hút màu nhanh.
                </p>
              )}

              {tool === 'move' && (
                <p className="pm-ins-note">
                  Kéo trên ảnh để dịch chuyển toàn bộ nội dung của layer đang chọn.
                </p>
              )}

              {/* Thao tác nhanh cho vùng chọn khi đang có selection */}
              {hasSelection && (
                <div className="pm-sel-actions">
                  <div className="pm-sel-title">
                    Vùng chọn: {selBounds ? `${selBounds.w}×${selBounds.h}px` : ''}
                  </div>
                  <div className="pm-tip-row">
                    <button type="button" className="pm-st-btn pm-st-xs primary" onClick={keepSelectedPixels} title="Giữ vùng chọn và xoá sạch phần bên ngoài để tách bộ phận nhanh">
                      ✂️ Giữ vùng chọn
                    </button>
                    <button type="button" className="pm-st-btn pm-st-xs" onClick={clearSelectedPixels} title="Xoá nội dung trong vùng chọn (Delete)">
                      Xoá (Del)
                    </button>
                    <button type="button" className="pm-st-btn pm-st-xs" onClick={invertSelection} title="Đảo vùng chọn (Ctrl+Shift+I)">
                      Đảo ngược
                    </button>
                    <button type="button" className="pm-st-btn pm-st-xs" onClick={selectionToNewLayer} title="Tách vùng chọn thành Layer mới (Ctrl+J)">
                      → Layer mới
                    </button>
                    <button
                      type="button"
                      className="pm-st-btn pm-st-xs"
                      onClick={() => { setSelectionMask(null); renderDisplay(); }}
                      title="Bỏ chọn (Ctrl+D)"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Section B: Bảng màu */}
            <section className="pm-ins-sec">
              <div className="pm-ins-head">
                <span>🎨 Màu sắc</span>
                <div className="pm-color-hex">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      if (tool === 'eraser' || tool === 'eyedropper') setTool('brush');
                    }}
                  />
                  <code>{color.toUpperCase()}</code>
                </div>
              </div>
              <div className="pm-paint-swatches">
                {QUICK_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    className={`pm-swatch ${color.toLowerCase() === hex ? 'active' : ''}`}
                    style={{ background: hex }}
                    title={hex}
                    onClick={() => {
                      setColor(hex);
                      if (tool === 'eraser' || tool === 'eyedropper') setTool('brush');
                    }}
                  />
                ))}
              </div>
              {recentColors.length > 0 && (
                <div className="pm-recent-row">
                  <span>Vừa dùng:</span>
                  {recentColors.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className={`pm-swatch pm-swatch-sm ${color.toLowerCase() === hex ? 'active' : ''}`}
                      style={{ background: hex }}
                      title={hex}
                      onClick={() => {
                        setColor(hex);
                        if (tool === 'eraser' || tool === 'eyedropper') setTool('brush');
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Section B2: Gợi ý lấy ảnh hiện có của pet để tự cắt / vẽ lại */}
            {suggestedSources.length > 0 && onLoadSuggestedSource && (
              <section className="pm-ins-sec" style={{ background: 'rgba(47, 158, 79, 0.08)' }}>
                <div className="pm-ins-head">
                  <span>✂️ Ảnh pet hiện có</span>
                  <span className="small text-muted">{suggestedSources.length} nguồn</span>
                </div>
                <select
                  className="form-select form-select-sm mb-1"
                  style={{ fontSize: '0.75rem' }}
                  value={selectedSourceIdx}
                  disabled={loadingSource}
                  onChange={(e) => setSelectedSourceIdx(Number(e.target.value))}
                >
                  {suggestedSources.map((src, idx) => (
                    <option key={src.id || idx} value={idx}>
                      {src.label}
                    </option>
                  ))}
                </select>
                <div className="pm-tip-row">
                  <button
                    type="button"
                    className="pm-st-btn pm-st-xs primary"
                    disabled={loadingSource}
                    onClick={() => handleInsertSuggestedSource(false)}
                    title="Đưa ảnh pet này vào Layer mới và bật công cụ Khoanh tự do (Lasso) để cắt lấy bộ phận"
                  >
                    {loadingSource ? 'Đang nạp…' : '📥 Chèn để cắt'}
                  </button>
                  <button
                    type="button"
                    className="pm-st-btn pm-st-xs"
                    disabled={loadingSource}
                    onClick={() => handleInsertSuggestedSource(true)}
                    title="Đặt ảnh pet làm phôi mờ 38% (khoá) ở dưới và tạo Layer trống bên trên để họa sĩ vẽ lại"
                  >
                    👻 Làm phôi vẽ lại
                  </button>
                </div>
              </section>
            )}

            {/* Section C: Quản lý Layer */}
            <section className="pm-ins-sec">
              <div className="pm-ins-head">
                <span>📚 Layer ({layers.length})</span>
                <div className="d-flex gap-1">
                  <button type="button" className="pm-st-btn pm-st-xs" onClick={() => handleAddLayer()} title="Thêm layer trong suốt mới">
                    + Mới
                  </button>
                  <button type="button" className="pm-st-btn pm-st-xs" onClick={handleDuplicateLayer} title="Nhân đôi layer đang chọn">
                    📋
                  </button>
                </div>
              </div>

              {activeLayer && (
                <label className="pm-ins-slider mb-1">
                  <span>Độ mờ layer</span><b>{activeLayer.opacity}%</b>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={activeLayer.opacity}
                    onChange={(e) => {
                      updateLayerProp(activeLayer.id, { opacity: Number(e.target.value) });
                      setDirty(true);
                    }}
                  />
                </label>
              )}

              <div className="pm-layer-list">
                {[...layers].reverse().map((l, revIdx) => {
                  const realIdx = layers.length - 1 - revIdx;
                  const isAct = l.id === activeLayer?.id;
                  return (
                    <div
                      key={l.id}
                      className={`pm-layer-item ${isAct ? 'active' : ''}`}
                      onClick={() => setActiveLayerId(l.id)}
                    >
                      <button
                        type="button"
                        className="pm-layer-ico"
                        title={l.visible ? 'Ẩn layer' : 'Hiện layer'}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLayerProp(l.id, { visible: !l.visible });
                          setDirty(true);
                        }}
                      >
                        {l.visible ? '👁️' : '🙈'}
                      </button>
                      <LayerThumb canvas={layerCanvasesRef.current.get(l.id)} rev={l.rev} />
                      <div className="pm-layer-name">
                        <span>{l.name}</span>
                        <small>{l.opacity}%{l.locked ? ' · khoá' : ''}</small>
                      </div>
                      <div className="pm-layer-ops">
                        <button
                          type="button"
                          className="pm-layer-ico"
                          title={l.locked ? 'Mở khoá' : 'Khoá layer'}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayerProp(l.id, { locked: !l.locked });
                          }}
                        >
                          {l.locked ? '🔒' : '🔓'}
                        </button>
                        <button
                          type="button"
                          className="pm-layer-ico"
                          disabled={realIdx >= layers.length - 1}
                          title="Đưa lên trên"
                          onClick={(e) => { e.stopPropagation(); handleMoveLayer(l.id, 1); }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="pm-layer-ico"
                          disabled={realIdx <= 0}
                          title="Đưa xuống dưới"
                          onClick={(e) => { e.stopPropagation(); handleMoveLayer(l.id, -1); }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="pm-layer-ico"
                          disabled={realIdx <= 0}
                          title="Gộp xuống layer dưới"
                          onClick={(e) => { e.stopPropagation(); handleMergeDown(l.id); }}
                        >
                          ⤓
                        </button>
                        <button
                          type="button"
                          className="pm-layer-ico"
                          disabled={layers.length <= 1}
                          title="Xoá layer"
                          onClick={(e) => { e.stopPropagation(); handleDeleteLayer(l.id); }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section D: Lớp tham chiếu các bộ phận khác */}
            {referenceLayers.length > 0 && (
              <section className="pm-ins-sec">
                <div className="pm-ins-head">
                  <span>👻 Tham chiếu ({referenceLayers.length})</span>
                  <span className="small text-muted">{refOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={85}
                  value={refOpacity}
                  onChange={(e) => setRefOpacity(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#2f9e4f' }}
                  title="Độ mờ lớp tham chiếu"
                />
                <div className="pm-ref-list">
                  {referenceLayers.map((rl) => (
                    <label key={rl.name} className="pm-ins-check">
                      <input
                        type="checkbox"
                        checked={Boolean(refVisible[rl.name])}
                        onChange={(e) =>
                          setRefVisible((prev) => ({ ...prev, [rl.name]: e.target.checked }))
                        }
                      />
                      <span>{rl.name}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>

        {/* 3. Status Bar (cố định 28px) */}
        <footer className="pm-studio-foot">
          <span>
            Layer: <b>{activeLayer?.name || '—'}</b>
            {activeLayer?.locked ? ' (đang khoá)' : ''}
          </span>
          <span>
            {cursorPos
              ? `X: ${Math.floor(cursorPos.x)} px · Y: ${Math.floor(cursorPos.y)} px`
              : `Khung: ${imgW}×${imgH} px`}
          </span>
          <span>
            {dragInfo?.w != null
              ? `Đang kéo: ${dragInfo.w}×${dragInfo.h} px`
              : dragInfo?.dx != null
                ? `Dịch: ${dragInfo.dx}, ${dragInfo.dy} px`
                : selBounds
                  ? `Vùng chọn: ${selBounds.w}×${selBounds.h} px (${selBounds.x0},${selBounds.y0})`
                  : 'Mẹo: Alt+Click hút màu nhanh · Ctrl+D bỏ chọn · [ ] chỉnh cỡ cọ'}
          </span>
          <span className="ms-auto">
            {dirty ? '● Có thay đổi chưa lưu' : 'Đã đồng bộ'}
          </span>
        </footer>
      </div>
    </div>
  );
}

/** Thumbnail mini 28×28 của mỗi Layer */
function LayerThumb({ canvas, rev }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !canvas) return;
    const ctx = el.getContext('2d');
    ctx.clearRect(0, 0, el.width, el.height);
    const scale = Math.min(el.width / canvas.width, el.height / canvas.height);
    const dw = canvas.width * scale;
    const dh = canvas.height * scale;
    ctx.drawImage(canvas, (el.width - dw) / 2, (el.height - dh) / 2, dw, dh);
  }, [canvas, rev]);
  return <canvas ref={ref} width={28} height={28} className="pm-layer-thumb" />;
}
