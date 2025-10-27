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
  },
  {
    id: 'riko',
    name: 'Riko',
    role: 'Engineer',
    skills: { engineering: 90, problem_solving: 85, mathematics: 95 },
    specialty: 'Architecting complex AR/VR systems and optimizing performance.',
    color: '#38bdf8',
    modelPath: 'https://cdn.jsdelivr.net/gh/dev-gaur/3d-assets/Riko.glb'
  },
  {
    id: 'avar',
    name: 'Avar',
    role: 'Ninja',
    skills: { stealth: 95, agility: 90, combat: 85 },
    specialty: 'Executing tasks with precision and efficiency in high-stakes scenarios.',
    color: '#e11d48',
    modelPath: 'https://cdn.jsdelivr.net/gh/dev-gaur/3d-assets/avar-_the_cyborg_ninja_-low-poly.glb'
  }
];