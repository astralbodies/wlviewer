# WeatherLink Live Viewer - Desktop App

Electron.js desktop application for WeatherLink Live Viewer.

## Prerequisites

The parent directory must have its dependencies installed:
```bash
cd ..
npm install
```

## Development

Install desktop app dependencies:
```bash
npm install
```

Run the desktop app in development mode:
```bash
npm start
```

This will:
1. Start the Node.js server from the parent directory
2. Launch the Electron window
3. Load the web interface

## Building

**Important**: Make sure the parent directory dependencies are installed first:
```bash
cd ..
npm install
cd desktop
```

Build for your current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build:mac      # macOS (DMG & ZIP)
npm run build:win      # Windows (NSIS installer & portable)
npm run build:linux    # Linux (AppImage & DEB)
```

Built applications will be in the `dist/` directory.

**Note**: The build process packages the entire web server (server.js, public/, node_modules/) into the app bundle. This ensures the desktop app is completely self-contained.

## Features

- Native desktop application
- Auto-starts the weather server
- Menu bar with quick navigation
- Keyboard shortcuts:
  - `Cmd/Ctrl+R`: Reload
  - `Cmd/Ctrl+Q`: Quit
  - `Cmd/Ctrl+Alt+I`: Toggle Developer Tools
  - `Cmd/Ctrl+0`: Actual Size
  - `Cmd/Ctrl++`: Zoom In
  - `Cmd/Ctrl+-`: Zoom Out

## Menu Options

**File Menu:**
- Dashboard - Navigate to main dashboard
- Debug Console - Open debug view
- Reload - Refresh the current view
- Quit - Exit application

**View Menu:**
- Toggle Developer Tools
- Zoom controls

## Notes

- The desktop app runs the same server as the web version
- Server runs on localhost:3000 (same as web app)
- Server is automatically started and stopped with the app
- All weather data features work identically to the web version

## Troubleshooting

**App quits immediately or shows error dialog:**
- Check that Node.js is installed on your system
- Ensure port 3000 is not already in use
- Try running from terminal to see detailed error logs
- Verify the app was built correctly with all dependencies

**To see detailed logs:**
```bash
# macOS
/Applications/WeatherLink\ Live\ Viewer.app/Contents/MacOS/WeatherLink\ Live\ Viewer

# Windows
"C:\Program Files\WeatherLink Live Viewer\WeatherLink Live Viewer.exe"

# Linux
./weatherlink-live-viewer
```

**Server startup timeout:**
The app waits up to 30 seconds for the server to start. If you see a timeout error, check for:
- Network configuration issues
- Missing dependencies in bundled node_modules
- File permissions on the app bundle
