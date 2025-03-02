'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../lib/store';
import { generateNarrative, generateCombatNarrative } from '../services/gemini';
import { Enemy } from '../types';

export default function GameInterface() {
  const { 
    character,
    currentLocation,
    gameLog,
    combat,
    moveToLocation,
    attackEnemy,
    addToGameLog,
    useItem
  } = useGameStore();

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentNarrative, setCurrentNarrative] = useState('');

  // Generate initial narrative when component mounts
  useEffect(() => {
    async function loadInitialNarrative() {
      if (character && currentLocation) {
        setIsLoading(true);
        try {
          const response = await generateNarrative({
            character,
            currentLocation,
            gameLog: gameLog.slice(-3)
          });
          
          setCurrentNarrative(response.text);
          // In a full implementation, we would use the imagePrompt with Flux API
        } catch (error) {
          console.error('Error generating initial narrative:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadInitialNarrative();
  }, [character, currentLocation]);

  // Handle player action
  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || isLoading) return;
    
    // Add player's input to the game log
    addToGameLog(`You: ${userInput}`, 'dialog');
    
    setIsLoading(true);
    try {
      // Process the player's input to determine action type
      const action = userInput.toLowerCase();
      
      // Simple action parsing for MVP
      if (action.includes('move to') || action.includes('go to')) {
        // Extract location from action
        const locationMatches = currentLocation?.connections.filter(conn => 
          action.includes(conn.toLowerCase())
        );
        
        if (locationMatches && locationMatches.length > 0) {
          moveToLocation(locationMatches[0]);
          
          // Location change will trigger a re-render and new narrative
          setUserInput('');
          setIsLoading(false);
          return;
        }
      }
      
      // Process as a general action
      const response = await generateNarrative({
        character,
        currentLocation,
        gameLog: gameLog.slice(-3)
      }, userInput);
      
      setCurrentNarrative(response.text);
      addToGameLog(response.text, 'narrative');
      
      // In a full implementation, we would use the imagePrompt with Flux API
      
    } catch (error) {
      console.error('Error processing action:', error);
      addToGameLog('Something went wrong. Please try again.', 'system');
    } finally {
      setUserInput('');
      setIsLoading(false);
    }
  };

  // Handle combat action
  const handleCombatAction = async (enemyId: string, actionType: string) => {
    if (!combat || !character || isLoading) return;
    
    const enemy = combat.enemies.find(e => e.id === enemyId);
    if (!enemy) return;
    
    setIsLoading(true);
    
    // Process attack action
    if (actionType === 'attack') {
      // Add to log
      addToGameLog(`You attack ${enemy.name}.`, 'combat');
      
      // Perform attack in game logic
      attackEnemy(enemyId, 'Basic Attack');
      
      try {
        // Generate combat narrative
        const narrativeResponse = await generateCombatNarrative(
          character,
          [enemy],
          `${character.name} attacks ${enemy.name} with their ${character.relic}`,
          `The attack deals damage to ${enemy.name}.`
        );
        
        setCurrentNarrative(narrativeResponse.text);
        addToGameLog(narrativeResponse.text, 'narrative');
      } catch (error) {
        console.error('Error generating combat narrative:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // If character doesn't exist, show loading or redirect
  if (!character) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Character not found. Please create a character first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Game Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-red-500">Dark Fantasy RPG</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-400">Health:</span> {character.health}/{character.maxHealth}
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Level:</span> {character.level}
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Panel - Visuals */}
        <div className="w-full md:w-1/2 p-4 border-r border-gray-700">
          <div className="h-64 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
            {/* This would be a dynamically generated image in the full implementation */}
            <span className="text-gray-500">Scene Visualization</span>
          </div>
          
          {/* Location Info */}
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <h2 className="text-lg font-medium mb-2">{currentLocation?.name}</h2>
            <p className="text-sm text-gray-400">{currentLocation?.description}</p>
          </div>
          
          {/* Character Info */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-2">{character.name}</h2>
            <div className="flex justify-between text-sm mb-2">
              <span>Level {character.level} {character.class}</span>
              <span>HP: {character.health}/{character.maxHealth}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>STR: {character.stats.strength}</div>
              <div>INT: {character.stats.intelligence}</div>
              <div>DEX: {character.stats.dexterity}</div>
              <div>CON: {character.stats.constitution}</div>
              <div>WIS: {character.stats.wisdom}</div>
              <div>CHA: {character.stats.charisma}</div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Game Narrative */}
        <div className="w-full md:w-1/2 p-4 flex flex-col">
          {/* Narrative Display */}
          <div className="flex-1 bg-gray-800 p-4 rounded-lg mb-4 overflow-y-auto max-h-96">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-pulse text-gray-500">The Dungeon Master is thinking...</div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="prose prose-invert prose-sm max-w-none"
              >
                <p className="whitespace-pre-line">{currentNarrative}</p>
              </motion.div>
            )}
          </div>
          
          {/* Game Log */}
          <div className="bg-gray-800 p-4 rounded-lg mb-4 h-48 overflow-y-auto">
            <h3 className="text-sm font-medium mb-2 text-gray-400">Game Log</h3>
            <div className="space-y-2 text-sm">
              {gameLog.slice(-10).map((entry) => (
                <div key={entry.id} className={`
                  ${entry.type === 'narrative' ? 'text-gray-300' : ''}
                  ${entry.type === 'dialog' ? 'text-blue-400' : ''}
                  ${entry.type === 'combat' ? 'text-red-400' : ''}
                  ${entry.type === 'system' ? 'text-yellow-400' : ''}
                `}>
                  {entry.text}
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Input */}
          {combat && combat.inCombat ? (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2 text-red-400">Combat Actions</h3>
              <div className="space-y-2">
                {combat.enemies.map((enemy) => (
                  <div key={enemy.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{enemy.name}</span>
                      <span className="text-xs text-gray-400 ml-2">HP: {enemy.health}</span>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleCombatAction(enemy.id, 'attack')}
                        disabled={isLoading || !combat.playerTurn}
                        className="px-3 py-1 bg-red-700 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed"
                      >
                        Attack
                      </button>
                      <button
                        onClick={() => handleCombatAction(enemy.id, 'ability')}
                        disabled={isLoading || !combat.playerTurn}
                        className="px-3 py-1 bg-blue-700 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed"
                      >
                        Ability
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleAction} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="What do you want to do?"
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !userInput.trim()}
                  className="bg-red-700 text-white px-4 py-2 rounded-r hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  {isLoading ? '...' : 'Act'}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Try actions like &apos;examine the room&apos;, &apos;talk to the innkeeper&apos;, or &apos;go to the forest&apos;
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 