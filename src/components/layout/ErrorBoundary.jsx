import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Cowdi ErrorBoundary] Bắt được lỗi giao diện:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 my-4 text-center mx-auto" style={{ maxWidth: 520 }}>
          <div style={{ fontSize: '3.5rem' }} className="mb-2">⚠️</div>
          <h4 className="fw-bold text-ink mb-2">Đã có lỗi xảy ra khi tải nội dung</h4>
          <p className="text-muted small mb-4">
            Trang gặp sự cố không mong muốn. Bạn hãy thử tải lại trang hoặc quay lại lộ trình học nhé!
          </p>
          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary px-3"
              onClick={this.handleGoHome}
            >
              Về Lộ trình học
            </button>
            <button
              type="button"
              className="btn btn-cowdi-primary px-3 text-white"
              onClick={this.handleReload}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
