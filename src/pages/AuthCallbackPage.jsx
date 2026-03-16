import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Trang trung gian nhận JWT sau khi Google OAuth hoàn tất.
 * Backend redirect tới: /auth-callback?token=JWT
 */
export default function AuthCallbackPage() {
  const [params]    = useSearchParams();
  const { saveToken, user } = useAuth();
  const navigate    = useNavigate();
  const [saved, setSaved] = useState(false);

  // Bước 1: Lưu token (hỗ trợ cả query string lẫn hash)
  useEffect(() => {
    let token = params.get('token');
    // Fallback: lấy token từ hash nếu Nginx thêm # vào URL
    if (!token) {
      const hash = window.location.hash;
      const match = hash.match(/[?&]token=([^&]+)/);
      if (match) token = match[1];
    }
    if (token) {
      saveToken(token);
      setSaved(true);
    } else {
      navigate('/?login=failed', { replace: true });
    }
  }, []);

  // Bước 2: Chờ user state cập nhật rồi mới navigate
  useEffect(() => {
    if (saved && user) {
      navigate('/account', { replace: true });
    }
  }, [saved, user, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-cowdi-primary mb-3" role="status"></div>
        <p className="text-secondary">Đang đăng nhập...</p>
      </div>
    </div>
  );
}
