import React, { useState } from 'react';
import { Character, VoiceStyle } from '../types';
import { generateAvatar } from '../services/geminiService';
import Button from './Button';
import CharacterCard from './CharacterCard';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { PlusIcon } from './icons/PlusIcon';

interface Step1CharactersProps {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  onNext: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const Step1Characters: React.FC<Step1CharactersProps> = ({ characters, setCharacters, onNext, showToast }) => {
  const [generatingAvatarId, setGeneratingAvatarId] = useState<string | null>(null);

  const addCharacter = () => {
    const newCharacter: Character = {
      id: `char${Date.now()}`,
      name: '',
      role: '',
      age: '',
      voiceStyle: VoiceStyle.ChildMale,
      costumeColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
      photos: [],
      photoPreviews: [],
      avatarUrl: '',
      details: '',
      isPet: false,
    };
    setCharacters([...characters, newCharacter]);
  };

  const updateCharacter = (updatedCharacter: Character) => {
    setCharacters(prevCharacters => prevCharacters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
  };
  
  const removeCharacter = (characterId: string) => {
    setCharacters(prev => prev.filter(c => c.id !== characterId));
  };

  const handleGenerateAvatar = async (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    setGeneratingAvatarId(characterId);
    try {
      const avatarUrl = await generateAvatar(character);
      updateCharacter({ ...character, avatarUrl });
      showToast('Avatar generated successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast(`Avatar Generation Failed: ${message}`, 'error');
    } finally {
      setGeneratingAvatarId(null);
    }
  };

  const canProceed = characters.every(c => c.name && c.role && c.avatarUrl);

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center">Create Your Characters</h2>
      <p className="mt-2 text-center text-gray-400">Add family members (and pets!) and upload photos to create their 3D avatars.</p>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {characters.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            onUpdate={updateCharacter}
            onRemove={removeCharacter}
            canRemove={characters.length > 1}
            onGenerateAvatar={handleGenerateAvatar}
            isGenerating={generatingAvatarId === character.id}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={addCharacter} variant="secondary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Character or Pet
        </Button>
      </div>
      
      <div className="mt-12 flow-root">
        <Button onClick={onNext} disabled={!canProceed} className="w-full sm:w-auto sm:float-right">
          Next: World & Style
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Button>
      </div>
       {!canProceed && <p className="text-right mt-2 text-sm text-yellow-400">Please provide a name, role, and generate an avatar for each character to continue.</p>}
    </div>
  );
};

export default Step1Characters;