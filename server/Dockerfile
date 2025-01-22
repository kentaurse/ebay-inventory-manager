# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm ci
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# ヘルスチェック用
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 