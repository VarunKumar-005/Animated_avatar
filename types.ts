export interface CharacterSkills {
  [key:string]: number;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  skills: CharacterSkills;
  specialty: string;
  color: string;
  modelPath: string;
  isPremium?: boolean;
  price?: number;
  position?: { x: number; y: number; z: number };
}