// Character types
export type CharacterClass = 'Warrior' | 'Mage' | 'Rogue' | 'Cleric';
export type CharacterRelic = 'Blade of Ember' | 'Staff of Whispers' | 'Shadow Cloak' | 'Divine Amulet';

export interface Character {
  id: string;
  name: string;
  description: string;
  class: CharacterClass;
  relic: CharacterRelic;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  inventory: Item[];
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  abilities: Ability[];
  gold: number;
}

// Item types
export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'potion' | 'quest' | 'misc';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  effects?: ItemEffect[];
  usable: boolean;
}

export interface ItemEffect {
  type: 'heal' | 'damage' | 'buff' | 'debuff';
  target: 'self' | 'enemy' | 'allies';
  amount: number;
  duration?: number;
}

// Location types
export interface Location {
  id: string;
  name: string;
  description: string;
  image?: string;
  connections: string[];
  npcs?: NPC[];
  enemies?: Enemy[];
  items?: Item[];
  quests?: Quest[];
}

// NPC types
export interface NPC {
  id: string;
  name: string;
  description: string;
  attitude: 'friendly' | 'neutral' | 'hostile';
  dialog: DialogOption[];
  quests?: Quest[];
  shop?: Item[];
}

export interface DialogOption {
  id: string;
  text: string;
  playerResponse: string[];
  responses: DialogResponse[];
}

export interface DialogResponse {
  id: string;
  text: string;
  condition?: string;
  action?: string;
}

// Enemy types
export interface Enemy {
  id: string;
  name: string;
  description: string;
  level: number;
  health: number;
  maxHealth: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
  };
  abilities: Ability[];
  drops: Item[];
  experience: number;
  gold: number;
}

// Ability types
export interface Ability {
  id: string;
  name: string;
  description: string;
  damage?: number;
  healing?: number;
  manaCost: number;
  cooldown: number;
  aoe: boolean;
  type: 'attack' | 'heal' | 'buff' | 'debuff' | 'utility';
}

// Quest types
export interface Quest {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  isCompleted: boolean;
  isActive: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'interact' | 'explore';
  target: string;
  count: number;
  progress: number;
  isCompleted: boolean;
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item';
  amount: number;
  item?: Item;
}

// Game log entry type
export interface GameLogEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'narrative' | 'dialog' | 'combat' | 'system';
}

// Combat state
export interface CombatState {
  inCombat: boolean;
  enemies: Enemy[];
  playerTurn: boolean;
  round: number;
  combatLog: string[];
}

// Game state
export interface GameState {
  character: Character | null;
  currentLocation: Location | null;
  gameLog: GameLogEntry[];
  quests: Quest[];
  combat: CombatState | null;
  visitedLocations: string[];
  gameTime: number;
}

// AI Response types
export interface NarrativeResponse {
  text: string;
  imagePrompt?: string;
  choices?: string[];
}

export interface CharacterDescriptionResponse {
  text: string;
  imagePrompt?: string;
} 