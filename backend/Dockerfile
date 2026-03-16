# ════════════════════════════════════════════
# Stage 1 — Dependencies
# ════════════════════════════════════════════
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile --omit=dev

# ════════════════════════════════════════════
# Stage 2 — Production image
# ════════════════════════════════════════════
FROM node:20-alpine AS production

# Security: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Patch system vulnerabilities
RUN apk update && apk upgrade tar && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy only prod node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY src/ ./src/
COPY package.json ./

# Fix ownership
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 4000

# Liveness: hit /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "src/server.js"]