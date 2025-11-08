FROM node:20-slim

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifest (lock is optional)
COPY package*.json ./
# Install production deps; fall back if lock file is absent
RUN npm ci --omit=dev || npm install --omit=dev

COPY server.js ./

EXPOSE 8080

CMD ["node", "server.js"]
