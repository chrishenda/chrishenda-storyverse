import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

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

app.get('/health', async (req, res) => {
  try {
    res.json({ status: 'ok', uploads: UPLOADS_DIR, outputs: OUTPUTS_DIR });
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

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`FFmpeg API listening on :${port}`);
});
