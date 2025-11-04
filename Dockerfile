# Multi-stage Dockerfile for building and serving the app

# 1) Build stage: install deps and bundle assets
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the project and build
COPY . .
RUN npm run build

# 2) Runtime stage: serve static files with Nginx
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copy built artifacts and required static assets
COPY --from=build /app/index.html ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/assets ./src/assets
COPY --from=build /app/public ./ 2>/dev/null || true

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

