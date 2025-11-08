import React from 'react';
import { GenerationJob, SubtitleSettings } from '../types';
import Button from './Button';

interface Step4PreviewProps {
  job: GenerationJob;
  setJob: React.Dispatch<React.SetStateAction<GenerationJob>>;
  onBack: () => void;
  onNext: () => void;
}

const SubtitleSettingsEditor: React.FC<{
    settings: SubtitleSettings;
    onChange: (newSettings: SubtitleSettings) => void;
}> = ({ settings, onChange }) => {
    const FONT_FACES = ['Arial', 'Verdana', 'Georgia', 'Courier New', 'Comic Sans MS'];
    
    return (
        <div className="bg-gray-800/70 backdrop-blur-md p-6 rounded-lg border border-white/10">
            <h3 className="text-lg font-bold">Subtitle Settings</h3>
            <div className="mt-4 space-y-4">
                <div>
                    <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-300">Font</label>
                    <select id="fontFamily" value={settings.fontFamily} onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })} className="mt-1 w-full bg-gray-700/80 border-gray-600/80 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                        {FONT_FACES.map(font => <option key={font} value={font}>{font}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="fontSize" className="block text-sm font-medium text-gray-300">Font Size: {settings.fontSize}px</label>
                    <input id="fontSize" type="range" min="14" max="36" value={settings.fontSize} onChange={(e) => onChange({ ...settings, fontSize: parseInt(e.target.value, 10) })} className="w-full h-2 bg-gray-700/80 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
                </div>
                <div className="flex justify-between gap-4">
                    <div className="flex-1">
                        <label htmlFor="fontColor" className="block text-sm font-medium text-gray-300">Font Color</label>
                        <input id="fontColor" type="color" value={settings.color} onChange={(e) => onChange({ ...settings, color: e.target.value })} className="mt-1 w-full h-10 rounded border-none bg-transparent cursor-pointer" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="bgColor" className="block text-sm font-medium text-gray-300">Background</label>
                        <input id="bgColor" type="color" value={settings.backgroundColor} onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })} className="mt-1 w-full h-10 rounded border-none bg-transparent cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    )
}

const Step4_Preview: React.FC<Step4PreviewProps> = ({ job, setJob, onBack, onNext }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center">Preview & Closed Captions</h2>
      <p className="mt-2 text-center text-gray-400">
        Review your trailer and adjust the subtitle settings before the final render.
      </p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-video bg-black/30 border border-white/10 rounded-lg overflow-hidden">
          {job.trailerUrl && (
            <video src={job.trailerUrl} poster={job.finalUrls?.poster} controls className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <SubtitleSettingsEditor 
            settings={job.ccSettings!}
            onChange={(newSettings) => setJob(j => ({ ...j, ccSettings: newSettings }))}
          />
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <Button onClick={onBack} variant="secondary">Back: Story</Button>
        <Button onClick={onNext} variant="primary">Next: Final Render</Button>
      </div>
    </div>
  );
};

export default Step4_Preview;
