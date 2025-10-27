import React, { useState } from 'react';
import { CHARACTERS } from '../constants';
import type { Character } from '../types';
import CharacterList from './CharacterList';
import CharacterDetails from './CharacterDetails';
import CharacterViewer from './CharacterViewer';
import './CharacterSelection.css';

const CharacterSelection: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);

  return (
    <div className="character-selection-container">
      {/* Header */}
      <header className="character-selection-header">
        <div className="header-title">CHARACTER</div>
        <button className="close-button">X</button>
      </header>

      <main className="main-grid">
        {/* Left Column: Character List */}
        <div className="left-column">
          <CharacterList
            selectedCharacter={selectedCharacter}
            onSelectCharacter={setSelectedCharacter}
          />
        </div>

        {/* Center Column: 3D Model Viewer */}
        <div className="center-column">
          <CharacterViewer character={selectedCharacter} />
        </div>

        {/* Right Column: Character Details */}
        <div className="right-column">
          <CharacterDetails character={selectedCharacter} />
        </div>
      </main>
    </div>
  );
};

export default CharacterSelection;
