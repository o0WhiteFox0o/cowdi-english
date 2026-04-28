import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import Navbar from './components/layout/Navbar';
import CowdiChat from './components/layout/CowdiChat';
import { ToastProvider } from './components/layout/Toast';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { SoundProvider } from './hooks/useSound';
import HomePage from './pages/HomePage';

// Lazy-load route pages so initial bundle stays small (HomePage is eager).
const LessonsPage         = lazy(() => import('./pages/LessonsPage'));
const LessonDetailPage    = lazy(() => import('./pages/LessonDetailPage'));
const VocabularyPage      = lazy(() => import('./pages/VocabularyPage'));
const PracticePage        = lazy(() => import('./pages/PracticePage'));
const ProgressPage        = lazy(() => import('./pages/ProgressPage'));
const AuthCallbackPage    = lazy(() => import('./pages/AuthCallbackPage'));
const PetPage             = lazy(() => import('./pages/PetPage'));
const CollectionPage      = lazy(() => import('./pages/CollectionPage'));
const ShopPage            = lazy(() => import('./pages/ShopPage'));
const LeaderboardPage     = lazy(() => import('./pages/LeaderboardPage'));
const MiniGamePage        = lazy(() => import('./pages/MiniGamePage'));
const AccountPage         = lazy(() => import('./pages/AccountPage'));
const ReviewPage          = lazy(() => import('./pages/ReviewPage'));
const LearningPathPage    = lazy(() => import('./pages/LearningPathPage'));
const DuelPage            = lazy(() => import('./pages/DuelPage'));
const StudentRankingPage  = lazy(() => import('./pages/StudentRankingPage'));

function PageFallback() {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-cowdi-primary" role="status" aria-label="Đang tải">
        <span className="visually-hidden">Đang tải...</span>
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();

  // Lắng nghe message từ Service Worker (notification click navigate / bg-sync done)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (event) => {
      const data = event.data || {};
      if (data.type === 'NAVIGATE' && data.url) {
        navigate(data.url);
      } else if (data.type === 'BG_SYNC_DONE') {
        // Có thể tích hợp toast nếu cần — để tránh dependency, console log
        console.log(`[Cowdi] Đã đồng bộ ${data.count} thay đổi offline`);
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [navigate]);

  return (
    <SoundProvider>
    <ToastProvider>
      <Navbar />
      <main className="container py-4" style={{ marginTop: '70px' }}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lessons/:id" element={<LessonDetailPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/learning-path" element={<LearningPathPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/pet" element={<PetPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/duel" element={<DuelPage />} />
            <Route path="/student-ranking" element={<StudentRankingPage />} />
            <Route path="/mini-games" element={<MiniGamePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/auth-callback" element={<AuthCallbackPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>
      <CowdiChat />
      <PWAInstallPrompt />
    </ToastProvider>
    </SoundProvider>
  );
}
