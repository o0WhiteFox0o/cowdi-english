import { useState } from 'react';
import { usePet } from '../hooks/usePet';
import { PET_REGISTRY, getPetMood, getPetMessage, getPetEvolution } from '../data/pets';

export default function CowdiChat() {
  const { getActivePetWithDecay } = usePet();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');

  function toggle() {
    setOpen((v) => !v);
    if (!open) {
      const pet = getActivePetWithDecay();
      const mood = pet ? getPetMood(pet.needs) : 'happy';
      const speciesId = pet?.speciesId || 'cowdi';
      setMsg(getPetMessage(speciesId, mood));
    }
  }

  const pet = getActivePetWithDecay();
  const species = pet ? PET_REGISTRY[pet.speciesId] : null;
  const evo = pet && species ? getPetEvolution(pet.speciesId, pet.totalXpEarned) : null;
  const petEmoji = evo?.emoji || '🐮';
  const petImage = evo?.image || null;

  return (
    <>
      {open && (
        <div className="cowdi-chat-bubble">
          <p className="mb-0 text-dark small">{msg}</p>
        </div>
      )}
      <button className="cowdi-chat-btn" onClick={toggle} title={`Chat với ${species?.name || 'Cowdi'}`}>
        {petImage ? (
          <img src={petImage} alt={species?.name || 'Cowdi'} className="cowdi-chat-img" />
        ) : (
          petEmoji
        )}
      </button>
    </>
  );
}

