// ============================================================
// Cowdi English — Tạo mã QR hoàn toàn phía client (FR-LND-04)
// Không gửi link mời hay mã bạn bè ra dịch vụ bên thứ ba.
// ============================================================

import QRCode from 'qrcode';

/**
 * Tạo ảnh QR dạng PNG Data URL để gắn trực tiếp vào <img src> hoặc vẽ lên Canvas.
 * @param {string} text Chuỗi cần mã hoá (link /i/:code hoặc mã bạn bè)
 * @param {number} [width=320] Chiều rộng ảnh pixel
 * @returns {Promise<string>} data:image/png;base64,...
 */
export async function generateQrDataUrl(text, width = 320) {
  if (!text) return '';
  return QRCode.toDataURL(String(text), {
    width,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#2D221B',
      light: '#FFFFFF',
    },
  });
}
