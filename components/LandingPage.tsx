import React from 'react';
import Hero from './Hero';
import CharacterStage from './CharacterStage';
import { CHARACTERS } from '../constants';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-white">
      <Hero />
      <div className="relative z-10">
        {CHARACTERS.map((character, index) => (
          <div key={character.id} className="h-screen relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 z-0"></div>
            <CharacterStage
              character={character}
              align={index % 2 === 0 ? 'left' : 'right'}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
