const dgram = require('dgram');
const express = require('express');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const path = require('path');
const Bonjour = require('bonjour-hap');

const WEB_PORT = 3000;
const POLL_INTERVAL = 60000; // 60 seconds
const REALTIME_DURATION = 3600; // 1 hour in seconds
const REALTIME_REFRESH = 3000000; // 50 minutes in ms (refresh before expiry)

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let udpSocket = null;
let udpPort = null;
let weatherLinkDevice = null;
let latestHttpData = null;
let httpPollInterval = null;
let realtimeRefreshInterval = null;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function broadcastToClients(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function discoverWeatherLinkDevice() {
  console.log('Starting DNS-SD discovery for WeatherLink Live device...');
  const bonjour = new Bonjour();

  const browser = bonjour.find({ type: 'weatherlinklive', protocol: 'tcp' });

  browser.on('up', (service) => {
    console.log('WeatherLink Live device found:');
    console.log(`  Name: ${service.name}`);
    console.log(`  Host: ${service.host}`);
    console.log(`  Port: ${service.port}`);
    console.log(`  Address: ${service.addresses?.[0]}`);

    weatherLinkDevice = {
      host: service.host,
      address: service.addresses?.[0] || service.host,
      port: service.port || 80,
    };

    browser.stop();
    bonjour.destroy();

    activateRealtime();
    pollCurrentConditions();

    if (httpPollInterval) {
      clearInterval(httpPollInterval);
    }
    httpPollInterval = setInterval(pollCurrentConditions, POLL_INTERVAL);
  });

  browser.on('down', (service) => {
    console.log('WeatherLink Live device went offline');
    if (weatherLinkDevice && weatherLinkDevice.host === service.host) {
      weatherLinkDevice = null;
      if (httpPollInterval) {
        clearInterval(httpPollInterval);
        httpPollInterval = null;
      }
      if (realtimeRefreshInterval) {
        clearInterval(realtimeRefreshInterval);
        realtimeRefreshInterval = null;
      }
      if (udpSocket) {
        udpSocket.close();
        udpSocket = null;
        udpPort = null;
      }
    }
  });

  setTimeout(() => {
    if (!weatherLinkDevice) {
      console.log('No WeatherLink Live device found after 10 seconds, will retry in 30 seconds...');
      browser.stop();
      bonjour.destroy();
      setTimeout(discoverWeatherLinkDevice, 30000);
    }
  }, 10000);
}

function activateRealtime() {
  if (!weatherLinkDevice) {
    console.log('No WeatherLink device available for real-time activation');
    return;
  }

  const url = `http://${weatherLinkDevice.address}:${weatherLinkDevice.port}/v1/real_time?duration=${REALTIME_DURATION}`;
  console.log(`Activating real-time UDP broadcast: ${url}`);

  http.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Real-time response:', jsonData);

        const responseData = jsonData.data || jsonData;

        if (responseData.broadcast_port) {
          const newPort = responseData.broadcast_port;
          console.log(`UDP broadcast port: ${newPort}`);

          if (udpPort !== newPort) {
            if (udpSocket) {
              console.log(`Closing existing UDP socket on port ${udpPort}`);
              udpSocket.close();
            }

            udpPort = newPort;
            udpSocket = dgram.createSocket('udp4');

            udpSocket.on('error', (err) => {
              console.error(`UDP socket error:\n${err.stack}`);
              udpSocket.close();
            });

            udpSocket.on('message', (msg, rinfo) => {
              try {
                const jsonData = JSON.parse(msg.toString());
                console.log(`Received UDP data from ${rinfo.address}:${rinfo.port}`);

                const mergedData = mergeWeatherData(jsonData);

                broadcastToClients({
                  timestamp: new Date().toISOString(),
                  source: `${rinfo.address}:${rinfo.port} (UDP)`,
                  data: mergedData,
                  dataSource: 'udp'
                });
              } catch (err) {
                console.error('Error parsing JSON:', err.message);
                console.log('Raw data:', msg.toString());
              }
            });

            udpSocket.on('listening', () => {
              const address = udpSocket.address();
              console.log(`UDP server listening on ${address.address}:${address.port}`);
            });

            udpSocket.bind(udpPort);
          }

          if (realtimeRefreshInterval) {
            clearInterval(realtimeRefreshInterval);
          }
          realtimeRefreshInterval = setInterval(activateRealtime, REALTIME_REFRESH);
        } else {
          console.error('No broadcast_port in real-time response');
        }
      } catch (err) {
        console.error('Error parsing real-time response:', err.message);
      }
    });
  }).on('error', (err) => {
    console.error('Error activating real-time broadcast:', err.message);
  });
}

function pollCurrentConditions() {
  if (!weatherLinkDevice) {
    console.log('No WeatherLink device available for polling');
    return;
  }

  const url = `http://${weatherLinkDevice.address}:${weatherLinkDevice.port}/v1/current_conditions`;
  console.log(`Polling current conditions from ${url}`);

  http.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Received HTTP data from WeatherLink device');

        const weatherData = jsonData.data || jsonData;
        latestHttpData = weatherData;

        broadcastToClients({
          timestamp: new Date().toISOString(),
          source: `${weatherLinkDevice.address}:${weatherLinkDevice.port} (HTTP)`,
          data: weatherData,
          dataSource: 'http'
        });
      } catch (err) {
        console.error('Error parsing HTTP response:', err.message);
      }
    });
  }).on('error', (err) => {
    console.error('Error fetching current conditions:', err.message);
  });
}

function mergeWeatherData(udpData) {
  if (!latestHttpData) {
    return udpData;
  }

  const merged = JSON.parse(JSON.stringify(latestHttpData));

  if (udpData.conditions && merged.conditions) {
    udpData.conditions.forEach((udpCondition, index) => {
      if (merged.conditions[index]) {
        if (udpCondition.wind_speed_last !== undefined) {
          merged.conditions[index].wind_speed_last = udpCondition.wind_speed_last;
        }
        if (udpCondition.wind_dir_last !== undefined) {
          merged.conditions[index].wind_dir_last = udpCondition.wind_dir_last;
        }
        if (udpCondition.rain_rate_last !== undefined) {
          merged.conditions[index].rain_rate_last = udpCondition.rain_rate_last;
        }
        if (udpCondition.rain_15_min !== undefined) {
          merged.conditions[index].rain_15_min = udpCondition.rain_15_min;
        }
        if (udpCondition.rain_60_min !== undefined) {
          merged.conditions[index].rain_60_min = udpCondition.rain_60_min;
        }
        if (udpCondition.rain_24_hr !== undefined) {
          merged.conditions[index].rain_24_hr = udpCondition.rain_24_hr;
        }
        if (udpCondition.rain_storm !== undefined) {
          merged.conditions[index].rain_storm = udpCondition.rain_storm;
        }
        if (udpCondition.rain_storm_start_at !== undefined) {
          merged.conditions[index].rain_storm_start_at = udpCondition.rain_storm_start_at;
        }
        if (udpCondition.rainfall_daily !== undefined) {
          merged.conditions[index].rainfall_daily = udpCondition.rainfall_daily;
        }
        if (udpCondition.rainfall_monthly !== undefined) {
          merged.conditions[index].rainfall_monthly = udpCondition.rainfall_monthly;
        }
        if (udpCondition.rainfall_year !== undefined) {
          merged.conditions[index].rainfall_year = udpCondition.rainfall_year;
        }
      }
    });
  }

  return merged;
}

server.listen(WEB_PORT, () => {
  console.log(`Web server running at http://localhost:${WEB_PORT}`);
  console.log('Starting WeatherLink device discovery...');
  discoverWeatherLinkDevice();
});
