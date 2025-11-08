import React, { useState } from 'react';
import { GenerationJob } from '../types';
import { STEPS } from '../constants';
import { TrashIcon, EditPencilIcon, DuplicateIcon, PlayIcon } from './icons';

interface GalleryItemProps {
  job: GenerationJob;
  onDelete: (jobId: string) => void;
  onEdit: (jobId: string) => void;
  onDuplicate: (jobId: string) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ job, onDelete, onEdit, onDuplicate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const posterUrl = job.finalUrls?.poster || job.story.storyboard[0]?.thumbnailUrl || 'https://placehold.co/1600x900/1a237e/f9fafb?text=StoryVerse';
    const videoUrl = job.finalUrls?.film || job.trailerUrl;
    const title = job.storyTitle || job.story.title || 'Untitled Story';

    const handleAction = (action: (id: string) => void, event: React.MouseEvent) => {
        event.stopPropagation();
        setIsMenuOpen(false);
        action(job.id);
    }
    
    const stepName = STEPS[job.currentStep] || 'Characters';
    
    return (
        <div className="bg-gray-800/70 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 group transition-all hover:shadow-xl hover:shadow-blue-900/20">
            <div className="relative aspect-video bg-black/30">
                {videoUrl ? (
                     <video 
                        src={videoUrl} 
                        poster={posterUrl}
                        controls 
                        className="w-full h-full object-cover"
                    ></video>
                ) : (
                    <>
                        <img src={posterUrl} alt={title} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button onClick={() => onEdit(job.id)} className="bg-black/50 p-4 rounded-full text-white hover:bg-blue-600 transition-colors">
                                <PlayIcon className="w-8 h-8"/>
                            </button>
                        </div>
                    </>
                )}
                 {job.isDraft && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                        DRAFT
                    </div>
                 )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-white truncate">{title}</h3>
                {job.isDraft && (
                    <p className="text-sm text-gray-400">Last saved at: Step {job.currentStep} - {stepName}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                     {job.isDraft ? (
                         <button onClick={() => onEdit(job.id)} className="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center">
                             <EditPencilIcon className="w-4 h-4 mr-2" /> Edit Draft
                         </button>
                     ) : (
                         <div className="flex gap-2">
                            <button onClick={() => onDuplicate(job.id)} className="text-sm text-gray-300 hover:text-white font-semibold flex items-center">
                                <DuplicateIcon className="w-4 h-4 mr-1" /> Duplicate
                            </button>
                             <button onClick={() => onEdit(job.id)} className="text-sm text-gray-300 hover:text-white font-semibold flex items-center">
                                <EditPencilIcon className="w-4 h-4 mr-1" /> Edit
                            </button>
                         </div>
                     )}
                     <button 
                        onClick={() => onDelete(job.id)}
                        className="p-2 rounded-full text-gray-400 hover:bg-red-500/80 hover:text-white transition-colors"
                        aria-label="Delete item"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GalleryItem;
