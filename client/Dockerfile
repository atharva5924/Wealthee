# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY vite.config.js ./
COPY .env ./
RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist ./

# Default nginx config serves all routes
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
