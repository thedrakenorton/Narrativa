'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../lib/store';
import { CharacterClass, CharacterRelic } from '../types';
import { generateCharacterDescription } from '../services/gemini';

const characterClasses: { value: CharacterClass; label: string; description: string }[] = [
  {
    value: 'Warrior',
    label: 'Warrior',
    description: 'Masters of combat, warriors excel at close-quarters fighting with exceptional strength and endurance.'
  },
  {
    value: 'Mage',
    label: 'Mage',
    description: 'Wielders of arcane energies, mages can unleash devastating spells and possess vast mystical knowledge.'
  },
  {
    value: 'Rogue',
    label: 'Rogue',
    description: 'Experts in stealth and precision, rogues strike from the shadows and navigate treacherous environments with ease.'
  },
  {
    value: 'Cleric',
    label: 'Cleric',
    description: 'Vessels of divine power, clerics can heal allies, smite enemies, and call upon otherworldly forces for aid.'
  }
];

const relics: { value: CharacterRelic; label: string; description: string }[] = [
  {
    value: 'Blade of Ember',
    label: 'Blade of Ember',
    description: 'An ancient sword with a blade that glows with inner fire. It burns with the fury of a thousand suns.'
  },
  {
    value: 'Staff of Whispers',
    label: 'Staff of Whispers',
    description: 'A gnarled staff wrapped in dark energy. When wielded, it speaks secrets of the void to its master.'
  },
  {
    value: 'Shadow Cloak',
    label: 'Shadow Cloak',
    description: 'A cloak woven from the essence of darkness itself. It grants its wearer the ability to meld with shadows.'
  },
  {
    value: 'Divine Amulet',
    label: 'Divine Amulet',
    description: 'A holy relic that pulses with celestial light. It channels the power of forgotten deities.'
  }
];

export default function CharacterCreation() {
  const { createNewCharacter, startNewGame } = useGameStore();
  const [step, setStep] = useState<'intro' | 'details' | 'description' | 'confirm'>('intro');
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState<CharacterClass | ''>('');
  const [relic, setRelic] = useState<CharacterRelic | ''>('');
  const [userDescription, setUserDescription] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [characterImagePrompt, setCharacterImagePrompt] = useState('');

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !characterClass || !relic) {
      alert('Please fill in all fields');
      return;
    }
    
    setStep('description');
  };

  const handleSubmitDescription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userDescription) {
      alert('Please enter a description of your character');
      return;
    }
    
    setIsGenerating(true);
    try {
      // Call Gemini API to generate a rich character description
      const response = await generateCharacterDescription(userDescription, characterClass as string);
      
      setGeneratedDescription(response.text);
      if (response.imagePrompt) {
        setCharacterImagePrompt(response.imagePrompt);
      }
      
      setStep('confirm');
    } catch (error) {
      console.error('Error generating character description:', error);
      alert('There was an error generating your character. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmCharacter = () => {
    createNewCharacter(
      name,
      generatedDescription || userDescription,
      characterClass as CharacterClass,
      relic as CharacterRelic
    );
    startNewGame();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {step === 'intro' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold mb-6 text-red-500">Dark Fantasy RPG</h1>
          <p className="text-lg mb-8 text-gray-300">
            Venture into a world of darkness, where ancient evils stir and heroes are forged in blood and shadow.
            Your journey begins in the cursed village of Eldermoor, a place where hope has all but faded...
          </p>
          <button
            onClick={() => setStep('details')}
            className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
          >
            Begin Your Journey
          </button>
        </motion.div>
      )}

      {step === 'details' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto w-full"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-red-500">Create Your Character</h2>
          <form onSubmit={handleSubmitDetails} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Character Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your character's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose Your Class
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characterClasses.map((cls) => (
                  <div
                    key={cls.value}
                    onClick={() => setCharacterClass(cls.value)}
                    className={`p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors ${
                      characterClass === cls.value ? 'bg-red-900 border border-red-500' : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    <h3 className="font-bold text-lg">{cls.label}</h3>
                    <p className="text-sm text-gray-400 mt-1">{cls.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose Your Relic
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relics.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => setRelic(item.value)}
                    className={`p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors ${
                      relic === item.value ? 'bg-red-900 border border-red-500' : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    <h3 className="font-bold text-lg">{item.label}</h3>
                    <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep('intro')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
              >
                Next
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {step === 'description' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto w-full"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-red-500">Describe Your Character</h2>
          <p className="text-gray-300 mb-6">
            In your own words, describe your character's appearance, personality, and background.
            Our AI Dungeon Master will use this to create a rich character profile.
          </p>
          <form onSubmit={handleSubmitDescription} className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Character Description
              </label>
              <textarea
                id="description"
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="E.g. I am Kaelen, a young warrior scarred by past battles, cloaked in worn leather armor. Silver hair cascades down my shoulders. My gaze is fierce but weary, eyes piercing blue, reflecting a troubled history."
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className={`px-4 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors ${
                  isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isGenerating ? 'Generating...' : 'Create Character Profile'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {step === 'confirm' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto w-full"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-red-500">Your Character</h2>
          
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-2">{name}</h3>
            <div className="mb-2 text-sm">
              <span className="text-gray-400">Class: </span>
              <span className="text-gray-200">{characterClass}</span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-gray-400">Relic: </span>
              <span className="text-gray-200">{relic}</span>
            </div>
            <div className="border-t border-gray-700 my-4"></div>
            <p className="whitespace-pre-line text-gray-300">{generatedDescription || userDescription}</p>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep('description')}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConfirmCharacter}
              className="px-4 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
            >
              Begin Adventure
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
} 