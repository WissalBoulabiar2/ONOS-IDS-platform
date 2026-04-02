# Multi-stage build for Next.js frontend
# Stage 1: Dependencies
FROM node:18-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build Next.js application
RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine AS runtime

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Copy necessary files from previous stages
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js
CMD ["npm", "start"]
