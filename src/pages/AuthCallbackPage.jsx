import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Trang trung gian nhận JWT sau khi Google OAuth hoàn tất.
 * Backend redirect tới: /auth-callback?token=JWT
 */
export default function AuthCallbackPage() {
  const [params]    = useSearchParams();
  const { saveToken } = useAuth();
  const navigate    = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      saveToken(token);
      navigate('/', { replace: true });
    } else {
      // Đăng nhập thất bại
      navigate('/?login=failed', { replace: true });
    }
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-cowdi-primary mb-3" role="status"></div>
        <p className="text-secondary">Đang đăng nhập...</p>
      </div>
    </div>
  );
}
