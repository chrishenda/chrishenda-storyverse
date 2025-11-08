import React from 'react';
import { Character, VoiceStyle } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { XIcon } from './icons/XIcon';

interface CharacterCardProps {
  character: Character;
  onUpdate: (updatedCharacter: Character) => void;
  onRemove: (characterId: string) => void;
  onGenerateAvatar: (characterId: string) => void;
  isGenerating: boolean;
  canRemove: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onUpdate, onRemove, onGenerateAvatar, isGenerating, canRemove }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 4);
      // The type of `file` was inferred as `unknown`. Casting it to `Blob` satisfies `URL.createObjectURL`.
      const photoPreviews = files.map(file => URL.createObjectURL(file as Blob));
      onUpdate({ ...character, photos: files, photoPreviews });
    }
  };
  
  const formElementClasses = "w-full bg-gray-700/80 border-gray-600/80 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-300";

  return (
    <div className="relative bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden transition-all hover:shadow-lg hover:shadow-blue-900/20">
      {canRemove && (
        <button
          onClick={() => onRemove(character.id)}
          className="absolute top-2 right-2 z-10 p-1 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-red-500/80 rounded-full transition-colors"
          aria-label="Remove character"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Avatar & Photos */}
        <div className="md:col-span-1 space-y-4">
          <div className="relative w-32 h-32 mx-auto rounded-full bg-gray-700/80 flex items-center justify-center overflow-hidden flex-shrink-0">
            {character.avatarUrl ? (
              <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm text-center">Avatar Preview</span>
            )}
            {isGenerating && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <SparklesIcon className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
            )}
          </div>
          <div>
            <label className={`${labelClasses} mb-2 text-center`}>Upload 1-4 Reference Photos</label>
            {character.photoPreviews.length > 0 ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                    {character.photoPreviews.map((src, idx) => (
                        <img key={idx} src={src} className="w-full aspect-square rounded object-cover" alt={`preview ${idx}`}/>
                    ))}
                </div>
            ) : (
                <div className="mt-2 text-center text-xs text-gray-400 p-4 border-2 border-dashed border-gray-600 rounded-lg">
                    Upload photos to generate a personalized avatar.
                </div>
            )}
             <div className="mt-3 flex flex-col space-y-2">
                <label htmlFor={`photos-${character.id}`} className="cursor-pointer flex-1 text-center px-4 py-2 bg-gray-700/80 hover:bg-gray-600/80 rounded-md text-sm text-gray-200 transition-colors flex items-center justify-center">
                    <UploadIcon className="w-4 h-4 mr-2 inline" />
                    Select Photos
                </label>
                <input id={`photos-${character.id}`} type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
                <button onClick={() => onGenerateAvatar(character.id)} disabled={character.photos.length === 0 || isGenerating} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 mr-2"/>
                    {isGenerating ? 'Generating...' : 'Generate Avatar'}
                </button>
            </div>
          </div>
        </div>
        
        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-4">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`name-${character.id}`} className={labelClasses}>Name</label>
                    <input id={`name-${character.id}`} type="text" value={character.name} onChange={(e) => onUpdate({ ...character, name: e.target.value })} placeholder="e.g., Grandma Jean" className={`${formElementClasses} mt-1`} />
                </div>
                <div>
                    <label htmlFor={`role-${character.id}`} className={labelClasses}>Role</label>
                    <input id={`role-${character.id}`} type="text" value={character.role} onChange={(e) => onUpdate({ ...character, role: e.target.value })} placeholder={character.isPet ? 'e.g., The Family Dog' : 'e.g., Eldest Child'} className={`${formElementClasses} mt-1`} />
                </div>
           </div>
           
           <div className="flex items-center space-x-2 pt-2">
                <input id={`isPet-${character.id}`} type="checkbox" checked={character.isPet} onChange={(e) => onUpdate({ ...character, isPet: e.target.checked })} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={`isPet-${character.id}`} className={labelClasses}>This character is a pet</label>
            </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`age-${character.id}`} className={labelClasses}>Age</label>
                    <input id={`age-${character.id}`} type="text" value={character.age} onChange={(e) => onUpdate({ ...character, age: e.target.value })} placeholder="e.g., 5 years old" className={`${formElementClasses} mt-1`} />
                </div>
                <div>
                    <label htmlFor={`voice-${character.id}`} className={labelClasses}>Voice Style</label>
                    <select id={`voice-${character.id}`} value={character.voiceStyle} onChange={(e) => onUpdate({ ...character, voiceStyle: e.target.value as VoiceStyle })} disabled={character.isPet} className={`${formElementClasses} mt-1 disabled:opacity-50 disabled:cursor-not-allowed`}>
                         {Object.values(VoiceStyle).map(style => <option key={style} value={style}>{style}</option>)}
                    </select>
                </div>
           </div>
           
           <div>
               <label htmlFor={`details-${character.id}`} className={labelClasses}>Details / Description</label>
               <textarea id={`details-${character.id}`} value={character.details} onChange={(e) => onUpdate({ ...character, details: e.target.value })} rows={3} className={`${formElementClasses} mt-1`} placeholder="e.g., Wears red glasses, has curly brown hair, always smiling..."></textarea>
           </div>
           
            <div className="flex items-center space-x-3 pt-2">
                <label htmlFor={`color-${character.id}`} className={labelClasses}>Costume/Color Cue:</label>
                <input id={`color-${character.id}`} type="color" value={character.costumeColor} onChange={(e) => onUpdate({ ...character, costumeColor: e.target.value })} className="w-8 h-8 rounded border-none bg-transparent cursor-pointer" />
            </div>

        </div>
      </div>
    </div>
  );
};

export default CharacterCard;