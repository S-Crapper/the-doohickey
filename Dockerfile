FROM oven/bun:1-slim

WORKDIR /app

COPY package.json ./
RUN bun install --production

# Install ffmpeg for MP4 → animated WebP/GIF conversion
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY src/ ./src/
COPY tsconfig.json ./

ENV API_PORT=3210
EXPOSE 3210

CMD ["bun", "run", "src/index.ts"]
