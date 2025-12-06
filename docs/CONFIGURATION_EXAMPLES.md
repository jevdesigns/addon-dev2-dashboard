# Example Home Assistant Configuration for Dev2 React Dashboard

This file shows you how to configure Home Assistant to use the Dev2 React Dashboard as a Lovelace custom card.

## Option 1: Lovelace Custom Card (Recommended)

No changes needed to `configuration.yaml`. Just follow these steps in Home Assistant UI:

1. Settings → Dashboards → Resources
2. Create Resource:
   - URL: `/local/lovelace-cards/dev2-react-dashboard.js`
   - Type: `JavaScript Module`
3. Edit any dashboard view and add:
   ```yaml
   type: custom:dev2-react-dashboard
   title: Dev2 Dashboard
   ```

## Option 2: Dedicated Dashboard (YAML Config)

Add this to your `configuration.yaml`:

```yaml
# No special panel configuration needed - Lovelace handles everything
```

Then create a dashboard YAML file (`dev2-dashboard.yaml`):

```yaml
title: Dev2 React Dashboard
views:
  - title: Dashboard
    path: dev2-dashboard
    cards:
      - type: custom:dev2-react-dashboard
        title: Dev2 Dashboard
```

## Option 3: Full Dashboard with Multiple Views

```yaml
title: Dev2 Dashboard
views:
  - title: Overview
    path: overview
    cards:
      - type: custom:dev2-react-dashboard
        title: My Dashboard
      
  - title: Lights
    path: lights
    cards:
      - type: light
        entity: light.kitchen
      - type: light
        entity: light.living_room
      
  - title: Climate
    path: climate
    cards:
      - type: thermostat
        entity: climate.downstairs
```

## Troubleshooting Configuration

### Custom card not showing in resource list

1. Verify the JavaScript file exists at `Z:\www\lovelace-cards\dev2-react-dashboard.js`
2. Check that the URL is exactly: `/local/lovelace-cards/dev2-react-dashboard.js`
3. Hard refresh browser: `Ctrl+Shift+R`

### Card appears but won't load

- Open developer console (`F12`)
- Check for CORS errors
- Verify Home Assistant can access the file via HTTP/HTTPS

### States not updating

- Ensure your Home Assistant token is valid
- Check that entity IDs are correct (e.g., `light.kitchen`)
- Verify network connectivity between browser and Home Assistant

## File Locations

- **Development project**: `D:\HA\522-react\`
- **Deployed Lovelace card**: `Z:\www\lovelace-cards\dev2-react-dashboard.js`
- **Home Assistant config**: `Z:\configuration.yaml`

## Related Documentation

- [Lovelace Setup Guide](./LOVELACE_SETUP.md)
- [Home Assistant Lovelace Docs](https://www.home-assistant.io/dashboards/dashboards/)
- [Custom Card Development](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card)
