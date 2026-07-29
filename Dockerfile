# ===============================================
# Stage 1: Build static assets
# ===============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files for efficient caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application for production
RUN npm run build

# ===============================================
# Stage 2: Serve static files with Nginx
# ===============================================
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
