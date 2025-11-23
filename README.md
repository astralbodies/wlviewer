# WeatherLink Live Viewer

A web and desktop application that automatically discovers WeatherLink Live devices on your local network and displays comprehensive weather data in real-time through both HTTP polling and UDP broadcasts.

Available as both a web application and a native desktop app (Electron.js).

## Features

- **Automatic Device Discovery**: Uses mDNS/DNS-SD to automatically find WeatherLink Live devices on your network
- **Dual Data Sources**:
  - HTTP polling (every 60 seconds) for complete weather data
  - UDP broadcasts (every 2.5 seconds) for real-time wind and rain updates
  - Automatically activates real-time UDP streaming via `/v1/real_time` endpoint
  - Dynamically binds to the correct UDP broadcast port from device
  - Intelligent data merging for best of both sources
- **Dashboard View**: Live-updating weather dashboard with:
  - Outdoor weather: Temperature, Humidity, Dew Point, Wind Chill, Barometric Pressure, Wind Speed/Direction (ordinal + degrees), Rain Rate, 24-hour Rain Total
  - Indoor weather: Temperature, Humidity
  - Animated wind direction indicator
  - Real-time updates as data arrives
  - Connection status indicators for both HTTP and WebSocket
- **Debug Console**: View raw JSON data from both HTTP and UDP sources
- Real-time data streaming using WebSocket
- Clean, modern web interface with glassmorphism design
- Easy navigation between dashboard and debug views
- **Desktop App**: Native Electron.js application with menu bar and keyboard shortcuts

## Installation

```bash
npm install
```

## Usage

Start the server:

```bash
npm start
```

The application will:
- Start a web server on http://localhost:3000
- Automatically discover WeatherLink Live devices using mDNS (service: `_weatherlinklive._tcp.local.`)
- Activate real-time UDP streaming and bind to the broadcast port returned by the device
- Begin polling the device for current conditions every 60 seconds
- Automatically refresh the real-time UDP session every 50 minutes (1-hour sessions)

Open your browser and navigate to:
- **http://localhost:3000** - Dashboard view with live weather data
- **http://localhost:3000/debug.html** - Debug console with raw JSON data

**Note**: The WeatherLink Live device and the computer running this app must be on the same local network for automatic discovery to work.

### Desktop App

Run the native desktop application:

```bash
cd desktop
npm install
npm start
```

The desktop app will:
- Automatically start the web server
- Launch in a native window
- Provide menu bar navigation (Dashboard, Debug Console)
- Support keyboard shortcuts (Cmd/Ctrl+R to reload, etc.)

See [desktop/README.md](desktop/README.md) for building installers and more details.

## Testing

A test script is included to send sample UDP data:

```bash
node test-udp.js
```

This will send sample JSON data to UDP port 22222 (the default WeatherLink port) for testing purposes.

If the server is using a different port, check the server logs for the actual port and specify it:

```bash
node test-udp.js 22223
```

## Configuration

Default settings in `server.js`:
- **Web Server**: 3000
- **HTTP Poll Interval**: 60 seconds (60000ms)
- **Real-time Duration**: 1 hour (3600s)
- **Real-time Refresh**: 50 minutes (before session expires)
- **UDP Port**: Dynamically obtained from device via `/v1/real_time` endpoint

These can be modified by changing the `WEB_PORT`, `POLL_INTERVAL`, `REALTIME_DURATION`, and `REALTIME_REFRESH` constants.

## Future Plans

- Data persistence and history
- Data visualization and charts
- Export functionality
- Auto-update for desktop app
