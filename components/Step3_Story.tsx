import React, { useState, useEffect, useCallback } from 'react';
import { Story, StoryTemplate, Character } from '../types';
import { expandStoryOutline, generateStoryFromPrompt } from '../services/geminiService';
import Button from './Button';
import StoryTemplateCard from './StoryTemplateCard';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { STORY_TEMPLATES } from '../constants';
import { PlusIcon } from './icons/PlusIcon';
import { XIcon } from './icons/XIcon';
import { EditPencilIcon, MagicWandIcon } from './icons';

interface Step3StoryProps {
  story: Story;
  setStory: React.Dispatch<React.SetStateAction<Story>>;
  characters: Character[];
  onBack: () => void;
  onNext: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const Step3Story: React.FC<Step3StoryProps> = ({ story, setStory, characters, onBack, onNext, showToast }) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate>(story.template);
  const [quickPrompt, setQuickPrompt] = useState('');

  const handleSelectTemplate = (templateId: StoryTemplate) => {
    setSelectedTemplate(templateId);
    setStory(prev => ({ 
        ...prev,
        template: templateId,
        expandedScript: '',
        ...(templateId !== StoryTemplate.Custom ? {
            title: '',
            synopsis: '',
            scenes: [''],
            location: '',
            ageGroup: '',
            timePeriod: 'Modern',
        } : {})
     }));
  };
  
  const handleGenerateFromPrompt = async () => {
    if (!quickPrompt) {
        showToast('Please enter a prompt for the AI.', 'error');
        return;
    }
    setIsGeneratingIdea(true);
    try {
        const storyIdea = await generateStoryFromPrompt(quickPrompt, characters);
        setStory(prev => ({...prev, ...storyIdea, template: StoryTemplate.AIQuick}));
        // Automatically trigger expansion after idea is generated
        await handleExpandStory({ ...story, ...storyIdea, template: StoryTemplate.AIQuick });
    } catch(error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        showToast(`Story Idea Failed: ${message}`, 'error');
    } finally {
        setIsGeneratingIdea(false);
    }
  }

  const handleExpandStory = useCallback(async (currentStory?: Story) => {
    setIsExpanding(true);
    try {
        const storyToExpand = currentStory || story;
        if(storyToExpand.template === StoryTemplate.Custom && (!storyToExpand.title || !storyToExpand.synopsis)) {
            showToast('Please fill out the custom story details first.', 'error');
            return;
        }
        const expanded = await expandStoryOutline(storyToExpand, characters);
        setStory(expanded);
        showToast("Story generated successfully!", 'success');
    } catch(error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        showToast(`Story Generation Failed: ${message}`, 'error');
    } finally {
        setIsExpanding(false);
    }
  }, [characters, story, setStory, showToast]);
  
  const canProceed = story.expandedScript.length > 0;

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStory(prev => ({ ...prev, [name]: value }));
  };

  const handleSceneChange = (index: number, value: string) => {
      const newScenes = [...story.scenes];
      newScenes[index] = value;
      setStory(prev => ({ ...prev, scenes: newScenes }));
  };

  const addScene = () => {
      setStory(prev => ({ ...prev, scenes: [...prev.scenes, ''] }));
  };

  const removeScene = (index: number) => {
      if (story.scenes.length <= 1) return;
      setStory(prev => ({ ...prev, scenes: story.scenes.filter((_, i) => i !== index) }));
  };

  const formElementClasses = "block w-full bg-gray-700/80 border-gray-600/80 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500";


  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center">Create Your Story</h2>
      <p className="mt-2 text-center text-gray-400">Start with a template, a simple idea, or write your own adventure from scratch.</p>
      
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => handleSelectTemplate(StoryTemplate.AIQuick)}
          className={`cursor-pointer bg-gray-800/70 backdrop-blur-md rounded-lg border-2 p-8 text-center transition-all duration-200 flex flex-col justify-between hover:border-blue-400/80 ${
            selectedTemplate === StoryTemplate.AIQuick ? 'border-blue-500 shadow-lg shadow-blue-900/40' : 'border-white/10'
          }`}
        >
          <div>
            <MagicWandIcon className="w-12 h-12 mx-auto text-purple-400" />
            <h3 className="mt-4 text-2xl font-bold text-white">AI Quick Story</h3>
            <p className="mt-2 max-w-lg mx-auto text-gray-400">Have an idea? Just type a word or a phrase and let our AI write the story for you.</p>
          </div>
           {selectedTemplate === StoryTemplate.AIQuick && (
                <div className="mt-6 space-y-3 animate-fade-in">
                    <input 
                        type="text" 
                        value={quickPrompt}
                        onChange={(e) => setQuickPrompt(e.target.value)}
                        placeholder="e.g., A pirate treasure hunt on the moon"
                        className={`${formElementClasses} text-center`}
                    />
                    <Button onClick={handleGenerateFromPrompt} isLoading={isGeneratingIdea} disabled={isGeneratingIdea || isExpanding} className="w-full">
                        {isGeneratingIdea ? 'Generating Idea...' : 'Generate Story Idea'}
                    </Button>
                </div>
            )}
        </div>
        <div 
          onClick={() => handleSelectTemplate(StoryTemplate.Custom)}
          className={`cursor-pointer bg-gray-800/70 backdrop-blur-md rounded-lg border-2 p-8 text-center transition-all duration-200 flex flex-col justify-between hover:border-blue-400/80 ${
            selectedTemplate === StoryTemplate.Custom ? 'border-blue-500 shadow-lg shadow-blue-900/40' : 'border-white/10'
          }`}
        >
            <div>
                <EditPencilIcon className="w-12 h-12 mx-auto text-blue-400" />
                <h3 className="mt-4 text-2xl font-bold text-white">Write Your Own Story</h3>
                <p className="mt-2 max-w-lg mx-auto text-gray-400">Craft a unique story from scratch with your own title, synopsis, and key scenes.</p>
            </div>
        </div>
      </div>

      <div className="my-12 flex items-center justify-center">
        <div className="h-px flex-grow bg-white/10"></div>
        <span className="mx-6 text-sm font-semibold uppercase text-gray-400">Or, Start with a Template</span>
        <div className="h-px flex-grow bg-white/10"></div>
      </div>

      {selectedTemplate === StoryTemplate.Custom && (
        <div className="mt-12 bg-gray-800/70 backdrop-blur-md border-2 border-blue-500 rounded-lg p-6 space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-white">Create Your Custom Adventure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300">Story Title</label>
                    <input type="text" name="title" id="title" value={story.title} onChange={handleCustomInputChange} className={`mt-1 ${formElementClasses}`} placeholder="e.g., The Great Cookie Caper"/>
                </div>
                <div>
                    <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-300">Target Age Group</label>
                    <input type="text" name="ageGroup" id="ageGroup" value={story.ageGroup} onChange={handleCustomInputChange} className={`mt-1 ${formElementClasses}`} placeholder="e.g., 4-7 years old"/>
                </div>
            </div>
            <div>
                <label htmlFor="synopsis" className="block text-sm font-medium text-gray-300">Synopsis</label>
                <textarea name="synopsis" id="synopsis" rows={3} value={story.synopsis} onChange={handleCustomInputChange} className={`mt-1 ${formElementClasses}`} placeholder="A brief summary of your story..."></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-300">Primary Location</label>
                    <input type="text" name="location" id="location" value={story.location} onChange={handleCustomInputChange} className={`mt-1 ${formElementClasses}`} placeholder="e.g., A whimsical candy factory"/>
                </div>
                <div>
                    <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-300">Time Period</label>
                    <input type="text" name="timePeriod" id="timePeriod" value={story.timePeriod} onChange={handleCustomInputChange} className={`mt-1 ${formElementClasses}`} placeholder="e.g., Near future"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">Key Scenes</label>
                <div className="mt-2 space-y-3">
                    {story.scenes.map((scene, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <textarea value={scene} onChange={(e) => handleSceneChange(index, e.target.value)} rows={2} className={`flex-grow ${formElementClasses}`} placeholder={`Scene ${index + 1} description...`}></textarea>
                            <button onClick={() => removeScene(index)} disabled={story.scenes.length <= 1} className="p-2 text-gray-400 hover:text-white bg-gray-700/80 hover:bg-red-500/80 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <Button onClick={addScene} variant="secondary" size="sm" className="mt-3">
                    <PlusIcon className="w-4 h-4 mr-2"/>
                    Add Scene
                </Button>
            </div>
            <div className="flex justify-end">
                <Button onClick={() => handleExpandStory()} isLoading={isExpanding} disabled={!story.title || !story.synopsis || isExpanding}>
                    {isExpanding ? 'Generating Story...' : 'Generate Story from Details'}
                </Button>
            </div>
        </div>
      )}

        {(isExpanding || story.expandedScript) && (
            <div className="mt-12 bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg p-6 animate-fade-in">
                <h3 className="text-xl font-bold text-blue-400">Your Generated Story</h3>
                {isExpanding ? (
                    <div className="flex justify-center items-center h-48">
                        <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="ml-4 text-gray-400">Generating your script...</p>
                    </div>
                ) : (
                    <>
                    <p className="mt-4 text-gray-300 whitespace-pre-wrap font-mono text-sm max-h-60 overflow-y-auto">{story.expandedScript}</p>
                    </>
                )}
            </div>
        )}

      <div className="mt-12 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <Button onClick={onBack} variant="secondary" className="w-full sm:w-auto">Back: World & Style</Button>
        <Button onClick={onNext} disabled={!canProceed || isExpanding} className="w-full sm:w-auto">
          Next: Preview & Trailer
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Button>
      </div>
      {!canProceed && <p className="text-right mt-2 text-sm text-yellow-400">Please select a template or generate a story to continue.</p>}
    </div>
  );
};

export default Step3Story;