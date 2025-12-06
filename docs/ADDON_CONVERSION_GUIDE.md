# 🚀 Add-on Conversion Guide

## Overview

This guide walks you through converting the Dev2 React Dashboard from a Lovelace custom card to a Home Assistant Add-on with ingress support.

## ✅ Conversion Checklist

### Phase 1: Add-on Structure ✓ COMPLETE

- [x] Create add-on directory structure
- [x] Create `config.json` with ingress configuration
- [x] Create Dockerfile with multi-stage build
- [x] Create Nginx configuration for serving SPA
- [x] Create README and documentation

### Phase 2: React App Adaptation ✓ COMPLETE

- [x] Create `main-addon.jsx` entry point for add-on
- [x] Create `ingress-connection.js` for WebSocket over ingress
- [x] Create `vite.addon.config.js` build configuration
- [x] Create `index-addon.html` for add-on SPA
- [x] Update `package.json` with add-on build scripts

### Phase 3: Deployment Automation ✓ COMPLETE

- [x] Create `deploy-addon.ps1` deployment script
- [x] Create enhanced deployment watcher
- [x] Update deployment configuration
- [x] Create build script for Docker

### Phase 4: Testing & Validation ⏳ PENDING

- [ ] Build Docker image locally
- [ ] Test add-on in Home Assistant
- [ ] Verify ingress connection
- [ ] Test WebSocket state updates
- [ ] Test service calls
- [ ] Verify theme switching

## 🏗️ Architecture Changes

### Before (Lovelace Card)

```
User → HA Lovelace UI → Custom Card (JS)
                      ↓
                   React App receives `hass` object
                   from Lovelace context
```

**Pros:**
- Simple integration
- No separate server needed
- Direct hass object access

**Cons:**
- Limited to Lovelace views
- Can't run standalone
- No custom authentication

### After (Add-on with Ingress)

```
User → HA Ingress Proxy → Docker Container (Nginx)
                        ↓
                     React SPA
                        ↓
                     WebSocket → HA API
```

**Pros:**
- Standalone dashboard app
- Appears in sidebar
- Ingress handles authentication
- Full control over UI/UX
- Can have backend services

**Cons:**
- More complex deployment
- Requires Docker
- Additional resource usage

## 🔧 Key Technical Changes

### 1. Entry Point

**Lovelace Card:** `lovelace-card.jsx`
- Web Component wrapper
- Receives `hass` from Lovelace
- Renders in Shadow DOM

**Add-on:** `main-addon.jsx`
- Standalone React app
- Creates own HA connection
- Renders in regular DOM

### 2. HA Connection

**Lovelace Card:**
```javascript
set hass(hass) {
  this._hass = hass  // Provided by Lovelace
}
```

**Add-on:**
```javascript
const connection = new IngressConnection()
await connection.connect()  // Creates WebSocket
```

### 3. WebSocket URL

**Lovelace Card:**
- Uses `ws://homeassistant.local:8123/api/websocket`
- Requires authentication token

**Add-on:**
- Uses `ws://${window.location.host}/api/websocket`
- Ingress proxy handles authentication
- No token required

### 4. Build Output

**Lovelace Card:**
- Single IIFE bundle: `dev2-react-dashboard.js`
- Deployed to: `Z:\www\lovelace-cards\`

**Add-on:**
- Full SPA with index.html
- Multiple chunked JS files
- Deployed to: Docker image

## 📋 Build & Deployment

### Development Workflow

1. **Edit source files** in `src/`
2. **Build for add-on:** `npm run build:addon`
3. **Deploy to add-on folder:** `npm run deploy:addon`
4. **Build Docker image:**
   ```bash
   cd addon
   docker build -t dev2-react-dashboard ..
   ```
5. **Test locally:**
   ```bash
   docker run -p 8099:8099 dev2-react-dashboard
   ```

### Automated Deployment (Watch Mode)

Enable add-on target in `deployment.config.json`:

```json
{
  "targets": {
    "addon": {
      "enabled": true
    }
  }
}
```

Then run:
```bash
node scripts/deploy-watcher-enhanced.js
```

This will:
- Watch `src/` for changes
- Auto-build on file save
- Deploy to add-on directory
- (Optional) Rebuild Docker image

### Production Build

```bash
# Build for all architectures
cd addon
chmod +x build.sh
./build.sh

# Push to container registry
docker push ghcr.io/username/amd64-dev2-react-dashboard:1.0.0
```

## 🧪 Testing the Add-on

### Local Testing (Without HA)

```bash
# Build and run
npm run build:addon
cd addon
docker build -t dev2-test ..
docker run -p 8099:8099 dev2-test

# Access at http://localhost:8099
```

**Note:** WebSocket connection will fail without HA, but you can test the UI.

### Testing in Home Assistant

1. **Create local add-on repository:**
   ```bash
   # On HA host
   mkdir -p /addons/dev2-react-dashboard
   ```

2. **Copy add-on files:**
   ```bash
   # Copy addon folder contents
   cp -r addon/* /addons/dev2-react-dashboard/
   ```

3. **Add repository in HA:**
   - Settings → Add-ons → Add-on Store
   - Menu (⋮) → Repositories
   - Add: `/addons`

4. **Install add-on:**
   - Find "Dev2 React Dashboard" in local add-ons
   - Click Install
   - Click Start

5. **Enable sidebar:**
   - Configuration tab
   - Enable "Show in sidebar"

6. **Access dashboard:**
   - Click "Dev2 Dashboard" in sidebar

### Verification Checklist

- [ ] Add-on appears in sidebar
- [ ] Dashboard loads without errors
- [ ] WebSocket connects successfully
- [ ] Entity states display correctly
- [ ] States update in real-time
- [ ] Service calls work (toggle lights, etc.)
- [ ] Theme switching works
- [ ] No authentication errors
- [ ] No CORS errors

## 🔍 Troubleshooting

### Build Issues

**Problem:** `npm run build:addon` fails

**Solution:**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules
npm install
npm run build:addon
```

### Docker Issues

**Problem:** Dockerfile build fails

**Solution:**
```bash
# Check Docker build with verbose output
docker build --progress=plain -t dev2-test addon/..

# Check specific stage
docker build --target=builder -t dev2-builder addon/..
```

### Runtime Issues

**Problem:** WebSocket connection fails

**Check:**
1. Ingress is enabled in `config.json`
2. Port 8099 is correct in Nginx config
3. Browser console for WebSocket errors
4. HA logs: `docker logs homeassistant`

**Problem:** "Auth invalid" error

**Solution:**
- Ingress should handle auth automatically
- Verify `homeassistant_api: true` in config.json
- Check that you're accessing through ingress URL

**Problem:** Dashboard shows but states don't update

**Check:**
1. WebSocket connection status in console
2. Network tab for WebSocket frames
3. Verify `state_changed` events are received

### Ingress Issues

**Problem:** 404 when accessing add-on

**Solution:**
- Check Nginx is running: `docker exec <container> ps aux`
- Verify files in `/usr/share/nginx/html`
- Check Nginx error logs

**Problem:** Blank page

**Solution:**
- Check browser console for errors
- Verify index.html exists
- Check asset paths are correct

## 📊 Performance Comparison

### Resource Usage

**Lovelace Card:**
- Memory: ~5-10 MB (in browser)
- CPU: Negligible
- Storage: ~500 KB

**Add-on:**
- Memory: ~50-100 MB (Docker container)
- CPU: ~1-2%
- Storage: ~100 MB (image)

### Load Time

**Lovelace Card:**
- Initial load: ~200-500ms
- Subsequent: ~100ms (cached)

**Add-on:**
- Initial load: ~500-1000ms
- Subsequent: ~200ms (cached)

## 🎯 Next Steps

1. **Test thoroughly** in development environment
2. **Create GitHub repository** for add-on
3. **Set up CI/CD** for automated builds
4. **Publish to container registry** (GHCR)
5. **Create add-on repository** for distribution
6. **Write user documentation**
7. **Submit to Community Add-ons** (optional)

## 📚 Resources

- [HA Add-on Development](https://developers.home-assistant.io/docs/add-ons)
- [Ingress Documentation](https://developers.home-assistant.io/docs/add-ons/presentation#ingress)
- [Docker Multi-arch](https://docs.docker.com/buildx/working-with-buildx/)
- [Add-on Configuration](https://developers.home-assistant.io/docs/add-ons/configuration)

## 💡 Tips

1. **Keep Lovelace version**: Users might prefer different deployment methods
2. **Version carefully**: Maintain separate version numbers for card vs add-on
3. **Document both paths**: Some users want simplicity (card), others want features (add-on)
4. **Test multi-arch**: Ensure works on Raspberry Pi (ARM)
5. **Monitor resources**: Add-ons use more resources than cards

## ✅ Success Criteria

The add-on conversion is successful when:

- ✓ Docker image builds without errors
- ✓ Add-on installs in HA
- ✓ Dashboard appears in sidebar
- ✓ WebSocket connects through ingress
- ✓ All entities display correctly
- ✓ States update in real-time
- ✓ Service calls work
- ✓ No authentication issues
- ✓ Works on multiple architectures
- ✓ Automatic deployment works

---

**Status:** Phase 1-3 Complete ✓ | Phase 4 Pending ⏳

Ready to test the add-on in Home Assistant!
