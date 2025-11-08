import React, { useState, useEffect } from 'react';
import { Character, GenerationJob, JobStatus, Step, Story, StoryTemplate, User, VoiceStyle, World, WorldStyle, Plan } from './types';
import { STEPS, APP_NAME } from './constants';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import LandingPage from './components/LandingPage';
import DashboardPage from './components/DashboardPage';
import Step1Characters from './components/Step1_Characters';
import Step2World from './components/Step2_World';
import Step3Story from './components/Step3_Story';
import Step4Preview from './components/Step4_Preview';
import Step5FinalRender from './components/Step5_FinalRender';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import UserProfile from './components/UserProfile';
import PricingPage from './components/PricingPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import TermsPage from './components/TermsPage';
import GalleryPage from './components/GalleryPage';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Modal from './components/Modal';
import Button from './components/Button';

type AuthStatus = 'guest' | 'authenticating' | 'authenticated';
export type AppView = 'landing' | 'login' | 'signup' | 'dashboard' | 'creator' | 'profile' | 'pricing' | 'about' | 'contact' | 'terms' | 'gallery';

const createNewJob = (jobOverrides: Partial<GenerationJob> = {}): GenerationJob => {
  const newId = `job${Date.now()}`;
  return {
    id: newId,
    status: JobStatus.Idle,
    progress: 0,
    message: '',
    storyTitle: '',
    isDraft: true,
    currentStep: Step.Characters,
    characters: [{
      id: `char${Date.now()}`,
      name: '',
      role: 'Main Character',
      age: '',
      voiceStyle: VoiceStyle.ChildFemale,
      costumeColor: '#3b82f6',
      photos: [],
      photoPreviews: [],
      avatarUrl: '',
      details: '',
      isPet: false,
    }],
    world: {
      style: WorldStyle.Storybook3D,
      stylizationStrength: 60,
      backgroundSet: 'A cozy, sunlit living room with a big window.',
      timePeriod: 'Modern',
      season: 'Autumn',
      timeOfDay: 'Afternoon',
      lightingMood: 'Warm and inviting',
      props: [],
      previewUrl: '',
    },
    story: {
      template: StoryTemplate.Fort,
      title: '',
      synopsis: '',
      scenes: [''],
      location: '',
      ageGroup: '',
      timePeriod: 'Modern',
      expandedScript: '',
      storyboard: [],
      targetDuration: 3,
    },
    ccSettings: {
      fontSize: 22,
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      fontFamily: 'Arial',
    },
    ...jobOverrides
  };
};


const App: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('guest');
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('storyverse_jobs');
      if (saved) {
        const parsed: GenerationJob[] = JSON.parse(saved);
        setJobs(parsed);
      }
    } catch (e) {
      console.warn('Failed to load saved jobs from localStorage.', e);
    }
  }, []);

  // Persist jobs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('storyverse_jobs', JSON.stringify(jobs));
    } catch (e) {
      console.warn('Failed to save jobs to localStorage.', e);
    }
  }, [jobs]);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [navigationAttempt, setNavigationAttempt] = useState<AppView | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAuth = (email: string) => {
    setUser({ id: 'user1', email, profilePictureUrl: 'https://i.pravatar.cc/150?u=user1', youtubeConnected: false, plan: 'Free' });
    setAuthStatus('authenticated');
    setCurrentView('dashboard');
  };
  
  const handleLogout = () => {
    setUser(null);
    setAuthStatus('guest');
    setCurrentView('landing');
  };

  const updateActiveJob = (updates: Partial<GenerationJob> | ((job: GenerationJob) => GenerationJob)) => {
    setActiveJob(prev => {
        if (!prev) return null;
        const newJob = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
        // Also update it in the main jobs list
        setJobs(allJobs => allJobs.map(j => j.id === newJob.id ? newJob : j));
        return newJob;
    });
  };
  
  const handleStartCreation = () => {
    const newJob = createNewJob();
    setJobs(prev => [...prev, newJob]);
    setActiveJob(newJob);
    setCurrentView('creator');
  };

  const handleEditJob = (jobId: string) => {
    const jobToEdit = jobs.find(j => j.id === jobId);
    if (jobToEdit) {
      setActiveJob(jobToEdit);
      setCurrentView('creator');
    }
  };

  const handleDuplicateJob = (jobId: string) => {
    const jobToDuplicate = jobs.find(j => j.id === jobId);
    if (jobToDuplicate) {
      const newJob = createNewJob({
        ...jobToDuplicate,
        isDraft: true,
        status: JobStatus.Idle,
        trailerUrl: undefined,
        finalUrls: undefined,
        storyTitle: `${jobToDuplicate.storyTitle || 'Untitled'} (Copy)`,
      });
      setJobs(prev => [...prev, newJob]);
      setActiveJob(newJob);
      setCurrentView('creator');
      showToast('Story duplicated! You are now editing the copy.', 'success');
    }
  };
  
  const handleConfirmReset = () => {
    if (activeJob) {
        const freshJob = createNewJob({id: activeJob.id});
        updateActiveJob(freshJob);
    }
    setShowResetConfirm(false);
    showToast('Creation process has been reset.');
  };
  
  const handleSaveDraft = () => {
    if (activeJob) {
        // The draft is already being saved on every change, so we just need to navigate
        showToast('Draft saved!', 'success');
    }
    if (navigationAttempt) {
        setCurrentView(navigationAttempt);
    }
    setNavigationAttempt(null);
    setActiveJob(null);
  };

  const handleDiscardAndNavigate = () => {
     if (activeJob) {
        // If it was a pre-existing draft, keep it. If it's a brand new one, remove it.
        // Simplified: We assume user wants to keep the last saved state.
     }
     if (navigationAttempt) {
        setCurrentView(navigationAttempt);
     }
     setNavigationAttempt(null);
     setActiveJob(null);
  };
  
  const handleFinishCreation = (finishedJob: GenerationJob) => {
    updateActiveJob(finishedJob);
    setCurrentView('dashboard');
    setActiveJob(null);
    showToast('Your StoryVerse has been added to your gallery!', 'success');
  }

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    showToast('Video successfully deleted.', 'success');
  }

  const handleConnectYouTube = () => {
    if (user) {
        setUser(u => u ? { ...u, youtubeConnected: !u.youtubeConnected } : null);
        showToast(user.youtubeConnected ? 'YouTube account disconnected.' : 'YouTube account connected successfully!');
    }
  }

  const handleSelectPlan = (plan: Plan) => {
    if (user) {
        setUser(u => u ? { ...u, plan } : null);
        showToast(`You are now on the ${plan} plan!`);
        setCurrentView('dashboard');
    } else {
        navigate('signup');
    }
  }
  
  const navigate = (view: AppView) => {
      if (currentView === 'creator' && view !== 'creator') {
          setNavigationAttempt(view);
      } else {
          setCurrentView(view);
      }
  }

  const renderCreatorContent = () => {
    if (!activeJob) return null;
    switch (activeJob.currentStep) {
      case Step.Characters:
        return <Step1Characters characters={activeJob.characters} setCharacters={(chars) => updateActiveJob(j => ({ ...j, characters: typeof chars === 'function' ? chars(j.characters) : chars }))} onNext={() => updateActiveJob({ currentStep: Step.World })} showToast={showToast} />;
      case Step.World:
        return <Step2World world={activeJob.world} setWorld={(world) => updateActiveJob(j => ({ ...j, world: typeof world === 'function' ? world(j.world) : world }))} onBack={() => updateActiveJob({ currentStep: Step.Characters })} onNext={() => updateActiveJob({ currentStep: Step.Story })} showToast={showToast} />;
      case Step.Story:
        return <Step3Story story={activeJob.story} setStory={(story) => updateActiveJob(j => ({ ...j, story: typeof story === 'function' ? story(j.story) : story }))} characters={activeJob.characters} onBack={() => updateActiveJob({ currentStep: Step.World })} onNext={() => updateActiveJob({ currentStep: Step.Preview })} showToast={showToast} />;
      case Step.Preview:
        return <Step4Preview job={activeJob} setJob={updateActiveJob} onBack={() => updateActiveJob({ currentStep: Step.Story })} onNext={() => updateActiveJob({ currentStep: Step.FinalRender })} />;
      case Step.FinalRender:
        return <Step5FinalRender job={activeJob} setJob={(job) => updateActiveJob(typeof job === 'function' ? job(activeJob) : job)} story={activeJob.story} onBack={() => updateActiveJob({ currentStep: Step.Preview })} onFinish={handleFinishCreation} showToast={showToast} youtubeConnected={!!user?.youtubeConnected} />;
      default:
       return null;
    }
  }

  const renderContent = () => {
      switch (currentView) {
          case 'landing':
              return <LandingPage onStart={() => navigate('signup')} onNavigateToPricing={() => navigate('pricing')} />;
          case 'login':
              return <LoginPage onLogin={handleAuth} onSwitchToSignup={() => navigate('signup')} />;
          case 'signup':
              return <SignupPage onSignup={handleAuth} onSwitchToLogin={() => navigate('login')} />;
          case 'dashboard':
              return <DashboardPage user={user!} jobs={jobs} onStartCreation={handleStartCreation} onNavigateToGallery={() => navigate('gallery')} onNavigate={navigate}/>;
          case 'creator':
              return renderCreatorContent();
          case 'profile':
              return <UserProfile user={user!} onUpdateUser={setUser} onLogout={handleLogout} showToast={showToast} onConnectYouTube={handleConnectYouTube}/>;
          case 'pricing':
              return <PricingPage onSelectPlan={(plan) => handleSelectPlan(plan as Plan)} />;
          case 'about':
              return <AboutPage />;
          case 'contact':
              return <ContactPage />;
          case 'terms':
              return <TermsPage />;
          case 'gallery':
              return <GalleryPage jobs={jobs} onDeleteJob={handleDeleteJob} onEditJob={handleEditJob} onDuplicateJob={handleDuplicateJob} onBackToDashboard={() => navigate('dashboard')} />;
          default:
              return <LandingPage onStart={() => navigate('signup')} onNavigateToPricing={() => navigate('pricing')} />;
      }
  }

  return (
    <div className="flex flex-col min-h-screen">
      
      <div className="relative flex-grow font-sans text-white">
        <Header 
          appName={APP_NAME} 
          authStatus={authStatus} 
          user={user}
          onLogout={handleLogout} 
          onNavigate={navigate}
          isCreatorView={currentView === 'creator'}
          onResetCreation={() => setShowResetConfirm(true)}
        />
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {currentView === 'creator' && activeJob && <div className="mb-8"><StepIndicator currentStep={activeJob.currentStep - 1} stepNames={STEPS.slice(1)} /></div>}
          {renderContent()}
        </main>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {showResetConfirm && (
            <Modal
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                title="Confirm Start Over"
            >
                <p className="text-gray-300 text-center">Are you sure you want to start over? All your current progress on this draft will be lost.</p>
                <div className="mt-6 flex justify-center space-x-3">
                    <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmReset}>Start Over</Button>
                </div>
            </Modal>
        )}
        {navigationAttempt && (
            <Modal
                isOpen={!!navigationAttempt}
                onClose={() => setNavigationAttempt(null)}
                title="Unsaved Changes"
            >
                <p className="text-gray-300 text-center">You have unsaved changes. Would you like to save them as a draft before leaving?</p>
                <div className="mt-6 flex flex-col items-center sm:flex-row justify-center gap-3">
                    <Button variant="secondary" onClick={() => setNavigationAttempt(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDiscardAndNavigate}>Discard Changes</Button>
                    <Button variant="primary" onClick={handleSaveDraft}>Save as Draft</Button>
                </div>
            </Modal>
        )}
      </div>
      <Footer onNavigate={navigate} />
    </div>
  );
};

export default App;