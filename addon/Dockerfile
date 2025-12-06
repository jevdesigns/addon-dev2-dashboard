# Use Alpine Linux with Node.js for building
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /build

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install so build works without a committed package-lock.json)
# We need devDependencies for the build step (vite, plugins), so install all deps.
RUN npm install

# Copy source files
COPY src ./src
COPY vite.addon.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index-addon.html ./

# Build the React app for production (add-on version)
RUN npm run build:addon

# Production stage - lightweight Nginx server
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built React app from builder stage
COPY --from=builder /build/dist /usr/share/nginx/html

# Create directory for runtime config
RUN mkdir -p /data

# Expose port for ingress
EXPOSE 8099

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8099/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
