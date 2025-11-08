import React, { useState, useMemo } from 'react';
import { GenerationJob } from '../types';
import Button from './Button';
import Modal from './Modal';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import GalleryItem from './GalleryItem';

interface GalleryPageProps {
  jobs: GenerationJob[];
  onDeleteJob: (jobId: string) => void;
  onEditJob: (jobId: string) => void;
  onDuplicateJob: (jobId: string) => void;
  onBackToDashboard: () => void;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ jobs, onDeleteJob, onEditJob, onDuplicateJob, onBackToDashboard }) => {
  const [jobToDelete, setJobToDelete] = useState<GenerationJob | null>(null);

  const confirmDelete = () => {
    if (jobToDelete) {
      onDeleteJob(jobToDelete.id);
      setJobToDelete(null);
    }
  };

  const { drafts, completedJobs } = useMemo(() => {
    const drafts: GenerationJob[] = [];
    const completedJobs: GenerationJob[] = [];
    jobs.forEach(job => {
      if (job.isDraft) {
        drafts.push(job);
      } else {
        completedJobs.push(job);
      }
    });
    return { drafts, completedJobs };
  }, [jobs]);

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <Button onClick={onBackToDashboard} variant="secondary" size="sm">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Dashboard
            </Button>
        </div>

        <h1 className="text-4xl font-bold mb-2">My StoryVerse Gallery</h1>
        <p className="text-gray-400 mb-8">All of your amazing creations in one place.</p>
        
        {jobs.length === 0 ? (
             <div className="text-center py-24 px-6 bg-gray-800/60 backdrop-blur-md border-2 border-dashed border-gray-700 rounded-lg">
                <h2 className="text-2xl font-semibold text-white">Your Gallery is Empty</h2>
                <p className="mt-2 text-gray-400">It looks like you haven't created any stories yet. Start your first creation from the dashboard!</p>
            </div>
        ) : (
          <div className="space-y-12">
            {drafts.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Drafts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {drafts.map((job) => (
                    <GalleryItem 
                      key={job.id} 
                      job={job} 
                      onDelete={() => setJobToDelete(job)} 
                      onEdit={onEditJob} 
                      onDuplicate={onDuplicateJob} 
                    />
                  ))}
                </div>
              </div>
            )}

            {completedJobs.length > 0 && (
               <div>
                <h2 className="text-2xl font-semibold mb-6">Completed Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {completedJobs.map((job) => (
                     <GalleryItem 
                      key={job.id} 
                      job={job} 
                      onDelete={() => setJobToDelete(job)} 
                      onEdit={onDuplicateJob} // Edit on completed job is same as duplicate
                      onDuplicate={onDuplicateJob} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        title="Confirm Deletion"
      >
        <p className="text-gray-300 text-center">
          Are you sure you want to permanently delete "{jobToDelete?.storyTitle || 'this item'}"? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-center space-x-3">
          <Button variant="secondary" onClick={() => setJobToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </>
  );
};

export default GalleryPage;