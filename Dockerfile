FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# Receive build arg and make it available to Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN echo ">>> VITE_API_URL: $VITE_API_URL" && bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4016
CMD ["nginx", "-g", "daemon off;"]