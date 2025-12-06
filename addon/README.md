# Dev2 React Dashboard Add-on

![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]
![Supports armhf Architecture][armhf-shield]
![Supports armv7 Architecture][armv7-shield]
![Supports i386 Architecture][i386-shield]

Modern React dashboard for Home Assistant with real-time state management and HomeKit-inspired UI.

## About

This add-on provides a powerful React-based dashboard that integrates seamlessly with your Home Assistant instance. It features:

- **Real-time State Management**: Automatic updates when your entities change
- **HomeKit-Inspired UI**: Beautiful, modern interface with glass-morphism effects
- **Tailwind CSS Styling**: Responsive design that works on all devices
- **Ingress Support**: Fully integrated with Home Assistant authentication
- **Local Storage**: Entity history and settings persist in IndexedDB

## Installation

1. Navigate to the **Add-on Store** in your Home Assistant instance
2. Click the menu (three dots) in the top right corner
3. Select **Repositories**
4. Add this repository URL: `https://github.com/YOUR_USERNAME/addon-dev2-dashboard`
5. Find "Dev2 React Dashboard" in the add-on list
6. Click **Install**

## Configuration

```yaml
theme: auto        # Options: auto, light, dark
log_level: info    # Options: debug, info, warning, error
```

### Option: `theme`

Set the dashboard theme. Options are:
- `auto`: Automatically match Home Assistant theme
- `light`: Force light theme
- `dark`: Force dark theme

### Option: `log_level`

Set the logging verbosity. Options are:
- `debug`: Show all logs including debug information
- `info`: Show informational messages and above
- `warning`: Show warnings and errors only
- `error`: Show only errors

## How to Use

1. After installation, click **Start** to run the add-on
2. Enable **Show in sidebar** to add the dashboard to your Home Assistant sidebar
3. Click the "Dev2 Dashboard" icon in the sidebar to access your dashboard

The dashboard will automatically connect to your Home Assistant instance using ingress, requiring no additional authentication.

## Features

- **Entity Management**: View and control all your Home Assistant entities
- **Service Calls**: Execute Home Assistant services directly from the dashboard
- **Historical Data**: View entity state history stored in IndexedDB
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Theme Integration**: Automatically adapts to your Home Assistant theme settings

## Support

For issues, questions, or feature requests, please visit:
- [GitHub Issues](https://github.com/YOUR_USERNAME/addon-dev2-dashboard/issues)
- [Home Assistant Community Forum](https://community.home-assistant.io/)

## License

MIT License - see LICENSE file for details

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[armhf-shield]: https://img.shields.io/badge/armhf-yes-green.svg
[armv7-shield]: https://img.shields.io/badge/armv7-yes-green.svg
[i386-shield]: https://img.shields.io/badge/i386-yes-green.svg
