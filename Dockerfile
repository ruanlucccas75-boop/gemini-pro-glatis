# Base image with Node.js 22 LTS
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build app
COPY . .
RUN npm run build

# Production runner image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled backend and frontend dist
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
