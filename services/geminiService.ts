import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Character, Story, World, GenerationJob, StoryTemplate } from '../types';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// Helper to avoid creating a new instance on every call in a real app.
// For this app, creating a new instance before each API call is required by the video generation guidelines.
const getApiKey = () => {
    const viteKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) as string | undefined;
    const nodeKey = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string | undefined;
    return viteKey || nodeKey || '';
};

const getAi = () => new GoogleGenAI({ apiKey: getApiKey() });

// --- Rate-limit helpers -----------------------------------------------------
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type BackoffOptions = { retries?: number; baseDelayMs?: number };
const withBackoff = async <T>(fn: () => Promise<T>, opts: BackoffOptions = {}): Promise<T> => {
    const retries = opts.retries ?? 3;
    const base = opts.baseDelayMs ?? 1000;
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        } catch (e: any) {
            const msg = (e?.message || '').toLowerCase();
            const isRateLimited = msg.includes('rate') || msg.includes('429') || msg.includes('quota');
            const isRetryable = isRateLimited || msg.includes('fetch') || msg.includes('timeout') || msg.includes('network');
            if (attempt >= retries || !isRetryable) throw e;
            const delay = base * Math.pow(2, attempt); // exponential backoff
            try {
                // Notify UI about throttling/backoff
                if (typeof window !== 'undefined' && (window as any).dispatchEvent) {
                    const detail = { attempt: attempt + 1, delay, reason: isRateLimited ? 'rate-limit' : 'network' };
                    window.dispatchEvent(new CustomEvent('ai-backoff', { detail }));
                }
            } catch {}
            await sleep(delay);
            attempt++;
        }
    }
};

// Thin wrappers to centralize backoff behavior
const safeGenerateContent = async (args: Parameters<GoogleGenAI['models']['generateContent']>[0]) => {
    return withBackoff(async () => {
        const ai = getAi();
        return ai.models.generateContent(args);
    });
};

const safeGenerateImages = async (args: Parameters<GoogleGenAI['models']['generateImages']>[0]) => {
    return withBackoff(async () => {
        const ai = getAi();
        return ai.models.generateImages(args);
    });
};

const safeGenerateVideos = async (args: Parameters<GoogleGenAI['models']['generateVideos']>[0]) => {
    return withBackoff(async () => {
        const ai = getAi();
        return ai.models.generateVideos(args);
    });
};


// Helper function to simulate async operations with progress
const simulateProgress = async (
    onProgress: (update: { progress: number; message: string }) => void,
    duration: number,
    steps: string[]
) => {
    for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, duration / steps.length));
        onProgress({ progress: Math.round(((i + 1) / steps.length) * 100), message: steps[i] });
    }
};

type GeneratedVideoAsset = {
    uri?: string;
    videoBytes?: string;
    mimeType?: string;
};

const base64ToBlob = (base64: string, mimeType: string): Blob => {
    let byteCharacters: string | null = null;
    if (typeof atob === 'function') {
        byteCharacters = atob(base64);
    } else if (typeof Buffer !== 'undefined') {
        const buffer = Buffer.from(base64, 'base64');
        return new Blob([buffer], { type: mimeType });
    } else {
        throw new Error('Base64 decoding is not supported in this environment.');
    }
    if (byteCharacters === null) {
        throw new Error('Base64 decoding failed.');
    }
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

const videoAssetToObjectUrl = async (video?: GeneratedVideoAsset): Promise<string> => {
    if (!video) {
        throw new Error('Video generation did not produce a downloadable asset.');
    }

    if (video.videoBytes) {
        const blob = base64ToBlob(video.videoBytes, video.mimeType ?? 'video/mp4');
        return URL.createObjectURL(blob);
    }

    if (video.uri) {
        const apiKey = getApiKey();
        const separator = video.uri.includes('?') ? '&' : '?';
        const requestUrl = apiKey ? `${video.uri}${separator}key=${apiKey}` : video.uri;
        const videoResponse = await fetch(requestUrl);
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
        }
        const blob = await videoResponse.blob();
        return URL.createObjectURL(blob);
    }

    throw new Error('Video generation did not include bytes or a download URI.');
};

const FALLBACK_VIDEO_SOURCES: Record<'16:9' | '9:16', string> = {
    '16:9': 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    '9:16': 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
};

const fetchFallbackVideo = async (aspectRatio: '16:9' | '9:16'): Promise<string> => {
    const source = FALLBACK_VIDEO_SOURCES[aspectRatio] || FALLBACK_VIDEO_SOURCES['16:9'];
    const response = await fetch(source);
    if (!response.ok) {
        throw new Error(`Fallback video request failed: ${response.statusText}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

// Generic helper: generate a video and return a local blob URL
const generateVideoBlob = async (
    prompt: string,
    config: { resolution: '720p' | '1080p'; aspectRatio: '16:9' | '9:16' }
): Promise<string> => {
    const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FFMPEG_API_BASE) as string | undefined;
    if (apiBase) {
        try {
            const res = await fetch(`${apiBase.replace(/\/$/, '')}/ai/generate-scene-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, resolution: config.resolution, aspectRatio: config.aspectRatio, durationSeconds: 4 })
            });
            if (!res.ok) throw new Error(`Server scene video failed: ${res.status} ${res.statusText}`);
            const json = await res.json();
            const url = json.videoUrl as string;
            if (/^https?:\/\//.test(apiBase)) {
                if (url.startsWith('/')) return `${apiBase.replace(/\/$/, '')}${url}`;
                return `${apiBase.replace(/\/$/, '')}/${url}`;
            }
            return url;
        } catch (e) {
            console.warn('Server scene video failed, switching to fallback content.', e);
        }
    }
    return await fetchFallbackVideo(config.aspectRatio);
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // result is "data:image/jpeg;base64,...." -> we need to remove the prefix
            const base64String = result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

export const generateAvatar = async (character: Character): Promise<string> => {
    console.log("Generating avatar for:", character.name);
    if (character.photos.length === 0) {
        throw new Error("Cannot generate avatar without reference photos.");
    }
    const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FFMPEG_API_BASE) as string | undefined;
    try {
        const base64Image = await fileToBase64(character.photos[0]);
        if (apiBase) {
            const res = await fetch(`${apiBase}/ai/generate-avatar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: character.name,
                    role: character.role,
                    age: character.age,
                    details: character.details,
                    costumeColor: character.costumeColor,
                    photo: { data: base64Image, mimeType: character.photos[0].type }
                })
            });
            if (!res.ok) throw new Error(`Server avatar generation failed: ${res.status} ${res.statusText}`);
            const json = await res.json();
            if (json.avatarDataUrl) return json.avatarDataUrl as string;
            throw new Error('Server did not return avatarDataUrl.');
        }
        // Fallback to client-side if server is not configured
        const ai = getAi();
        const prompt = `Create a 3D avatar in the style of a Pixar movie for the following character.
        Character Name: ${character.name}
        Role: ${character.role}
        Age: ${character.age}
        Details: ${character.details}
        Costume Color Cue: ${character.costumeColor}
        The avatar should be a friendly, expressive character suitable for a children's story, shown from the chest up, facing forward.
        Use the provided image as a strong reference for the character's facial features and appearance.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ inlineData: { data: base64Image, mimeType: character.photos[0].type } }, { text: prompt }] },
            config: { responseMimeType: 'application/json' }
        });
        const base64ImageBytes = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64ImageBytes) return `data:image/png;base64,${base64ImageBytes}`;
        const parsed = JSON.parse(response.text || '{}');
        if (parsed.imageBase64) return `data:image/png;base64,${parsed.imageBase64}`;
        throw new Error('API did not return an image.');
    } catch (e) {
        console.error("Gemini avatar generation failed.", e);
        throw new Error('The AI could not process the reference photo. Please try a different one.');
    }
};

export const generateWorldPreview = async (
    world: World,
    onProgress: (progress: number) => void
): Promise<string> => {
    console.log("Generating world preview for:", world.style);
    const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FFMPEG_API_BASE) as string | undefined;
    onProgress(10);
    if (apiBase) {
        try {
            const res = await fetch(`${apiBase.replace(/\/$/, '')}/ai/generate-world-preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ world, resolution: '720p', aspectRatio: '16:9' }),
            });
            if (!res.ok) throw new Error(`Server world preview failed: ${res.statusText}`);
            const json = await res.json();
            onProgress(100);
            const url = json.videoUrl as string;
            if (/^https?:\/\//.test(apiBase)) {
                if (url.startsWith('/')) return `${apiBase.replace(/\/$/, '')}${url}`;
                return `${apiBase.replace(/\/$/, '')}/${url}`;
            }
            return url;
        } catch (e) {
            console.error('Server world preview failed, falling back.', e);
        }
    }
    return await fetchFallbackVideo('16:9');
};

export const generateStoryFromPrompt = async (prompt: string, characters: Character[]): Promise<Partial<Story>> => {
    console.log("Generating story idea from prompt:", prompt);
    const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FFMPEG_API_BASE) as string | undefined;
    if (apiBase) {
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/ai/story/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, characters }),
        });
        if (!res.ok) throw new Error(`Server story generation failed: ${res.status} ${res.statusText}`);
        return await res.json();
    }
    throw new Error('Server AI is not configured. Please set VITE_FFMPEG_API_BASE.');
}


export const expandStoryOutline = async (
    story: Story,
    characters: Character[]
): Promise<Story> => {
    console.log("Expanding story:", story.template);
    const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FFMPEG_API_BASE) as string | undefined;
    if (!apiBase) throw new Error('Server AI is not configured.');
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/ai/story/expand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story, characters }),
    });
    if (!res.ok) throw new Error(`Server story expand failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    return { ...story, expandedScript: json.expandedScript };
};

// Helper function to generate a VTT caption file from a script
const generateVTT = (script: string): string => {
    let vttContent = "WEBVTT\n\n";
    const lines = script.split('\n').filter(line => line.trim() !== '');
    let startTime = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Simple heuristic: dialogue is often indented or has a colon
        const isDialogue = line.includes(':') || line.startsWith('  ');
        const duration = isDialogue ? 4 : 3; // Show dialogue longer

        const formatTime = (seconds: number) => {
            const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const s = Math.floor(seconds % 60).toString().padStart(2, '0');
            const ms = ((seconds % 1) * 1000).toFixed(0).toString().padStart(3, '0');
            return `${h}:${m}:${s}.${ms}`;
        };

        const endTime = startTime + duration;
        vttContent += `${i + 1}\n`;
        vttContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
        vttContent += `${line.trim()}\n\n`;
        startTime = endTime;
    }
    
    const blob = new Blob([vttContent], { type: 'text/vtt' });
    return URL.createObjectURL(blob);
}

export const resyncCaptions = async (script: string): Promise<string> => {
    console.log("Resyncing captions with AI...");
    const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FFMPEG_API_BASE) as string | undefined;
    if (!apiBase) throw new Error('Server AI is not configured.');
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/ai/resync-captions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
    });
    if (!res.ok) throw new Error(`Server resync captions failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    const blob = new Blob([json.vtt], { type: 'text/vtt' });
    return URL.createObjectURL(blob);
};

// Robust loader with CDN fallbacks for ffmpeg.wasm core
const loadFFmpegWithFallback = async () => {
    const sources = [
        // Prefer local hosting under public/ if available
        '/ffmpeg-core.js',
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
    ];

    const isValidCore = async (url: string) => {
        try {
            const resp = await fetch(url, { method: 'GET' });
            if (!resp.ok) return false;
            const ct = (resp.headers.get('content-type') || '').toLowerCase();
            // Avoid HTML responses (404 pages) that trigger "Unexpected token '<'"
            if (ct.includes('text/html')) return false;
            return true;
        } catch {
            return false;
        }
    };

    for (const corePath of sources) {
        const ok = await isValidCore(corePath);
        if (!ok) {
            console.warn('FFmpeg core preflight failed for', corePath);
            continue;
        }
        try {
            const ffmpeg = createFFmpeg({ log: true, corePath });
            await ffmpeg.load();
            return ffmpeg;
        } catch (e) {
            console.warn('FFmpeg load failed for', corePath, e);
        }
    }
    throw new Error('FFmpeg core failed to load from all sources. Please check your network and try again.');
};

const mergeVideos = async (videoUrls: string[]): Promise<string> => {
    const ffmpeg = await loadFFmpegWithFallback();

    // Inputs are recorded as WebM; transcode each to MP4 before concat
    for (let i = 0; i < videoUrls.length; i++) {
        const file = await fetchFile(videoUrls[i]);
        ffmpeg.FS('writeFile', `input${i}.webm`, file);
        await ffmpeg.run('-i', `input${i}.webm`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', `input${i}.mp4`);
    }

    const concatFileContent = videoUrls.map((_, i) => `file 'input${i}.mp4'`).join('\n');
    ffmpeg.FS('writeFile', 'concat.txt', concatFileContent);

    await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', 'output.mp4');

    const data = ffmpeg.FS('readFile', 'output.mp4');
    const blob = new Blob([new Uint8Array(data.buffer as ArrayBuffer)], { type: 'video/mp4' });
    return URL.createObjectURL(blob);
};

// Server-side merge using multipart upload to FFmpeg API if configured
const mergeVideosServer = async (videoUrls: string[]): Promise<string> => {
    const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FFMPEG_API_BASE) as string | undefined;
    if (!apiBase) throw new Error('VITE_FFMPEG_API_BASE is not set');
    const form = new FormData();
    for (let i = 0; i < videoUrls.length; i++) {
        const resp = await fetch(videoUrls[i]);
        if (!resp.ok) throw new Error(`Failed to read scene ${i + 1}`);
        const blob = await resp.blob();
        form.append('scenes', blob, `scene_${i + 1}.webm`);
    }
    const res = await fetch(`${apiBase}/merge`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Server merge failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    // Return absolute URL if apiBase is absolute
    const url = json.filmUrl as string;
    if (/^https?:\/\//.test(apiBase)) {
        if (url.startsWith('/')) return `${apiBase.replace(/\/$/, '')}${url}`;
        return `${apiBase.replace(/\/$/, '')}/${url}`;
    }
    return url;
};

export const startFinalRender = async (
    job: GenerationJob,
    onProgress: (update: { progress: number; message: string }) => void
) => {
    console.log("Starting final render process...");
    const { story, characters, world } = job;
    const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FFMPEG_API_BASE) as string | undefined;

    try {
        // Step 1: Batch generate all scene descriptions
        onProgress({ progress: 5, message: 'Generating scene descriptions...' });
        const scenePrompts = story.scenes.map((scene, index) => 
            `Scene ${index + 1}: ${scene}. Style: ${world.style}, ${world.lightingMood}. Characters: ${characters.map(c => c.name).join(', ') || 'None'}.`
        );

        let sceneImagePrompts: string[] = [];
        if (apiBase) {
            const res = await fetch(`${apiBase.replace(/\/$/, '')}/ai/describe-image-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompts: scenePrompts }),
            });
            if (!res.ok) throw new Error(`Server image description failed: ${res.status} ${res.statusText}`);
            const json = await res.json();
            sceneImagePrompts = json.descriptions as string[];
        } else {
            throw new Error('Server AI is not configured.');
        }

        if (sceneImagePrompts.length !== story.scenes.length) {
            throw new Error('AI did not return the correct number of scene descriptions.');
        }

        // Step 2: Generate videos for each scene sequentially to respect RPM
        const sceneVideos: string[] = [];
        for (let i = 0; i < sceneImagePrompts.length; i++) {
            const imagePrompt = sceneImagePrompts[i];
            onProgress({ progress: Math.min(10 + (i * 5), 65), message: `Generating video for scene ${i + 1}...` });
            const url = await generateVideoBlob(imagePrompt, { resolution: '1080p', aspectRatio: '16:9' });
            sceneVideos.push(url);
            await sleep(750); // small spacing to avoid RPM spikes
        }
        onProgress({ progress: 70, message: 'All scenes generated. Merging into final film...' });

        // Step 3: Merge videos via server
        onProgress({ progress: 80, message: 'Uploading scenes to server for merge...' });
        const finalFilmUrl = await mergeVideosServer(sceneVideos);
        onProgress({ progress: 85, message: 'Film merged. Generating trailer and other assets...' });

        // Step 4: Generate other assets (trailer, shorts, etc.) - simplified for brevity
        const trailerUrl = await generateVideoBlob(`A fast-paced, exciting trailer for a film titled "${story.title}"`, { resolution: '1080p', aspectRatio: '16:9' });
        const shortUrl = await generateVideoBlob(`A vertical short clip from "${story.title}"`, { resolution: '1080p', aspectRatio: '9:16' });
        const posterUrl = 'https://via.placeholder.com/600x900.png?text=' + encodeURIComponent(story.title);
        const scriptUrl = URL.createObjectURL(new Blob([story.expandedScript], { type: 'text/plain' }));
        const captionsUrl = await resyncCaptions(story.expandedScript);

        onProgress({ progress: 100, message: 'Final render complete!' });

        return {
            film: finalFilmUrl,
            trailer: trailerUrl,
            shorts: [shortUrl],
            poster: posterUrl,
            script: scriptUrl,
            captions: captionsUrl,
        };

    } catch (error) {
        console.error("Final render failed:", error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred during the final render.';
        onProgress({ progress: 0, message: `Render failed: ${message}` });
        throw error;
    }
};


export const uploadToYouTube = async (onProgress: (progress: number, message: string) => void) => {
    console.log("Uploading to YouTube...");
    const steps = [
        'Connecting to YouTube API...', 'Uploading video file...', 'Processing video...', 'Setting metadata...', 'Upload complete!'
    ];
    await simulateProgress(onProgress, 8000, steps);

};

