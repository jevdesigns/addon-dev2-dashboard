FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Ensure runtime has wget for healthchecks
RUN apk add --no-cache wget

# Copy prebuilt static app into nginx html root
COPY app /usr/share/nginx/html

# Create directory for runtime config
RUN mkdir -p /data

# Expose port for ingress
EXPOSE 8099

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8099/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
