# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# API URL nhúng vào build để FE gọi đúng BE (từ trình duyệt gọi tới host)
ARG VITE_API_URL=http://localhost:8081
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# --- Production stage ---
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
