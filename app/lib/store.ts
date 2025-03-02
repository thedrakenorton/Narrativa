'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  Character, 
  CharacterClass,
  CharacterRelic,
  Location, 
  Enemy, 
  Item, 
  GameLogEntry,
  Quest,
  CombatState,
  GameState
} from '../types';

// Initial locations
const locations: Record<string, Location> = {
  'village': {
    id: 'village',
    name: 'Eldermoor Village',
    description: 'A small, dreary settlement shrouded in perpetual twilight. Dilapidated wooden buildings line the muddy streets, and villagers hurry about with wary eyes.',
    connections: ['forest', 'tavern', 'blacksmith'],
    npcs: []
  },
  'tavern': {
    id: 'tavern',
    name: 'The Howling Wolf Tavern',
    description: 'A dimly lit tavern with rough-hewn wooden tables and the smell of stale ale. A few patrons huddle in corners, speaking in hushed tones.',
    connections: ['village'],
    npcs: []
  },
  'forest': {
    id: 'forest',
    name: 'The Whispering Woods',
    description: 'Ancient trees loom overhead, their twisted branches blocking what little light filters through the perpetual mist. Strange sounds echo from deep within.',
    connections: ['village', 'ruins'],
    enemies: [
      {
        id: 'wolf1',
        name: 'Shadow Wolf',
        description: 'A wolf with fur as black as midnight and eyes that glow with an unnatural red light.',
        level: 1,
        health: 15,
        maxHealth: 15,
        stats: {
          strength: 3,
          dexterity: 4,
          constitution: 2
        },
        abilities: [],
        drops: [],
        experience: 10,
        gold: 0
      }
    ]
  },
  'blacksmith': {
    id: 'blacksmith',
    name: 'The Smoldering Forge',
    description: 'A soot-covered workshop where the village blacksmith crafts weapons and armor. The heat from the forge provides rare warmth in this cold place.',
    connections: ['village'],
    npcs: []
  },
  'ruins': {
    id: 'ruins',
    name: 'Ancient Temple Ruins',
    description: 'Crumbling stone structures covered in strange symbols. The air here feels charged with forgotten magic.',
    connections: ['forest', 'crypt'],
    enemies: []
  },
  'crypt': {
    id: 'crypt',
    name: 'The Forgotten Crypt',
    description: 'A dark, underground chamber filled with ancient sarcophagi. The walls are adorned with faded murals depicting strange rituals.',
    connections: ['ruins'],
    enemies: [
      {
        id: 'skeleton1',
        name: 'Reanimated Skeleton',
        description: 'A skeleton animated by dark magic, its bones yellowed with age. It clutches a rusted sword in its bony hands.',
        level: 2,
        health: 20,
        maxHealth: 20,
        stats: {
          strength: 4,
          dexterity: 2,
          constitution: 3
        },
        abilities: [],
        drops: [],
        experience: 20,
        gold: 5
      }
    ]
  }
};

// Helper function to generate base stats based on character class
const getBaseStats = (characterClass: CharacterClass) => {
  switch (characterClass) {
    case 'Warrior':
      return {
        strength: 8,
        dexterity: 5,
        constitution: 7,
        intelligence: 3,
        wisdom: 4,
        charisma: 5
      };
    case 'Mage':
      return {
        strength: 3,
        dexterity: 4,
        constitution: 4,
        intelligence: 8,
        wisdom: 7,
        charisma: 6
      };
    case 'Rogue':
      return {
        strength: 5,
        dexterity: 8,
        constitution: 5,
        intelligence: 6,
        wisdom: 4,
        charisma: 6
      };
    case 'Cleric':
      return {
        strength: 5,
        dexterity: 4,
        constitution: 6,
        intelligence: 5,
        wisdom: 8,
        charisma: 7
      };
    default:
      return {
        strength: 5,
        dexterity: 5,
        constitution: 5,
        intelligence: 5,
        wisdom: 5,
        charisma: 5
      };
  }
};

// Calculate damage based on stats and weapons
const calculateDamage = (strength: number, dexterity: number, isRanged = false) => {
  const baseDamage = isRanged ? dexterity : strength;
  return Math.floor(baseDamage * 1.5) + Math.floor(Math.random() * 4);
};

// Game store using Zustand
export const useGameStore = create<GameState & {
  // Character actions
  createNewCharacter: (name: string, description: string, characterClass: CharacterClass, relic: CharacterRelic) => void;
  updateCharacterStats: (stats: Partial<Character['stats']>) => void;
  addItemToInventory: (item: Item) => void;
  removeItemFromInventory: (itemId: string) => void;
  useItem: (itemId: string) => void;
  gainExperience: (amount: number) => void;
  
  // World actions
  moveToLocation: (locationId: string) => void;
  addToGameLog: (text: string, type: GameLogEntry['type']) => void;
  
  // Combat actions
  startCombat: (enemies: Enemy[]) => void;
  endCombat: () => void;
  attackEnemy: (enemyId: string, abilityName: string) => void;
  
  // Game management
  startNewGame: () => void;
  saveGame: () => void;
  loadGame: () => void;
}>((set, get) => ({
  // Initial state
  character: null,
  currentLocation: null,
  gameLog: [],
  quests: [],
  combat: null,
  visitedLocations: [],
  gameTime: 0,

  // Create a new character
  createNewCharacter: (name, description, characterClass, relic) => {
    const id = uuidv4();
    const baseStats = getBaseStats(characterClass);
    const initialHealth = 20 + baseStats.constitution * 5;
    const initialMana = baseStats.intelligence * 10;
    
    const newCharacter: Character = {
      id,
      name,
      description,
      class: characterClass,
      relic,
      level: 1,
      experience: 0,
      health: initialHealth,
      maxHealth: initialHealth,
      mana: initialMana,
      maxMana: initialMana,
      inventory: [],
      stats: baseStats,
      abilities: [],
      gold: 10
    };
    
    set({ character: newCharacter });
  },
  
  // Update character stats
  updateCharacterStats: (stats) => {
    const { character } = get();
    if (!character) return;
    
    set({
      character: {
        ...character,
        stats: { ...character.stats, ...stats }
      }
    });
  },
  
  // Add item to inventory
  addItemToInventory: (item) => {
    const { character } = get();
    if (!character) return;
    
    set({
      character: {
        ...character,
        inventory: [...character.inventory, item]
      }
    });
  },
  
  // Remove item from inventory
  removeItemFromInventory: (itemId) => {
    const { character } = get();
    if (!character) return;
    
    set({
      character: {
        ...character,
        inventory: character.inventory.filter(item => item.id !== itemId)
      }
    });
  },
  
  // Use an item from inventory
  useItem: (itemId) => {
    const { character } = get();
    if (!character) return;
    
    const item = character.inventory.find(i => i.id === itemId);
    if (!item || !item.usable) return;
    
    // Apply item effects
    if (item.effects) {
      item.effects.forEach(effect => {
        if (effect.type === 'heal' && effect.target === 'self') {
          const newHealth = Math.min(character.health + effect.amount, character.maxHealth);
          set({
            character: {
              ...character,
              health: newHealth
            }
          });
          
          get().addToGameLog(`You used ${item.name} and restored ${effect.amount} health.`, 'system');
        }
      });
    }
    
    // Remove the used item
    get().removeItemFromInventory(itemId);
  },
  
  // Gain experience and level up if needed
  gainExperience: (amount) => {
    const { character } = get();
    if (!character) return;
    
    const newExperience = character.experience + amount;
    const experienceToNextLevel = character.level * 100;
    
    let newLevel = character.level;
    let remainingExperience = newExperience;
    
    // Check if level up
    if (newExperience >= experienceToNextLevel) {
      newLevel++;
      remainingExperience = newExperience - experienceToNextLevel;
      
      // Increase stats on level up
      const newStats = { ...character.stats };
      
      if (character.class === 'Warrior') {
        newStats.strength += 2;
        newStats.constitution += 1;
      } else if (character.class === 'Mage') {
        newStats.intelligence += 2;
        newStats.wisdom += 1;
      } else if (character.class === 'Rogue') {
        newStats.dexterity += 2;
        newStats.charisma += 1;
      } else if (character.class === 'Cleric') {
        newStats.wisdom += 2;
        newStats.constitution += 1;
      }
      
      // Calculate new max health and mana
      const newMaxHealth = 20 + newStats.constitution * 5;
      const newMaxMana = newStats.intelligence * 10;
      
      set({
        character: {
          ...character,
          level: newLevel,
          experience: remainingExperience,
          maxHealth: newMaxHealth,
          health: newMaxHealth, // Fully heal on level up
          maxMana: newMaxMana,
          mana: newMaxMana, // Fully restore mana on level up
          stats: newStats
        }
      });
      
      get().addToGameLog(`You gained ${amount} experience and leveled up to level ${newLevel}!`, 'system');
    } else {
      set({
        character: {
          ...character,
          experience: newExperience
        }
      });
      
      get().addToGameLog(`You gained ${amount} experience.`, 'system');
    }
  },
  
  // Move to a new location
  moveToLocation: (locationId) => {
    const location = locations[locationId];
    if (!location) return;
    
    // Add to visited locations
    const { visitedLocations } = get();
    const newVisitedLocations = [...visitedLocations];
    if (!newVisitedLocations.includes(locationId)) {
      newVisitedLocations.push(locationId);
    }
    
    // Check for random encounters
    const hasEnemies = location.enemies && location.enemies.length > 0;
    const randomEncounter = hasEnemies && Math.random() < 0.3; // 30% chance
    
    set({
      currentLocation: location,
      visitedLocations: newVisitedLocations
    });
    
    get().addToGameLog(`You have moved to ${location.name}.`, 'narrative');
    
    // Start combat if random encounter
    if (randomEncounter && location.enemies) {
      get().startCombat(location.enemies);
    }
  },
  
  // Add entry to game log
  addToGameLog: (text, type) => {
    const newEntry: GameLogEntry = {
      id: uuidv4(),
      text,
      timestamp: Date.now(),
      type
    };
    
    set(state => ({
      gameLog: [...state.gameLog, newEntry]
    }));
  },
  
  // Start combat
  startCombat: (enemies) => {
    const combatState: CombatState = {
      inCombat: true,
      enemies: JSON.parse(JSON.stringify(enemies)), // Deep copy
      playerTurn: true,
      round: 1,
      combatLog: []
    };
    
    set({ combat: combatState });
    
    // Log combat start
    get().addToGameLog(`Combat started! You are facing ${enemies.map(e => e.name).join(', ')}.`, 'combat');
  },
  
  // End combat
  endCombat: () => {
    const { character, combat } = get();
    if (!combat || !character) return;
    
    // Award experience and loot
    let totalExperience = 0;
    let totalGold = 0;
    
    combat.enemies.forEach(enemy => {
      totalExperience += enemy.experience;
      totalGold += enemy.gold;
      
      // Add drops to inventory (simplified for MVP)
      if (enemy.drops && enemy.drops.length > 0) {
        enemy.drops.forEach(item => {
          get().addItemToInventory(item);
        });
      }
    });
    
    // Gain experience
    get().gainExperience(totalExperience);
    
    // Gain gold
    set({
      character: {
        ...character,
        gold: character.gold + totalGold
      }
    });
    
    // Log rewards
    get().addToGameLog(`Combat ended. You gained ${totalExperience} experience and ${totalGold} gold.`, 'combat');
    
    // End combat
    set({ combat: null });
  },
  
  // Attack an enemy
  attackEnemy: (enemyId, abilityName) => {
    const { character, combat } = get();
    if (!combat || !character) return;
    
    // Find the target enemy
    const enemyIndex = combat.enemies.findIndex(e => e.id === enemyId);
    if (enemyIndex === -1) return;
    
    const enemy = combat.enemies[enemyIndex];
    
    // Calculate damage
    const damage = calculateDamage(character.stats.strength, character.stats.dexterity);
    
    // Apply damage to enemy
    const newEnemyHealth = Math.max(0, enemy.health - damage);
    const newEnemies = [...combat.enemies];
    newEnemies[enemyIndex] = {
      ...enemy,
      health: newEnemyHealth
    };
    
    // Update combat state
    set({
      combat: {
        ...combat,
        enemies: newEnemies,
        playerTurn: false, // End player turn
        round: newEnemyHealth <= 0 ? combat.round : combat.round + 1
      }
    });
    
    // Log attack
    get().addToGameLog(`You hit ${enemy.name} for ${damage} damage.`, 'combat');
    
    // Check if enemy is defeated
    if (newEnemyHealth <= 0) {
      get().addToGameLog(`You defeated ${enemy.name}!`, 'combat');
      
      // Remove defeated enemy
      const remainingEnemies = newEnemies.filter(e => e.health > 0);
      
      // Check if all enemies are defeated
      if (remainingEnemies.length === 0) {
        get().endCombat();
        return;
      }
      
      // Continue combat with remaining enemies
      set({
        combat: {
          ...combat,
          enemies: remainingEnemies,
          playerTurn: true // Give player another turn after defeating an enemy
        }
      });
      return;
    }
    
    // Enemy turn - simplified for MVP
    setTimeout(() => {
      const { character, combat } = get();
      if (!combat || !character) return;
      
      // Each enemy attacks
      let totalDamage = 0;
      combat.enemies.forEach(enemy => {
        const enemyDamage = Math.max(1, Math.floor(enemy.stats.strength * 1.2));
        totalDamage += enemyDamage;
      });
      
      // Apply damage to player
      const newHealth = Math.max(0, character.health - totalDamage);
      set({
        character: {
          ...character,
          health: newHealth
        },
        combat: {
          ...combat,
          playerTurn: true // Return to player turn
        }
      });
      
      // Log enemy attack
      get().addToGameLog(`Enemies attack! You take ${totalDamage} damage.`, 'combat');
      
      // Check if player is defeated
      if (newHealth <= 0) {
        get().addToGameLog('You have been defeated! Game over.', 'system');
        // In a full game, would handle player defeat/game over here
      }
    }, 1000);
  },
  
  // Start a new game
  startNewGame: () => {
    const { character } = get();
    if (!character) return;
    
    // Set initial location to village
    get().moveToLocation('village');
    
    // Add initial game log entry
    get().addToGameLog('Your adventure begins in the cursed village of Eldermoor. Darkness lurks in every shadow, but perhaps you can find the light...', 'narrative');
  },
  
  // Save game to localStorage
  saveGame: () => {
    const state = get();
    try {
      localStorage.setItem('rpg_save', JSON.stringify({
        character: state.character,
        currentLocation: state.currentLocation,
        gameLog: state.gameLog,
        quests: state.quests,
        visitedLocations: state.visitedLocations,
        gameTime: state.gameTime
      }));
      console.log('Game saved successfully');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  },
  
  // Load game from localStorage
  loadGame: () => {
    try {
      const savedGame = localStorage.getItem('rpg_save');
      if (!savedGame) {
        console.log('No saved game found');
        return;
      }
      
      const gameData = JSON.parse(savedGame);
      set({
        character: gameData.character,
        currentLocation: gameData.currentLocation,
        gameLog: gameData.gameLog,
        quests: gameData.quests,
        visitedLocations: gameData.visitedLocations,
        gameTime: gameData.gameTime
      });
      
      console.log('Game loaded successfully');
    } catch (error) {
      console.error('Failed to load game:', error);
    }
  }
})); 