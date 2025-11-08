Deployment (Hostinger VPS with Docker)

Overview
- Runs a Dockerized FFmpeg API at port 8080 and a static web app at port 3000.
- The frontend calls the API to merge scene clips server-side.
- Outputs are served under the API at `/videos/<file>.mp4`.

Prerequisites
- Docker and Docker Compose installed.
- A domain (optional) and firewall open for ports 3000 and 8080 (or proxy behind Nginx/Traefik).
- Set your Gemini API key: add `VITE_GEMINI_API_KEY` to `.env.local` for local dev, and use build args for Docker.

Environment
- Frontend uses `VITE_FFMPEG_API_BASE` at build time. In compose, it’s set to `http://ffmpeg-api:8080` for internal networking.
- If you need an external URL (TLS/domain), set `VITE_FFMPEG_API_BASE=https://api.example.com` and add a reverse proxy.

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

Notes
- For production TLS and a public domain, add an Nginx/Traefik reverse proxy.
- If you prefer object storage, modify `server/server.js` to upload final outputs to S3/R2 and return the CDN URL.
- Frontend build arg `VITE_FFMPEG_API_BASE` is set in compose to the internal service. For external deployments, change it to your public API URL and rebuild `web`.

Troubleshooting
- If the web app can’t reach the API, confirm the env is embedded: rebuild with the correct `VITE_FFMPEG_API_BASE`.
- Large inputs: adjust Multer limits in `server/server.js`.
- Performance: tweak ffmpeg presets (e.g., `-preset veryfast`) or enable GPU acceleration if available.
