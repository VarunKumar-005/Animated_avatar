import type { Character } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'catherine-mercy',
    name: 'Catherine Mercy',
    role: 'AI Mentor',
    skills: { planning: 95, tracking: 98, motivation: 90 },
    specialty: 'Your personal assistant. Intimates learning plans and sends notifications on course completion.',
    color: '#f59e0b', // amber
    modelPath: 'girl.glb',
    isPremium: true,
    price: 25
  },
  {
    id: 'omen',
    name: 'Omen',
    role: 'Creator',
    skills: { creativity: 85, logic: 70, visualization: 90 },
    specialty: 'Conceptual Prototyping: Quickly builds and tests AR/VR concepts.',
    color: '#a855f7', // purple
    modelPath: 'man.glb',
  },
  {
    id: 'lila',
    name: 'Lila',
    role: 'Code Whisperer',
    skills: { debugging: 92, algorithms: 88, optimization: 85 },
    specialty: 'Finds and fixes the most elusive bugs with elegant solutions.',
    color: '#ec4899', // pink
    modelPath: 'girl.glb',
  },
  {
    id: 'kairos',
    name: 'Kairos',
    role: 'Data Weaver',
    skills: { analysis: 90, pattern_recognition: 95, strategy: 80 },
    specialty: 'Transforms complex data into understandable visual narratives.',
    color: '#22d3ee', // cyan
    modelPath: 'man.glb',
  }
];
