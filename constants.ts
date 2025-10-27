import type { Character } from './types';

export const CHARACTERS: Character[] = [
  { 
    id: 'omen', 
    name: 'Omen', 
    role: 'Creator', 
    skills: { creativity: 75, logic: 55, visualization: 70 }, 
    specialty: 'Conceptual Prototyping: Quickly builds and tests AR/VR concepts.', 
    color: '#f472b6', 
    modelPath: 'https://cdn.jsdelivr.net/gh/ridho-mnf/mio-chan@main/Mio.glb' 
  },
  { 
    id: 'catherine-mercy', 
    name: 'Catherine Mercy', 
    role: 'AI Mentor', 
    skills: { planning: 95, tracking: 98, motivation: 90 }, 
    specialty: 'Your personal assistant. Intimates learning plans and sends notifications on course completion.', 
    color: '#f59e0b', 
    modelPath: 'https://varunkumar-005.github.io/animate/echo.fbx',
    isPremium: true,
    price: 25
  }
];