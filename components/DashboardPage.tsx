import React from 'react';
import { User, GenerationJob } from '../types';
import Button from './Button';
import ProgressBar from './ProgressBar';
import { PlusIcon } from './icons/PlusIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { UsersIcon, GlobeIcon, BookOpenIcon, FilmIcon } from './icons';
import { PLAN_LIMITS } from '../constants';
import { AppView } from '../App';

interface DashboardPageProps {
  user: User;
  jobs: GenerationJob[];
  onStartCreation: () => void;
  onNavigateToGallery: () => void;
  onNavigate: (view: AppView) => void;
}

const GettingStarted: React.FC = () => (
    <div className="text-center py-12 px-6 bg-gray-800/60 backdrop-blur-md border-2 border-dashed border-gray-700 rounded-lg">
        <h3 className="text-2xl font-semibold text-white">Let's Create Your First Story!</h3>
        <p className="mt-2 text-gray-400">Follow these simple steps to bring your family's adventure to life.</p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            <div className="flex items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-blue-300" />
                </div>
                <div className="ml-4">
                    <h4 className="text-lg font-bold">1. Create Characters</h4>
                    <p className="mt-1 text-sm text-gray-400">Upload photos to create 3D avatars of your family.</p>
                </div>
            </div>
             <div className="flex items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <GlobeIcon className="h-6 w-6 text-blue-300" />
                </div>
                <div className="ml-4">
                    <h4 className="text-lg font-bold">2. Design World</h4>
                    <p className="mt-1 text-sm text-gray-400">Choose a style and setting for your story.</p>
                </div>
            </div>
             <div className="flex items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <BookOpenIcon className="h-6 w-6 text-blue-300" />
                </div>
                <div className="ml-4">
                    <h4 className="text-lg font-bold">3. Write Story</h4>
                    <p className="mt-1 text-sm text-gray-400">Select a template or create a custom adventure.</p>
                </div>
            </div>
             <div className="flex items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FilmIcon className="h-6 w-6 text-blue-300" />
                </div>
                <div className="ml-4">
                    <h4 className="text-lg font-bold">4. Render & Share</h4>
                    <p className="mt-1 text-sm text-gray-400">Generate your final 3D film and share it!</p>
                </div>
            </div>
        </div>
    </div>
)

const DashboardPage: React.FC<DashboardPageProps> = ({ user, jobs, onStartCreation, onNavigateToGallery, onNavigate }) => {
  const planDetails = PLAN_LIMITS[user.plan];
  const videosUsed = jobs.filter(j => !j.isDraft).length;
  const videoLimit = planDetails.videos;
  const usagePercentage = videoLimit === Infinity ? 0 : (videosUsed / videoLimit) * 100;
  const canCreate = videosUsed < videoLimit;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.email.split('@')[0]}!</h1>
          <p className="text-gray-400 mt-1">Ready to create a new magical story?</p>
        </div>
        <Button onClick={onStartCreation} size="lg" disabled={!canCreate} className="flex-shrink-0 w-full sm:w-auto">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New StoryVerse
        </Button>
      </div>

      <div className="bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1">
                <h2 className="text-xl font-bold">Your {planDetails.label} Plan</h2>
                <p className="text-gray-400 mt-1">
                {videoLimit === Infinity
                    ? 'You have unlimited video exports.'
                    : `You've used ${videosUsed} of ${videoLimit} completed video exports this month.`
                }
                </p>
                {!canCreate && <p className="text-sm mt-2 text-yellow-400">You've reached your monthly limit.</p>}
            </div>
            {videoLimit !== Infinity && (
                <div className="w-full sm:w-1/3">
                    <ProgressBar progress={usagePercentage} />
                </div>
            )}
            <Button variant="secondary" onClick={() => onNavigate('pricing')}>Upgrade Plan</Button>
        </div>
      </div>

        {jobs.length > 0 && (
          <div className="mb-8 bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold">Your creations await!</h2>
              <p className="text-gray-400 mt-2">You have {jobs.length} completed stories and drafts. Visit your gallery to view, download, and share them.</p>
              <Button onClick={onNavigateToGallery} size="lg" variant="secondary" className="mt-6">
                View My Gallery
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
          </div>
        )}

      <GettingStarted />
    </div>
  );
};

export default DashboardPage;