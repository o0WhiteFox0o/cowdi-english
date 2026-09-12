import { useNavigate } from 'react-router-dom';
import TyperSharkGame from '../features/mini-games/TyperShark/TyperSharkGame';

export default function TypingPage() {
  const navigate = useNavigate();
  return <TyperSharkGame onExit={() => navigate(-1)} />;
}
