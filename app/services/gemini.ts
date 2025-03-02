'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  Character, 
  Enemy, 
  Location, 
  GameLogEntry, 
  NarrativeResponse,
  CharacterDescriptionResponse 
} from '../types';

// Initialize the Gemini API Client
// Note: You would normally store this in an environment variable
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Context building for the AI
const getGameSystemPrompt = () => {
  return `You are the AI Dungeon Master for a dark fantasy RPG game. The setting is a grim, medieval world where magic exists but is feared, monsters lurk in the shadows, and humanity struggles to survive in isolated settlements. The tone is mature, atmospheric, and foreboding - similar to Dark Souls, The Witcher, or Darkest Dungeon.

Your task is to generate narrative text for the game based on the player's character, current location, and recent game history. Generate descriptions that are vivid, immersive, and maintain the dark atmosphere of the game world.

The narrative should be written in second-person perspective, addressing the player directly as "you". Keep descriptions concise but evocative, between 2-4 paragraphs. Include sensory details and environmental elements that enhance the atmosphere.

Format your response as JSON with the following structure:
{
  "text": "The narrative text describing the current situation, location, or event",
  "imagePrompt": "A prompt that could be used to generate an image representing the current scene"
}`;
};

// Character description system prompt
const getCharacterDescriptionPrompt = () => {
  return `You are an AI creating rich character profiles for a dark fantasy RPG game. The setting is a grim, medieval world where magic exists but is feared, monsters lurk in the shadows, and humanity struggles to survive.

Your task is to generate an expanded character description based on the player's brief input about their character. The character belongs to one of four classes: Warrior, Mage, Rogue, or Cleric.

Enhance the player's description with:
1. Physical details (appearance, distinctive features, how they carry themselves)
2. Personality traits (reflecting their background and class)
3. A hint of backstory that fits the dark fantasy setting
4. How others in the world might perceive them

Keep the tone mature, atmospheric, and fitting the dark fantasy genre. The description should be in third-person, about 2-3 paragraphs long.

Format your response as JSON with the following structure:
{
  "text": "The expanded character description",
  "imagePrompt": "A detailed prompt that could be used to generate a portrait of this character"
}`;
};

/**
 * Generate a narrative response based on game context
 * @param context The current game context (character, location, etc.)
 * @param playerAction Optional player action that triggered this narrative
 * @returns A narrative response with text and image prompt
 */
export const generateNarrative = async (
  context: {
    character: Character;
    currentLocation: Location;
    gameLog: GameLogEntry[];
  },
  playerAction?: string
): Promise<NarrativeResponse> => {
  try {
    // Build the character context
    const characterContext = `CHARACTER INFO:
Name: ${context.character.name}
Class: ${context.character.class}
Description: ${context.character.description}
Level: ${context.character.level}
HP: ${context.character.health}/${context.character.maxHealth}
Relic: ${context.character.relic}`;

    // Build the location context
    const locationContext = `CURRENT LOCATION:
Name: ${context.currentLocation.name}
Description: ${context.currentLocation.description}
Connected to: ${context.currentLocation.connections.join(', ')}`;

    // Build the recent game history
    const recentHistory = context.gameLog
      .map((entry) => `[${entry.type.toUpperCase()}] ${entry.text}`)
      .join('\n');

    const gameHistoryContext = `RECENT GAME HISTORY:
${recentHistory || 'No recent history.'}`;

    // Build the player action context if provided
    const actionContext = playerAction ? 
      `PLAYER ACTION: ${playerAction}` : 
      'SCENE DESCRIPTION NEEDED: Describe what the player sees upon arriving at this location.';

    // Combine all contexts
    const fullContext = `${characterContext}\n\n${locationContext}\n\n${gameHistoryContext}\n\n${actionContext}`;

    // Get the response from Gemini
    const result = await model.generateContent(getGameSystemPrompt() + '\n\n' + fullContext);
    const response = result.response.text();

    // Parse the response as JSON
    try {
      const parsedResponse = JSON.parse(response);
      return {
        text: parsedResponse.text,
        imagePrompt: parsedResponse.imagePrompt,
      };
    } catch (error) {
      // If response isn't valid JSON, return the raw text
      console.error('Failed to parse Gemini response as JSON:', error);
      return {
        text: response,
      };
    }
  } catch (error) {
    console.error('Error generating narrative:', error);
    return {
      text: 'The shadows deepen around you as you continue your journey. [Error: The Dungeon Master is momentarily unavailable.]',
    };
  }
};

/**
 * Generate a character description based on user input
 * @param userDescription The user's initial description of their character
 * @param characterClass The character's class
 * @returns An enhanced character description with text and image prompt
 */
export const generateCharacterDescription = async (
  userDescription: string,
  characterClass: string
): Promise<CharacterDescriptionResponse> => {
  try {
    // Build the context
    const context = `USER'S CHARACTER DESCRIPTION: "${userDescription}"
CHARACTER CLASS: ${characterClass}

Please generate an expanded character description and an image prompt for this character.`;

    // Get the response from Gemini
    const result = await model.generateContent(getCharacterDescriptionPrompt() + '\n\n' + context);
    const response = result.response.text();

    // Parse the response as JSON
    try {
      const parsedResponse = JSON.parse(response);
      return {
        text: parsedResponse.text,
        imagePrompt: parsedResponse.imagePrompt,
      };
    } catch (error) {
      // If response isn't valid JSON, return the raw text
      console.error('Failed to parse Gemini response as JSON:', error);
      return {
        text: response,
      };
    }
  } catch (error) {
    console.error('Error generating character description:', error);
    return {
      text: 'A mysterious figure shrouded in shadow, their true nature yet to be revealed. [Error: Description generation failed.]',
    };
  }
};

/**
 * Generate a narrative for a combat encounter
 * @param character The player's character
 * @param enemies The enemies involved in the combat
 * @param playerAction The action the player took
 * @param result The result of the action
 * @returns A narrative response with text and image prompt
 */
export const generateCombatNarrative = async (
  character: Character,
  enemies: Enemy[],
  playerAction: string,
  result: string
): Promise<NarrativeResponse> => {
  try {
    // Build the combat context
    const characterContext = `CHARACTER:
Name: ${character.name}
Class: ${character.class}
Weapon/Relic: ${character.relic}
HP: ${character.health}/${character.maxHealth}`;

    const enemiesContext = `ENEMIES:
${enemies.map((enemy) => `${enemy.name} (HP: ${enemy.health}/${enemy.maxHealth})`).join('\n')}`;

    const combatContext = `COMBAT SITUATION:
Player Action: ${playerAction}
Result: ${result}`;

    // Combine contexts
    const fullContext = `${characterContext}\n\n${enemiesContext}\n\n${combatContext}\n\nGenerate a vivid, exciting combat narrative describing this moment in the battle. Focus on the action and maintain the dark fantasy atmosphere.`;

    // Get the response from Gemini
    const response = await model.generateContent(getGameSystemPrompt() + '\n\n' + fullContext);
    const responseText = response.response.text();

    // Parse the response as JSON
    try {
      const parsedResponse = JSON.parse(responseText);
      return {
        text: parsedResponse.text,
        imagePrompt: parsedResponse.imagePrompt,
      };
    } catch (error) {
      // If response isn't valid JSON, return the raw text
      console.error('Failed to parse Gemini response as JSON:', error);
      return {
        text: responseText,
      };
    }
  } catch (error) {
    console.error('Error generating combat narrative:', error);
    return {
      text: 'The clash of steel and the snarls of your enemy fill the air as combat rages on. [Error: Combat narration failed.]',
    };
  }
}; 