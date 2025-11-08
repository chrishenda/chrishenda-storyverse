import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { GoogleGenAI, Type, Modality } from '@google/genai';

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = process.env.DATA_DIR || '/data';
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const OUTPUTS_DIR = path.join(DATA_DIR, 'outputs');

await fs.mkdir(UPLOADS_DIR, { recursive: true });
await fs.mkdir(OUTPUTS_DIR, { recursive: true });

// Serve outputs statically
app.use('/videos', express.static(OUTPUTS_DIR, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Multer for scenes[] files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } }); // 200MB per file

const runFFmpeg = (args) => new Promise((resolve, reject) => {
  const p = spawn('ffmpeg', ['-y', ...args]);
  let stderr = '';
  p.stderr.on('data', d => { stderr += d.toString(); });
  p.on('close', code => {
    if (code === 0) resolve({ code });
    else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
  });
});

// Gemini setup (server-side key, not exposed to client)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const getAi = () => new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const requireKey = (res) => {
  if (!GEMINI_API_KEY) {
    res.status(400).json({ error: 'Server GEMINI_API_KEY is not configured.' });
    return false;
  }
  return true;
};
const fetchAiAsset = async (uri) => {
  const sep = uri.includes('?') ? '&' : '?';
  const url = `${uri}${sep}key=${GEMINI_API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Asset fetch failed: ${resp.status} ${resp.statusText}`);
  return resp;
};

app.get('/health', async (req, res) => {
  try {
    res.json({ status: 'ok', uploads: UPLOADS_DIR, outputs: OUTPUTS_DIR, geminiKeyPresent: !!GEMINI_API_KEY });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /merge : multipart form-data with fields: scenes (array of files)
app.post('/merge', upload.array('scenes', 50), async (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No scene files uploaded (field name: scenes)' });
  const jobId = nanoid(8);
  const jobDir = path.join(UPLOADS_DIR, jobId);
  await fs.mkdir(jobDir, { recursive: true });
  const mp4s = [];
  try {
    // Transcode each input to MP4 H.264 for reliable concat
    for (let i = 0; i < files.length; i++) {
      const input = files[i].path;
      const out = path.join(jobDir, `scene_${i}.mp4`);
      await runFFmpeg(['-i', input, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', out]);
      mp4s.push(out);
    }

    // Write concat.txt
    const concatTxt = mp4s.map(p => `file '${p.replace(/'/g, "'\''")}'`).join('\n');
    const concatPath = path.join(jobDir, 'concat.txt');
    await fs.writeFile(concatPath, concatTxt, 'utf8');

    // Concat to final
    const finalName = `final_${jobId}.mp4`;
    const finalPath = path.join(OUTPUTS_DIR, finalName);
    await runFFmpeg(['-f', 'concat', '-safe', '0', '-i', concatPath, '-c', 'copy', finalPath]);

    const publicUrl = `/videos/${finalName}`;
    res.json({ filmUrl: publicUrl });
  } catch (e) {
    console.error('Merge failed:', e);
    res.status(500).json({ error: e.message });
  }
});

// --- AI endpoints (server-side Gemini calls) -------------------------------

// Generate avatar from a reference photo and character details
app.post('/ai/generate-avatar', express.json({ limit: '25mb' }), async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { name, role, age, details, costumeColor, photo } = req.body || {};
    if (!photo?.data || !photo?.mimeType) {
      return res.status(400).json({ error: 'photo.data and photo.mimeType are required.' });
    }
    const ai = getAi();
    const prompt = `Create a 3D avatar in the style of a Pixar movie for the following character.
Character Name: ${name}
Role: ${role}
Age: ${age}
Details: ${details}
Costume Color Cue: ${costumeColor}
The avatar should be a friendly, expressive character suitable for a children's story, shown from the chest up, facing forward.
Use the provided image as a strong reference for the character's facial features and appearance.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: photo.data, mimeType: photo.mimeType } },
          { text: prompt },
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: { imageBase64: { type: Type.STRING } },
          required: ['imageBase64']
        }
      }
    });

    // Some versions return image bytes in candidates; fall back to schema parsing if provided
    const inlineBytes = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (inlineBytes) {
      return res.json({ avatarDataUrl: `data:image/png;base64,${inlineBytes}` });
    }
    const parsed = JSON.parse(response.text || '{}');
    if (parsed.imageBase64) {
      return res.json({ avatarDataUrl: `data:image/png;base64,${parsed.imageBase64}` });
    }
    return res.status(500).json({ error: 'AI did not return image data.' });
  } catch (e) {
    console.error('generate-avatar failed', e);
    res.status(500).json({ error: e.message || 'Avatar generation failed.' });
  }
});

// Generate a short world preview video (image -> 5s looped mp4)
app.post('/ai/generate-world-preview', express.json({ limit: '1mb' }), async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { world, resolution = '720p', aspectRatio = '16:9' } = req.body || {};
    const ai = getAi();
    const prompt = `Create a scenic, looping background image for an animated film.
Style: ${world?.style}
Setting: ${world?.backgroundSet}
Time and Season: ${world?.timeOfDay}
Lighting and Mood: ${world?.lightingMood}
The image should be cinematic and suitable for a Pixar-style animated film.`;

    const imageResponse = await ai.models.generateImages({
      model: 'gemini-2.5-flash-image',
      prompt,
      config: { numberOfImages: 1, aspectRatio }
    });
    const img0 = imageResponse.generatedImages?.[0];
    const imageUrl = (img0)?.image?.url || (img0)?.uri;
    if (!imageUrl) throw new Error('No image URL returned by model');
    const imgResp = await fetchAiAsset(imageUrl);
    const imgArray = await imgResp.arrayBuffer();
    const jobId = nanoid(8);
    const jobDir = path.join(UPLOADS_DIR, `world_${jobId}`);
    await fs.mkdir(jobDir, { recursive: true });
    const imagePath = path.join(jobDir, 'preview.jpg');
    await fs.writeFile(imagePath, Buffer.from(imgArray));

    const finalName = `world_preview_${jobId}.mp4`;
    const finalPath = path.join(OUTPUTS_DIR, finalName);
    const size = resolution === '1080p' ? ['1920', '1080'] : ['1280', '720'];
    await runFFmpeg(['-loop', '1', '-i', imagePath, '-vf', `scale=${size[0]}:${size[1]}`, '-c:v', 'libx264', '-t', '5', '-pix_fmt', 'yuv420p', '-r', '30', finalPath]);
    return res.json({ videoUrl: `/videos/${finalName}` });
  } catch (e) {
    console.error('generate-world-preview failed', e);
    res.status(500).json({ error: e.message || 'World preview generation failed.' });
  }
});

// Story generation from prompt and characters
app.post('/ai/story/generate', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { prompt, characters } = req.body || {};
    const ai = getAi();
    const characterDescriptions = (characters || []).map(c => `- ${c.name} (${c.role})`).join('\n');
    const fullPrompt = `You are a creative writer for children's stories. Based on the following simple prompt and character list, generate a complete story concept.\n\nPrompt: "${prompt}"\n\nCharacters available:\n${characterDescriptions}\n\nYour response must be a JSON object with the following fields: "title" (string), "synopsis" (a 2-3 sentence summary), "ageGroup" (e.g., "4-7 years"), "location" (string), and "scenes" (an array of 3-5 descriptive strings for key story beats).`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            synopsis: { type: Type.STRING },
            ageGroup: { type: Type.STRING },
            location: { type: Type.STRING },
            scenes: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['title', 'synopsis', 'ageGroup', 'location', 'scenes']
        }
      }
    });
    const parsed = JSON.parse(response.text);
    res.json(parsed);
  } catch (e) {
    console.error('story/generate failed', e);
    res.status(500).json({ error: e.message || 'Story generation failed.' });
  }
});

// Expand story outline into script
app.post('/ai/story/expand', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { story, characters } = req.body || {};
    const ai = getAi();
    const characterDescriptions = (characters || []).map(c => `- ${c.name} (${c.role}, age ${c.age}): ${c.details}`).join('\n');
    const storyConceptPrompt = (story?.template === 'Custom' || story?.template === 'AIQuick')
      ? `Title: ${story.title}\nSynopsis: ${story.synopsis}\nTarget Age Group: ${story.ageGroup}\nLocation: ${story.location}\nTime Period: ${story.timePeriod}\nKey Scenes:\n${(story.scenes || []).map((scene, index) => `${index + 1}. ${scene}`).join('\n')}`
      : `Template: ${story?.template}`;
    const prompt = `You are a creative storyteller for children's animated films. \nExpand the following story concept into a short, 3-act script suitable for a ${story?.targetDuration}-minute animation.\nThe script should include character dialogue, actions, and scene descriptions.\n\nCharacters:\n${characterDescriptions}\n\nStory Concept:\n${storyConceptPrompt}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: { expandedScript: { type: Type.STRING } },
          required: ['expandedScript']
        }
      }
    });
    const parsed = JSON.parse(response.text);
    res.json({ expandedScript: parsed.expandedScript });
  } catch (e) {
    console.error('story/expand failed', e);
    res.status(500).json({ error: e.message || 'Story expansion failed.' });
  }
});

// Resync captions: return raw VTT content
app.post('/ai/resync-captions', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { script } = req.body || {};
    const ai = getAi();
    const prompt = `You are a video production assistant specializing in subtitles.\nYour task is to analyze the following script for a short animated film and generate a perfectly timed WebVTT subtitle file.\nThe total duration of the film is approximately 3 minutes.\nPace the subtitles naturally, allowing for pauses in dialogue and giving enough time for scene descriptions to be read.\nEach cue should correspond to a line or a small group of related lines from the script.\n\nThe output must ONLY be the raw VTT content, starting with "WEBVTT". Do not include any explanations, markdown, or anything else.\n\nScript:\n---\n${script}\n---`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    const vttContent = response.text.trim();
    if (!vttContent.startsWith('WEBVTT')) throw new Error('Generated content is not a valid VTT file.');
    res.json({ vtt: vttContent });
  } catch (e) {
    console.error('resync-captions failed', e);
    res.status(500).json({ error: e.message || 'Resync captions failed.' });
  }
});

// Generate a simple scene video from an image prompt
app.post('/ai/generate-scene-video', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { prompt, resolution = '1080p', aspectRatio = '16:9', durationSeconds = 4 } = req.body || {};
    const ai = getAi();
    const imageResponse = await ai.models.generateImages({
      model: 'gemini-2.5-flash-image',
      prompt,
      config: { numberOfImages: 1, aspectRatio }
    });
    const img0 = imageResponse.generatedImages?.[0];
    const imageUrl = (img0)?.image?.url || (img0)?.uri;
    if (!imageUrl) throw new Error('No image URL returned by model');
    const imgResp = await fetchAiAsset(imageUrl);
    const imgArray = await imgResp.arrayBuffer();
    const jobId = nanoid(8);
    const jobDir = path.join(UPLOADS_DIR, `scene_${jobId}`);
    await fs.mkdir(jobDir, { recursive: true });
    const imagePath = path.join(jobDir, 'scene.jpg');
    await fs.writeFile(imagePath, Buffer.from(imgArray));
    const finalName = `scene_${jobId}.mp4`;
    const finalPath = path.join(OUTPUTS_DIR, finalName);
    const size = resolution === '1080p' ? ['1920', '1080'] : ['1280', '720'];
    await runFFmpeg(['-loop', '1', '-i', imagePath, '-vf', `scale=${size[0]}:${size[1]}`, '-c:v', 'libx264', '-t', `${durationSeconds}`, '-pix_fmt', 'yuv420p', '-r', '30', finalPath]);
    return res.json({ videoUrl: `/videos/${finalName}` });
  } catch (e) {
    console.error('generate-scene-video failed', e);
    res.status(500).json({ error: e.message || 'Scene video generation failed.' });
  }
});

// Batch describe images from prompts
app.post('/ai/describe-image-batch', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { prompts } = req.body || {};
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following scene prompts, create a detailed, visually rich description for a single, static image for EACH scene. The images should be cinematic and suitable for a Pixar-style animated film. Do not describe actions, only the scene itself. Return a JSON array of strings, where each string is a description for one scene.\n\nPrompts:\n${JSON.stringify(prompts)}`,
      config: { responseMimeType: 'application/json' }
    });
    const descriptions = JSON.parse(response.text);
    res.json({ descriptions });
  } catch (e) {
    console.error('describe-image-batch failed', e);
    res.status(500).json({ error: e.message || 'Image description generation failed.' });
  }
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`FFmpeg API listening on :${port}`);
});
