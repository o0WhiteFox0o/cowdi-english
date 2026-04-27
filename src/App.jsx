import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import CowdiChat from './components/layout/CowdiChat';
import { ToastProvider } from './components/layout/Toast';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { SoundProvider } from './hooks/useSound';
import HomePage from './pages/HomePage';
import LessonsPage from './pages/LessonsPage';
import LessonDetailPage from './pages/LessonDetailPage';
import VocabularyPage from './pages/VocabularyPage';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import PetPage from './pages/PetPage';
import CollectionPage from './pages/CollectionPage';
import ShopPage from './pages/ShopPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MiniGamePage from './pages/MiniGamePage';
import AccountPage from './pages/AccountPage';
import ReviewPage from './pages/ReviewPage';
import LearningPathPage from './pages/LearningPathPage';
import DuelPage from './pages/DuelPage';
import StudentRankingPage from './pages/StudentRankingPage';

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
      </main>
      <CowdiChat />
      <PWAInstallPrompt />
    </ToastProvider>
    </SoundProvider>
  );
}
