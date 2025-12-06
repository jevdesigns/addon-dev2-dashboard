# Dev2 React Dashboard - Add-on Development Guide

## Overview

This directory contains the Home Assistant Add-on configuration for the Dev2 React Dashboard. The add-on allows users to run the React dashboard through Home Assistant's ingress system, providing seamless integration and automatic authentication.

## Directory Structure

```
addon/
├── config.json          # Add-on configuration and metadata
├── Dockerfile          # Multi-stage Docker build
├── nginx.conf          # Nginx web server configuration
├── build.sh            # Build script for Docker images
├── README.md           # User-facing documentation
├── CHANGELOG.md        # Version history
└── DOCS.md            # This file - developer documentation
```

## How It Works

### Build Process

1. **Stage 1 - Builder** (Node.js Alpine)
   - Installs npm dependencies
   - Copies source files
   - Builds React app using `vite.addon.config.js`
   - Outputs to `/build/dist`

2. **Stage 2 - Production** (Nginx Alpine)
   - Copies Nginx configuration
   - Copies built files from builder stage
   - Exposes port 8099 for ingress
   - Runs Nginx to serve the SPA

### Runtime Process

1. User installs add-on from HA Add-on Store
2. Home Assistant starts the Docker container
3. Nginx serves the React SPA on port 8099
4. HA ingress proxy forwards requests to the container
5. React app connects to HA WebSocket through ingress
6. Dashboard receives real-time state updates

### Ingress Integration

The add-on uses Home Assistant's ingress feature:

- **No authentication required**: Ingress handles auth automatically
- **Sidebar integration**: Appears as a tab in HA sidebar
- **Secure proxy**: All traffic goes through HA proxy
- **WebSocket support**: Real-time connection to HA API

## Development Workflow

### Local Development

1. Build the React app:
   ```bash
   npm run build:addon
   ```

2. Test the build locally:
   ```bash
   cd addon
   docker build -t dev2-react-dashboard-test ..
   docker run -p 8099:8099 dev2-react-dashboard-test
   ```

3. Access at `http://localhost:8099`

### Using the Deployment Script

```powershell
# Build and deploy to addon directory
npm run deploy:addon

# Force rebuild
.\scripts\deploy-addon.ps1 -ForceBuild

# Watch mode (auto-rebuild on changes)
.\scripts\deploy-addon.ps1 -Watch
```

### Testing in Home Assistant

1. Create a local add-on repository in HA
2. Copy the `addon` folder to `/addons/dev2-react-dashboard`
3. Reload add-on repositories
4. Install the add-on from the local repository
5. Start and test

## Configuration Options

### config.json

- **ingress**: Enables ingress support (required)
- **ingress_port**: Internal port for the web server
- **panel_icon**: Icon shown in HA sidebar
- **panel_title**: Title shown in HA sidebar
- **homeassistant_api**: Enables access to HA API

### User Options

Users can configure:
- **theme**: auto, light, or dark
- **log_level**: debug, info, warning, error

## Building for Production

### Multi-Architecture Builds

```bash
cd addon
chmod +x build.sh
./build.sh
```

This builds for all supported architectures:
- amd64 (x86_64)
- aarch64 (ARM 64-bit)
- armv7 (ARM 32-bit)
- armhf (ARM hard float)
- i386 (x86 32-bit)

### Publishing to Container Registry

```bash
# Tag images
docker tag dev2-react-dashboard ghcr.io/username/amd64-dev2-react-dashboard:1.0.0

# Push to registry
docker push ghcr.io/username/amd64-dev2-react-dashboard:1.0.0
```

## Deployment Automation

The existing deployment watcher system can be adapted for add-on development:

### Current System
- Watches `src/` for changes
- Auto-builds on file save
- Deploys to `Z:\www\lovelace-cards\`

### Add-on Adaptation
- Same file watching
- Builds for add-on instead
- Triggers Docker rebuild
- Optionally restarts add-on container

### Implementation

Update `deployment.config.json`:

```json
{
  "targets": {
    "addon": {
      "enabled": true,
      "buildCommand": "npm run build:addon",
      "deployCommand": "npm run deploy:addon",
      "dockerRebuild": true,
      "restartContainer": false
    }
  }
}
```

## Troubleshooting

### Build Issues

**Problem**: npm install fails
```bash
# Clear cache and retry
npm cache clean --force
npm ci
```

**Problem**: Vite build fails
```bash
# Check for syntax errors
npm run build:addon -- --debug
```

### Runtime Issues

**Problem**: Nginx won't start
```bash
# Test nginx config
docker run --rm nginx:alpine nginx -t -c /path/to/nginx.conf
```

**Problem**: Can't connect to HA WebSocket
- Check ingress is enabled in config.json
- Verify WebSocket URL construction in ingress-connection.js
- Check browser console for CORS errors

### Ingress Issues

**Problem**: 404 when accessing add-on
- Verify ingress_port matches Nginx listen port
- Check that index.html exists in /usr/share/nginx/html

**Problem**: Authentication fails
- Ingress should handle auth automatically
- Check that `homeassistant_api: true` in config.json

## Best Practices

1. **Version Management**
   - Update `config.json` version
   - Update `CHANGELOG.md`
   - Tag git commits with version

2. **Security**
   - Never commit tokens or secrets
   - Use ingress for all HA communication
   - Keep dependencies updated

3. **Testing**
   - Test on multiple architectures
   - Verify health check works
   - Test ingress WebSocket connection

4. **Documentation**
   - Update README.md for users
   - Update DOCS.md for developers
   - Keep changelog current

## Resources

- [HA Add-on Development](https://developers.home-assistant.io/docs/add-ons)
- [Add-on Configuration](https://developers.home-assistant.io/docs/add-ons/configuration)
- [Ingress Documentation](https://developers.home-assistant.io/docs/add-ons/presentation#ingress)
- [Docker Multi-arch Builds](https://docs.docker.com/buildx/working-with-buildx/)
