import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CowdiChat from './components/CowdiChat';
import { ToastProvider } from './components/Toast';
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

export default function App() {
  return (
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
          <Route path="/mini-games" element={<MiniGamePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/auth-callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <CowdiChat />
    </ToastProvider>
  );
}
