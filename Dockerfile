# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN echo ">>> VITE_API_URL from .env:" && grep VITE_API_URL .env || echo "No .env found" && npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4016
CMD ["nginx", "-g", "daemon off;"]
