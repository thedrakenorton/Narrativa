# Narrativa: AI-Powered Dark Fantasy RPG

An immersive dark fantasy role-playing game powered by Gemini AI. Create a unique character, explore a grim medieval world, engage in combat, and experience dynamically generated narratives.

## Features

- **Character Creation**: Choose from multiple classes and relics, with AI-enhanced character descriptions
- **Dynamic Storytelling**: AI-generated narratives that respond to player actions and choices
- **Atmospheric World**: Dark fantasy setting with rich, immersive descriptions
- **Combat System**: Turn-based combat against various enemies
- **Persistent Game State**: Save your progress and continue your adventure

## Technologies Used

- **Next.js**: React framework for the frontend
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth transitions
- **Zustand**: State management
- **Gemini AI**: Google's generative AI for dynamic narrative generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/thedrakenorton/Narrativa.git
   ```

2. Navigate to the project directory:
   ```
   cd Narrativa
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env.local` file and add your Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to start your adventure.

## Project Structure

- `app/components`: UI components for the game
- `app/lib`: Utilities and state management
- `app/services`: API services for AI integration
- `app/types`: TypeScript type definitions

## Future Enhancements

- Enhanced combat mechanics
- Quest system
- Inventory management
- Character progression and skills
- Image generation for scenes and characters

## License

This project is licensed under the MIT License - see the LICENSE file for details.
