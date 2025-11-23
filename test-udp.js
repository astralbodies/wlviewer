const dgram = require('dgram');

// NOTE: The server now dynamically obtains the UDP port from the WeatherLink device.
// 22222 is the default/typical port, but check server logs for the actual port if needed.
const client = dgram.createSocket('udp4');
const PORT = process.argv[2] || 22222;
const HOST = 'localhost';

const sampleData = {
  did: "001D0A700001",
  ts: Math.floor(Date.now() / 1000),
  conditions: [
    {
      lsid: 48308,
      data_structure_type: 1,
      txid: 1,
      temp: 72.5,
      hum: 65.3,
      dew_point: 59.8,
      heat_index: 73.2,
      wind_chill: 72.5,
      wind_speed_last: 5.2,
      wind_dir_last: 180,
      rain_size: 2,
      rain_rate_last: 0,
      rain_15_min: 0,
      rain_60_min: 0.02,
      rain_24_hr: 0.15,
      rain_storm: 0.15,
      solar_rad: 450,
      uv_index: 3.5,
      rx_state: 0,
      trans_battery_flag: 0,
      bar_sea_level: 30.12,
      bar_absolute: 29.85
    },
    {
      lsid: 48309,
      data_structure_type: 4,
      temp_in: 68.5,
      hum_in: 45.2,
      dew_point_in: 46.8
    }
  ]
};

function sendTestData() {
  const message = JSON.stringify(sampleData);

  client.send(message, 0, message.length, PORT, HOST, (err) => {
    if (err) {
      console.error('Error sending UDP message:', err);
    } else {
      console.log('Test data sent successfully');
      console.log('Data:', JSON.stringify(sampleData, null, 2));
    }
    client.close();
  });
}

console.log(`Sending test UDP data to ${HOST}:${PORT}...`);
sendTestData();
