'use client';

import React, { useState, useEffect } from 'react';
import CharacterCreation from './components/CharacterCreation';
import GameInterface from './components/GameInterface';
import { useGameStore } from './lib/store';

export default function Home() {
  const { character } = useGameStore();
  const [isClient, setIsClient] = useState(false);

  // This effect is used to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render based on client-side state to avoid hydration issues
  if (!isClient) {
    return null;
  }

  // Show character creation if no character exists, otherwise show game interface
  return (
    <div className="min-h-screen bg-gray-900">
      {!character ? <CharacterCreation /> : <GameInterface />}
    </div>
  );
}
