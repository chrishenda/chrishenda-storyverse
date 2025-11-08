import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GenerationJob, JobStatus, Story, SubtitleSettings } from '../types';
import { startFinalRender, uploadToYouTube, resyncCaptions } from '../services/geminiService';
import Button from './Button';
import ProgressBar from './ProgressBar';
import ApiKeyHandler from './ApiKeyHandler';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShareIcon } from './icons/ShareIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { RefreshIcon } from './icons';

interface Step5FinalRenderProps {
  job: GenerationJob;
  setJob: React.Dispatch<React.SetStateAction<GenerationJob>>;
  story: Story;
  onBack: () => void;
  onFinish: (job: GenerationJob) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  youtubeConnected: boolean;
}

const DownloadItem: React.FC<{ href: string; label: string }> = ({ href, label }) => (
    <a href={href} download className="block bg-gray-700/80 hover:bg-gray-600/80 rounded-md p-3 transition-colors">
        <div className="flex items-center justify-between">
            <span className="font-medium text-gray-200">{label}</span>
            <DownloadIcon className="w-5 h-5 text-gray-400" />
        </div>
    </a>
);

const SubtitleSettingsEditor: React.FC<{
    settings: SubtitleSettings;
    onChange: (newSettings: SubtitleSettings) => void;
    onResync: () => void;
    isSyncing: boolean;
}> = ({ settings, onChange, onResync, isSyncing }) => {
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
            <Button 
                onClick={onResync} 
                isLoading={isSyncing} 
                variant="secondary" 
                className="w-full mt-6"
            >
                <RefreshIcon className="w-5 h-5 mr-2" />
                {isSyncing ? 'Syncing...' : 'AI Sync Story Timing'}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">Use AI to automatically adjust caption timing based on the story script.</p>
        </div>
    )
}


const Step5FinalRender: React.FC<Step5FinalRenderProps> = ({ job, setJob, story, onBack, onFinish, showToast, youtubeConnected }) => {
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ progress: 0, message: '' });
    const [isSyncing, setIsSyncing] = useState(false);
    const [throttleInfo, setThrottleInfo] = useState<{ attempt: number; delay: number; reason: string } | null>(null);

    const handleApiReady = useCallback(() => {
        setApiKeyReady(true);
    }, []);

    const handleFinalRender = useCallback(async (currentJob: GenerationJob) => {
        setJob(prev => ({ ...prev, status: JobStatus.InProgress, progress: 0, message: 'Preparing final render...' }));
        startFinalRender(currentJob, (update) => {
            setJob(prev => ({ ...prev, progress: update.progress, message: update.message }));
        }).then(finalUrls => {
            setJob(prev => ({ ...prev, status: JobStatus.Completed, finalUrls, trailerUrl: finalUrls.trailer }));
        }).catch(error => {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            setJob(prev => ({ ...prev, status: JobStatus.Failed, progress: 0, message }));
            showToast(`Final Render Failed: ${message}`, 'error');
        });
    }, [setJob, showToast]);

    const handleShare = async () => {
        const shareData = {
            title: 'My Chrishenda StoryVerse Film!',
            text: 'Check out the 3D animated movie I made with my family!',
            url: window.location.href,
        };
        try {
             if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                showToast('Share link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            await navigator.clipboard.writeText(shareData.url);
            showToast('Share link copied to clipboard!');
        }
    };
    
    const handleYouTubeUpload = async () => {
        setIsUploading(true);
        try {
            await uploadToYouTube(setUploadProgress);
            showToast('Successfully uploaded to YouTube!', 'success');
        } catch(error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            showToast(`YouTube Upload Failed: ${message}`, 'error');
        } finally {
            setIsUploading(false);
        }
    }
    
    const handleResyncCaptions = async () => {
        setIsSyncing(true);
        showToast('AI is adjusting your caption timings...');
        try {
            const newCaptionsUrl = await resyncCaptions(story.expandedScript);
            
            if (job.finalUrls?.captions) {
                URL.revokeObjectURL(job.finalUrls.captions);
            }

            setJob(prev => {
                if (!prev.finalUrls) return prev;
                return {
                    ...prev,
                    finalUrls: {
                        ...prev.finalUrls,
                        captions: newCaptionsUrl,
                    }
                }
            });

            showToast('Captions re-synced successfully!', 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            showToast(`Caption Sync Failed: ${message}`, 'error');
        } finally {
            setIsSyncing(false);
        }
    };


    const lastStartedJobIdRef = React.useRef<string | null>(null);
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as { attempt: number; delay: number; reason: string };
            setThrottleInfo(detail);
            const timeout = setTimeout(() => setThrottleInfo(null), detail.delay + 250);
            return () => clearTimeout(timeout);
        };
        window.addEventListener('ai-backoff', handler as EventListener);
        return () => window.removeEventListener('ai-backoff', handler as EventListener);
    }, []);
    useEffect(() => {
        if (!apiKeyReady) return;
        const canStart = job.status !== JobStatus.InProgress && !job.finalUrls;
        const notStartedYet = lastStartedJobIdRef.current !== job.id;
        if (canStart && notStartedYet) {
            lastStartedJobIdRef.current = job.id;
            startFinalRender(job, (update) => {
                setJob(prev => ({ ...prev, progress: update.progress, message: update.message }));
            }).then(finalUrls => {
                setJob(prev => ({ ...prev, status: JobStatus.Completed, finalUrls, trailerUrl: finalUrls.trailer }));
            }).catch(error => {
                const message = error instanceof Error ? error.message : 'An unknown error occurred.';
                setJob(prev => ({ ...prev, status: JobStatus.Failed, progress: 0, message }));
                showToast(`Final Render Failed: ${message}`, 'error');
            });
        }
    }, [apiKeyReady, job.id, job.status, job.finalUrls, setJob, showToast]);

    const ccStyle = useMemo(() => {
        if (!job.ccSettings) return '';
        const { fontSize, color, backgroundColor, fontFamily } = job.ccSettings;
        return `
            :root {
                --cc-font-family: '${fontFamily}', sans-serif;
                --cc-font-size: ${fontSize}px;
                --cc-color: ${color};
                --cc-bg-color: ${backgroundColor};
            }
        `;
    }, [job.ccSettings]);


  return (
    <div className="max-w-7xl mx-auto">
      <style>{ccStyle}</style>
      <h2 className="text-3xl font-bold text-center">Final Render & Download</h2>
      <p className="mt-2 text-center text-gray-400">
        {job.status !== JobStatus.Completed 
            ? "We're creating the high-resolution version of your film. This can take several minutes."
            : "Your StoryVerse is complete! Download your personalized animated film and share it with your family."
        }
      </p>
      
      <div className="mt-8">
        <ApiKeyHandler onReady={handleApiReady}>
             {(job.status === JobStatus.InProgress || job.status === JobStatus.Failed) && (
                <div className="bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg p-8 text-center">
                    <h3 className="text-xl font-bold">{job.status === JobStatus.Failed ? 'Render Failed' : 'Rendering Your Film...'}</h3>
                    <p className="mt-2 text-gray-400">{job.message}</p>
                    {job.status === JobStatus.InProgress && <ProgressBar progress={job.progress} className="mt-4" />}
                    {throttleInfo && (
                        <p className="mt-2 text-yellow-300 text-sm">
                            AI is throttling requests (retry in {Math.ceil(throttleInfo.delay / 1000)}s, attempt {throttleInfo.attempt}).
                        </p>
                    )}
                    {job.status === JobStatus.Failed && (
                        <Button onClick={() => handleFinalRender(job)} className="mt-4">Retry Render</Button>
                    )}
                </div>
            )}
            
            {job.status === JobStatus.Completed && job.finalUrls && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="aspect-video w-full bg-black/30 border border-white/10 rounded-lg overflow-hidden">
                            <video key={job.finalUrls.captions} src={job.finalUrls.film} poster={job.finalUrls.poster} controls className="w-full h-full object-cover">
                                <track default kind="subtitles" src={job.finalUrls.captions} srcLang="en" />
                            </video>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button onClick={handleShare} variant="secondary" className="w-full">
                                <ShareIcon className="w-5 h-5 mr-2"/>
                                Share Story
                            </Button>
                            <Button onClick={handleYouTubeUpload} isLoading={isUploading} disabled={!youtubeConnected || isUploading} variant="secondary" className="w-full">
                                <YouTubeIcon className="w-5 h-5 mr-2"/>
                                {isUploading ? `${uploadProgress.message} (${uploadProgress.progress}%)` : 'Upload to YouTube'}
                            </Button>
                        </div>
                        {!youtubeConnected && <p className="text-xs text-center text-gray-400">Connect your YouTube account in your profile to enable uploads.</p>}
                    </div>
                    <div className="lg:col-span-1 space-y-4">
                        <SubtitleSettingsEditor 
                            settings={job.ccSettings!} 
                            onChange={(newSettings) => setJob(j => ({ ...j, ccSettings: newSettings }))}
                            onResync={handleResyncCaptions}
                            isSyncing={isSyncing}
                        />
                        <div className="bg-gray-800/70 backdrop-blur-md p-6 rounded-lg border border-white/10">
                            <h3 className="text-lg font-bold">Your Export Pack</h3>
                            <div className="mt-4 space-y-3">
                                <DownloadItem href={job.finalUrls.film} label="Full Film (1080p).mp4" />
                                <DownloadItem href={job.finalUrls.trailer} label="Trailer.mp4" />
                                <DownloadItem href={job.finalUrls.shorts[0]} label="Vertical Shorts.zip" />
                                <DownloadItem href={job.finalUrls.captions} label="Subtitles (VTT).vtt" />
                                <DownloadItem href={job.finalUrls.poster} label="Movie Poster.jpg" />
                                <DownloadItem href={job.finalUrls.script} label="Story Script.pdf" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ApiKeyHandler>
      </div>

      <div className="mt-12 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <Button onClick={onBack} variant="secondary" disabled={job.status === JobStatus.InProgress} className="w-full sm:w-auto">Back: Preview</Button>
        <Button onClick={() => onFinish(job)} variant="primary" className="w-full sm:w-auto" disabled={job.status !== JobStatus.Completed}>
          Finish & View in Gallery
        </Button>
      </div>
    </div>
  );
};

export default Step5FinalRender;
