import React, { useState, useEffect } from 'react';
import { World, WorldStyle } from '../types';
import { generateWorldPreview } from '../services/geminiService';
import Button from './Button';
import ProgressBar from './ProgressBar';
import ApiKeyHandler from './ApiKeyHandler';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { WORLD_STYLES, TIME_OF_DAY_OPTIONS, LIGHTING_MOOD_OPTIONS } from '../constants';

interface Step2WorldProps {
  world: World;
  setWorld: React.Dispatch<React.SetStateAction<World>>;
  onBack: () => void;
  onNext: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const Step2World: React.FC<Step2WorldProps> = ({ world, setWorld, onBack, onNext, showToast }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [apiKeyReady, setApiKeyReady] = useState(false);

  const [isCustomTime, setIsCustomTime] = useState(() => !TIME_OF_DAY_OPTIONS.includes(world.timeOfDay));
  const [isCustomMood, setIsCustomMood] = useState(() => !LIGHTING_MOOD_OPTIONS.includes(world.lightingMood));

  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    setProgress(0);
    try {
      const previewUrl = await generateWorldPreview(world, setProgress);
      setWorld({ ...world, previewUrl });
      showToast("World preview generated successfully!", 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast(`Preview Generation Failed: ${message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleWorldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'stylizationStrength') {
        setWorld(prev => ({...prev, stylizationStrength: parseInt(value, 10)}));
        return;
    }
    
    if (name === 'timeOfDaySelect') {
        if (value === 'custom') {
            setIsCustomTime(true);
            setWorld(prev => ({ ...prev, timeOfDay: '' }));
        } else {
            setIsCustomTime(false);
            setWorld(prev => ({ ...prev, timeOfDay: value }));
        }
        return;
    }

    if (name === 'lightingMoodSelect') {
        if (value === 'custom') {
            setIsCustomMood(true);
            setWorld(prev => ({ ...prev, lightingMood: '' }));
        } else {
            setIsCustomMood(false);
            setWorld(prev => ({ ...prev, lightingMood: value }));
        }
        return;
    }
    
    // Handles text, textarea, custom inputs, and the style select
    setWorld(prev => ({ ...prev, [name]: value }));
  };

  const formElementClasses = "mt-1 block w-full bg-gray-700/80 border-gray-600/80 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";


  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center">Design Your World</h2>
      <p className="mt-2 text-center text-gray-400">Choose a visual style and setting for your animated story.</p>
      
      <div className="mt-8 max-w-lg mx-auto">
        {/* Centered controls */}
        <div className="bg-gray-800/70 backdrop-blur-md border border-white/10 p-6 rounded-lg space-y-4">
            <div>
                <label htmlFor="style" className="block text-sm font-medium text-gray-300">Style Preset</label>
                <select id="style" name="style" value={world.style} onChange={handleWorldChange} className={formElementClasses}>
                    {WORLD_STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="stylizationStrength" className="block text-sm font-medium text-gray-300">Stylization Strength: {world.stylizationStrength}%</label>
                <input id="stylizationStrength" name="stylizationStrength" type="range" min="10" max="100" value={world.stylizationStrength} onChange={handleWorldChange} className="w-full h-2 bg-gray-700/80 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
            </div>
            <div>
                <label htmlFor="backgroundSet" className="block text-sm font-medium text-gray-300">Background / Setting</label>
                <textarea id="backgroundSet" name="backgroundSet" value={world.backgroundSet} onChange={handleWorldChange} rows={3} className={formElementClasses} placeholder="e.g., A magical forest with glowing mushrooms" />
            </div>
             <div>
                <label htmlFor="timeOfDaySelect" className="block text-sm font-medium text-gray-300">Time of Day / Season</label>
                <select id="timeOfDaySelect" name="timeOfDaySelect" value={isCustomTime ? 'custom' : world.timeOfDay} onChange={handleWorldChange} className={formElementClasses}>
                    {TIME_OF_DAY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="custom">Custom...</option>
                </select>
                {isCustomTime && (
                  <input
                    type="text"
                    name="timeOfDay"
                    value={world.timeOfDay}
                    onChange={handleWorldChange}
                    className={`${formElementClasses} mt-2`}
                    placeholder="Describe time/season..."
                  />
                )}
            </div>
             <div>
                <label htmlFor="lightingMoodSelect" className="block text-sm font-medium text-gray-300">Lighting & Mood</label>
                <select id="lightingMoodSelect" name="lightingMoodSelect" value={isCustomMood ? 'custom' : world.lightingMood} onChange={handleWorldChange} className={formElementClasses}>
                    {LIGHTING_MOOD_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="custom">Custom...</option>
                </select>
                 {isCustomMood && (
                  <input
                    type="text"
                    name="lightingMood"
                    value={world.lightingMood}
                    onChange={handleWorldChange}
                    className={`${formElementClasses} mt-2`}
                    placeholder="Describe lighting/mood..."
                  />
                )}
            </div>
        </div>
      </div>
      
      <div className="mt-12 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <Button onClick={onBack} variant="secondary" className="w-full sm:w-auto">Back: Characters</Button>
        <Button onClick={onNext} disabled={isGenerating} className="w-full sm:w-auto">
          Next: Story
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Button>
      </div>
      {!world.previewUrl && <p className="text-right mt-2 text-sm text-gray-400">World preview is optional. You can continue without generating it.</p>}
    </div>
  );
};

export default Step2World;
