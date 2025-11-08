Deployment (Hostinger VPS with Docker)

Overview
- Runs a Dockerized FFmpeg API at port 8080 and a static web app at port 3000.
- The frontend calls the API to merge scene clips server-side.
- Outputs are served under the API at `/videos/<file>.mp4`.

Prerequisites
- Docker and Docker Compose installed.
- A domain (optional) and firewall open for ports 3000 and 8080 (or proxy behind Nginx/Traefik).
- Set your Gemini API key securely on the server container using `.env` (do NOT embed it into the frontend).

Environment
- Frontend uses `VITE_FFMPEG_API_BASE` at build time. In compose, it’s set to `/` and the web Nginx proxies `/ai`, `/merge`, `/videos`, `/health` to the API container.
- For external deployments (TLS/domain), you may set `VITE_FFMPEG_API_BASE=https://api.example.com` and configure the reverse proxy accordingly.

Commands
1) Build and start services
```
docker compose build
docker compose up -d
```

2) Check status
```
docker compose ps
curl http://<your-host>:8080/health
open http://<your-host>:3000/
```

3) Logs
```
docker compose logs -f ffmpeg-api
docker compose logs -f web
```

4) Update
```
docker compose pull
docker compose build
docker compose up -d
```

Server API
- `POST /merge` (multipart/form-data)
  - Field: `scenes` (multiple files)
  - Returns: `{ filmUrl: "/videos/final_<id>.mp4" }`
- `GET /videos/<file>` serves outputs with range requests enabled.
- `GET /health` returns basic status.
 - `POST /ai/generate-avatar` returns `{ avatarDataUrl }` from server-side Gemini
 - `POST /ai/generate-world-preview` returns `{ videoUrl }` (image → short mp4 via ffmpeg)
 - `POST /ai/story/generate` returns story JSON
 - `POST /ai/story/expand` returns `{ expandedScript }`
 - `POST /ai/resync-captions` returns `{ vtt }`
 - `POST /ai/generate-scene-video` returns `{ videoUrl }`
 - `POST /ai/describe-image-batch` returns `{ descriptions: string[] }`

Notes
- For production TLS and a public domain, add an Nginx/Traefik reverse proxy.
- If you prefer object storage, modify `server/server.js` to upload final outputs to S3/R2 and return the CDN URL.
- Frontend build arg `VITE_FFMPEG_API_BASE` is set in compose to the internal service. For external deployments, change it to your public API URL and rebuild `web`.

Setting your Gemini Key (Server-side only)
- Create a `.env` file in the project root with:
```
GEMINI_API_KEY=your-secret-key
```
- Start with compose (the key will be injected only into the API container):
```
docker compose build
docker compose up -d
```

Updating configuration
- Change `GEMINI_API_KEY` in `.env` and restart the API service:
```
docker compose up -d --build ffmpeg-api
```
- Change API base for web by rebuilding with:
```
docker compose build --build-arg VITE_FFMPEG_API_BASE=https://api.example.com web
docker compose up -d web
```

Troubleshooting
- If the web app can’t reach the API, confirm the Nginx proxies are present in `web-nginx.conf` and `VITE_FFMPEG_API_BASE` is `/` in compose.
- Large inputs: adjust Multer limits in `server/server.js`.
- Performance: tweak ffmpeg presets (e.g., `-preset veryfast`) or enable GPU acceleration if available.
