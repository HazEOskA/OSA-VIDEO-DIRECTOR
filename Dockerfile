FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    PORT=8080 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/runtime \
    FFMPEG_SKILL_ROOT=/app/node_modules/ffmpeg-skill \
    REMOTION_BROWSER_EXECUTABLE=/root/.cache/remotion/chrome-headless-shell/linux64/chrome-headless-shell

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    ffmpeg \
    fonts-dejavu-core \
    python3 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /app/outputs \
    && python3 scripts/runtime_health.py \
    && npx remotion browser ensure

EXPOSE 8080

HEALTHCHECK --interval=20s --timeout=10s --start-period=20s --retries=3 \
    CMD curl --fail --silent http://127.0.0.1:8080/api/runtime/health >/dev/null || exit 1

CMD ["node", "src/server.js"]
