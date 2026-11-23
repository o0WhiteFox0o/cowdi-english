import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Guard phía client cho các route chỉ dành cho quản trị viên.
 * (API trên server luôn chặn bằng requireAdmin; guard này chặn giao diện sớm.)
 */
export default function RequireAdmin({ children }) {
  const { user, isAdmin, loginWithGoogle } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-5">
        <div className="card mx-auto shadow-sm border-0" style={{ maxWidth: 440 }}>
          <div className="card-body p-4">
            <h4 className="fw-bold mb-2">Cần đăng nhập quản trị viên</h4>
            <p className="text-muted mb-4">
              Trang này chỉ dành cho quản trị viên Cowdi English. Vui lòng đăng nhập bằng tài khoản được cấp quyền.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button type="button" className="btn btn-primary" onClick={loginWithGoogle}>
                <i className="fab fa-google me-2" />Đăng nhập Google
              </button>
              <Link to="/" className="btn btn-outline-secondary">Về trang chủ</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-5">
        <div className="card mx-auto shadow-sm border-0" style={{ maxWidth: 440 }}>
          <div className="card-body p-4">
            <div className="display-6 mb-2" aria-hidden="true">🔒</div>
            <h4 className="fw-bold mb-2">Không có quyền truy cập (403)</h4>
            <p className="text-muted mb-4">
              Tài khoản của bạn không có quyền quản trị để mở trang này.
            </p>
            <Link to="/" className="btn btn-primary">Quay lại lộ trình học</Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
