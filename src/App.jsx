import React from 'react';
import { useWeatherData } from './hooks/useWeatherData';
import Header from './components/Header';
import WeatherCard from './components/WeatherCard';
import WindDisplay from './components/WindDisplay';
import './styles/App.css';

function App() {
  const { weatherData, wsConnected, httpStatus, lastUpdate } = useWeatherData();

  const getCondition = () => {
    return weatherData?.conditions?.[0] || {};
  };

  const getIndoorData = () => {
    if (!weatherData?.conditions) return {};
    for (let i = 0; i < weatherData.conditions.length; i++) {
      const cond = weatherData.conditions[i];
      if (cond.temp_in !== undefined || cond.hum_in !== undefined) {
        return cond;
      }
    }
    return {};
  };

  const getPressureData = () => {
    if (!weatherData?.conditions) return null;
    for (let i = 0; i < weatherData.conditions.length; i++) {
      const cond = weatherData.conditions[i];
      if (cond.bar_sea_level !== undefined) return cond.bar_sea_level;
      if (cond.bar_absolute !== undefined) return cond.bar_absolute;
    }
    return null;
  };

  const condition = getCondition();
  const indoorData = getIndoorData();
  const pressure = getPressureData();
  const timeStr = lastUpdate ? lastUpdate.toLocaleTimeString() : '';

  return (
    <div className="container">
      <Header wsConnected={wsConnected} httpStatus={httpStatus} />

      <div className="nav">
        <a href="/debug.html">Debug Console →</a>
      </div>

      <div className="section-title">Outdoor Weather</div>

      <div className="main-weather-layout">
        <div className="left-column">
          <WeatherCard
            label="Temperature"
            value={condition.temp}
            unit="°F"
            decimals={1}
            timeStr={timeStr}
          />
          <WeatherCard
            label="Humidity"
            value={condition.hum}
            unit="%"
            decimals={1}
            timeStr={timeStr}
          />
          <WeatherCard
            label="Dew Point"
            value={condition.dew_point}
            unit="°F"
            decimals={1}
            timeStr={timeStr}
          />
          <WeatherCard
            label="Wind Chill"
            value={condition.wind_chill}
            unit="°F"
            decimals={1}
            timeStr={timeStr}
          />
        </div>

        <WindDisplay
          windDir={condition.wind_dir_last}
          windSpeed={condition.wind_speed_last}
          timeStr={timeStr}
        />

        <div className="right-column">
          <WeatherCard
            label="Rain Rate"
            value={condition.rain_rate_last}
            unit="in/hr"
            decimals={2}
            timeStr={timeStr}
          />
          <WeatherCard
            label="Rain (24hr)"
            value={condition.rain_24_hr}
            unit="inches"
            decimals={2}
            timeStr={timeStr}
          />
          <WeatherCard
            label="Pressure"
            value={pressure}
            unit="inHg"
            decimals={2}
            timeStr={timeStr}
            className="pressure-card"
          />
        </div>
      </div>

      <div className="section-title">Indoor Weather</div>
      <div className="dashboard-grid">
        <WeatherCard
          label="Temperature"
          value={indoorData.temp_in}
          unit="°F"
          decimals={1}
          timeStr={timeStr}
        />
        <WeatherCard
          label="Humidity"
          value={indoorData.hum_in}
          unit="%"
          decimals={1}
          timeStr={timeStr}
        />
      </div>

      <div className="last-update">
        Last data received: <span>{lastUpdate ? lastUpdate.toLocaleString() : 'Never'}</span>
      </div>
    </div>
  );
}

export default App;
