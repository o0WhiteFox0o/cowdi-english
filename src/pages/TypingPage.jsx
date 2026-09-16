import { useNavigate } from 'react-router-dom';
import TyperSharkGame from '../features/mini-games/TyperShark/TyperSharkGame';
import { useSEO } from '../hooks/useSEO';
import { SEO_CONFIGS } from '../data/seo-config';

export default function TypingPage() {
  useSEO(SEO_CONFIGS['/typing']);
  const navigate = useNavigate();
  return <TyperSharkGame onExit={() => navigate(-1)} />;
}
