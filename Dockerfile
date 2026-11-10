# Multi-stage Dockerfile for Maluki Viagens (TanStack Start / Node.js)
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* bun.lock* ./
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Build application with node-server preset
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built artifacts from builder stage
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

