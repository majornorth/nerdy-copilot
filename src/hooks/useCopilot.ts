import { useState } from 'react';

// Custom hook to manage copilot panel state
export const useCopilot = () => {
  const [isOpen, setIsOpen] = useState(true); // Open by default as requested
  const [isPoppedOut, setIsPoppedOut] = useState(false);

  const openCopilot = () => setIsOpen(true);
  const closeCopilot = () => setIsOpen(false);
  const toggleCopilot = () => setIsOpen(!isOpen);
  const popOut = () => setIsPoppedOut(true);
  const popIn = () => setIsPoppedOut(false);

  return {
    isOpen,
    isPoppedOut,
    openCopilot,
    closeCopilot,
    toggleCopilot,
    popOut,
    popIn
  };
};