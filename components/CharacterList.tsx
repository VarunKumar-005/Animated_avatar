import React from 'react';
import { CHARACTERS } from '../constants';
import type { Character } from '../types';
import './CharacterList.css';

interface CharacterListProps {
  selectedCharacter: Character;
  onSelectCharacter: (character: Character) => void;
}

const CharacterList: React.FC<CharacterListProps> = ({ selectedCharacter, onSelectCharacter }) => {
  return (
    <div className="character-list-container">
      <h2 className="character-list-heading">ALL</h2>
      <ul className="character-list">
        {CHARACTERS.map((character) => (
          <li key={character.id}>
            <button
              onClick={() => onSelectCharacter(character)}
              className={`character-button ${
                selectedCharacter.id === character.id ? 'selected' : ''
              }`}
            >
              <div className="character-avatar" style={{ backgroundColor: character.color }}></div>
              <div className="character-info">
                <h3 className="character-name">{character.name}</h3>
                <p className="character-role">{character.role}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CharacterList;
