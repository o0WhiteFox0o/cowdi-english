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
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/auth-callback" element={<AuthCallbackPage />} />
        </Routes>
      </main>
      <CowdiChat />
    </ToastProvider>
  );
}
