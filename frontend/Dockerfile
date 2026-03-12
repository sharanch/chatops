# ════════════════════════════════════════════
# Stage 1 — Dependency installation
# ════════════════════════════════════════════
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first (layer cache optimization)
COPY package.json package-lock.json* ./

# Install production + dev deps for build
RUN npm ci --frozen-lockfile

# ════════════════════════════════════════════
# Stage 2 — Build
# ════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for runtime env injection
ARG REACT_APP_SOCKET_URL=http://localhost:4000

ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

RUN npm run build

# ════════════════════════════════════════════
# Stage 3 — Production (Nginx)
# ════════════════════════════════════════════
FROM nginx:1.25-alpine AS production

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/chatops.conf

# Copy built static files
COPY --from=builder /app/build /usr/share/nginx/html

# Non-root: create nginx user dirs and fix perms
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
