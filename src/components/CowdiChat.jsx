import { useState } from 'react';
import { COWDI_MESSAGES } from '../data/lessons';

export default function CowdiChat() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(() => COWDI_MESSAGES[Math.floor(Math.random() * COWDI_MESSAGES.length)]);

  function toggle() {
    setOpen((v) => !v);
    if (!open) {
      setMsg(COWDI_MESSAGES[Math.floor(Math.random() * COWDI_MESSAGES.length)]);
    }
  }

  return (
    <>
      {open && (
        <div className="cowdi-chat-bubble">
          <p className="mb-0 text-dark small">{msg}</p>
        </div>
      )}
      <button className="cowdi-chat-btn" onClick={toggle} title="Chat với Cowdi">
        🐮
      </button>
    </>
  );
}

