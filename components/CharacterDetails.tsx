import React from 'react';
import type { Character } from '../types';
import './CharacterDetails.css';

interface CharacterDetailsProps {
  character: Character;
}

const CharacterDetails: React.FC<CharacterDetailsProps> = ({ character }) => {
  return (
    <div className="character-details-container">
      <h2 className="character-details-name">{character.name}</h2>
      <span className="character-details-role" style={{ background: `${character.color}40`, color: character.color }}>
        {character.role}
      </span>

      <div className="specialty-section">
        <h3 className="specialty-heading">Specialty</h3>
        <p className="specialty-text">{character.specialty}</p>
      </div>

      <div className="skills-container">
        {Object.entries(character.skills).map(([skill, value]) => (
            <div key={skill}>
                <div className="skill-label-value">
                    <span className="skill-label">{skill.replace('_', ' ')}</span>
                    <span className="skill-value">{value}</span>
                </div>
                <div className="skill-bar-bg">
                    <div className="skill-bar-fg" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${character.color}, ${character.color}dd)` }} />
                </div>
            </div>
        ))}
      </div>

      <button className="equip-button" style={{ background: `linear-gradient(135deg, ${character.color}, ${character.color}cc)` }}>
        Equip Appearance
      </button>
    </div>
  );
};

export default CharacterDetails;
