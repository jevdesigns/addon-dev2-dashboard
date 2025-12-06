# 🎯 Dev2 React Dashboard - Deployment Options Guide

## Overview

The Dev2 React Dashboard can be deployed in **two ways**:

1. **Lovelace Custom Card** (Simple, lightweight)
2. **Home Assistant Add-on** (Full-featured, standalone)

This guide helps you choose the right option and get started quickly.

## 🤔 Which Deployment Should I Use?

### Option 1: Lovelace Custom Card ⭐ RECOMMENDED FOR MOST USERS

**Best for:**
- Quick setup (5 minutes)
- Minimal resource usage
- Embedding in existing dashboards
- Simple deployment

**How it works:**
- JavaScript file loaded into Lovelace
- Appears as a card on any dashboard view
- Receives state updates from Lovelace
- No separate server needed

**Pros:**
- ✅ Fast setup
- ✅ Low resource usage (~5 MB RAM)
- ✅ No Docker required
- ✅ Easy updates
- ✅ Mix with other cards

**Cons:**
- ❌ Limited to Lovelace views
- ❌ Can't run as standalone app
- ❌ No custom backend logic

**Quick Start:**
```bash
# 1. Build
npm run build:lovelace

# 2. Deploy
npm run deploy:lovelace

# 3. Add resource in HA
# URL: /local/lovelace-cards/dev2-react-dashboard.js
# Type: JavaScript Module

# 4. Add to dashboard
type: custom:dev2-react-dashboard
title: My Dashboard
```

📖 [Full Lovelace Setup Guide](./docs/LOVELACE_SETUP.md)

---

### Option 2: Home Assistant Add-on 🚀 ADVANCED

**Best for:**
- Standalone dashboard application
- Full control over UI/UX
- Custom backend services
- Sidebar integration

**How it works:**
- React app runs in Docker container
- Nginx serves the SPA
- Appears in HA sidebar
- Ingress handles authentication

**Pros:**
- ✅ Standalone app
- ✅ Sidebar integration
- ✅ Full authentication control
- ✅ Can add backend services
- ✅ Professional deployment

**Cons:**
- ❌ More complex setup
- ❌ Higher resource usage (~100 MB RAM)
- ❌ Requires Docker
- ❌ Longer build time

**Quick Start:**
```bash
# 1. Build everything
.\addon-quickstart.ps1 -Action all

# 2. Test locally
# Access http://localhost:8099

# 3. Deploy to HA
# Copy addon/ folder to /addons/dev2-react-dashboard/
# Install from local repository
```

📖 [Full Add-on Conversion Guide](./docs/ADDON_CONVERSION_GUIDE.md)

---

## 📊 Comparison Table

| Feature | Lovelace Card | Add-on |
|---------|--------------|--------|
| Setup Time | 5 minutes | 30 minutes |
| Resource Usage | ~5 MB | ~100 MB |
| Requires Docker | ❌ No | ✅ Yes |
| Sidebar Integration | ❌ No | ✅ Yes |
| Standalone App | ❌ No | ✅ Yes |
| Custom Backend | ❌ No | ✅ Yes |
| Easy Updates | ✅ Very Easy | ⚠️ Moderate |
| Mix with Other Cards | ✅ Yes | ❌ No |
| Authentication Control | Limited | Full |

## 🚀 Quick Commands

### Lovelace Card Development
```bash
# Build Lovelace card
npm run build:lovelace

# Deploy to HA
npm run deploy:lovelace

# Watch mode (auto-rebuild)
npm run deploy:watch
```

### Add-on Development
```bash
# Build add-on
npm run build:addon

# Deploy to addon folder
npm run deploy:addon

# Full add-on workflow
.\addon-quickstart.ps1 -Action all

# Watch mode
.\addon-quickstart.ps1 -Watch
```

### Automated Deployment (Both)
```bash
# Start deployment watcher (monitors src/ for changes)
node scripts/deploy-watcher-enhanced.js

# Enable add-on in deployment.config.json to include it in watch
```

## 📁 Project Structure

```
522-react/
├── src/                          # Source code
│   ├── App.jsx                  # Main React app
│   ├── lovelace-card.jsx        # Lovelace wrapper
│   ├── main-addon.jsx           # Add-on entry point
│   └── utils/
│       └── ingress-connection.js # Add-on HA connection
│
├── addon/                        # Add-on files
│   ├── config.json              # Add-on configuration
│   ├── Dockerfile               # Docker build
│   ├── nginx.conf               # Web server config
│   └── DOCS.md                  # Add-on documentation
│
├── docs/                         # Documentation
│   ├── LOVELACE_SETUP.md        # Lovelace guide
│   ├── ADDON_CONVERSION_GUIDE.md # Add-on guide
│   └── README.md                # Docs index
│
├── scripts/                      # Build scripts
│   ├── deploy-lovelace.ps1      # Lovelace deployment
│   ├── deploy-addon.ps1         # Add-on deployment
│   └── deploy-watcher-enhanced.js # Auto-deployment
│
├── vite.lovelace.config.js      # Lovelace build config
├── vite.addon.config.js         # Add-on build config
├── deployment.config.json        # Deployment settings
└── addon-quickstart.ps1         # Quick start script
```

## 🎯 Recommended Workflow

### For Development
1. Use **watch mode** for automatic rebuilds
2. Test changes in browser immediately
3. Keep both deployment options working

### For Production

**Lovelace Card:**
```bash
npm run build:lovelace
npm run deploy:lovelace
# Hard refresh HA dashboard (Ctrl+Shift+R)
```

**Add-on:**
```bash
.\addon-quickstart.ps1 -Action build
# Upload to GitHub Container Registry
# Update add-on repository
```

## 🔧 Configuration

### Enable Add-on in Deployment Watcher

Edit `deployment.config.json`:

```json
{
  "targets": {
    "lovelace": {
      "enabled": true
    },
    "addon": {
      "enabled": true  // Change to true
    }
  }
}
```

Now watch mode will build both targets automatically!

## 📚 Documentation

- [Quick Start (Lovelace)](./docs/QUICK_START_LOVELACE.md)
- [Lovelace Setup Guide](./docs/LOVELACE_SETUP.md)
- [Add-on Conversion Guide](./docs/ADDON_CONVERSION_GUIDE.md)
- [Configuration Examples](./docs/CONFIGURATION_EXAMPLES.md)
- [Service Calls Reference](./docs/SERVICE_CALLS.md)
- [Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAMS.md)

## 🐛 Troubleshooting

### Lovelace Card Issues
- Hard refresh browser (Ctrl+Shift+R)
- Clear Lovelace resource cache
- Check browser console for errors
- Verify file exists at `/local/lovelace-cards/dev2-react-dashboard.js`

### Add-on Issues
- Check Docker logs: `docker logs dev2-test`
- Verify Nginx config: `docker exec dev2-test nginx -t`
- Check ingress WebSocket connection in browser console
- Ensure `homeassistant_api: true` in `addon/config.json`

## 💡 Tips

1. **Start with Lovelace**: It's simpler and faster to test
2. **Use watch mode**: Auto-rebuild saves time
3. **Keep both working**: Users might prefer different methods
4. **Version separately**: Lovelace and Add-on can have different versions
5. **Test on real hardware**: Raspberry Pi performance differs from desktop

## ✅ Success Checklist

### Lovelace Card
- [ ] Build completes without errors
- [ ] File copied to `Z:\www\lovelace-cards\`
- [ ] Resource registered in HA
- [ ] Card appears in Lovelace UI
- [ ] States update in real-time
- [ ] Service calls work

### Add-on
- [ ] Docker image builds
- [ ] Container starts successfully
- [ ] Dashboard accessible at http://localhost:8099
- [ ] WebSocket connects through ingress
- [ ] States update in real-time
- [ ] Service calls work
- [ ] Appears in HA sidebar

## 🤝 Contributing

When contributing, ensure both deployment methods continue to work:

1. Test Lovelace build: `npm run build:lovelace`
2. Test Add-on build: `npm run build:addon`
3. Verify both work in HA
4. Update documentation

## 📄 License

MIT License - see LICENSE file for details

---

**Need Help?** Check the [documentation](./docs/) or open an issue!
