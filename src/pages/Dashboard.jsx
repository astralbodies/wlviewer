import React from 'react';
import { Link } from 'react-router-dom';
import { useWeatherData } from '../hooks/useWeatherData';
import { degreesToOrdinal, formatValue } from '../utils/weatherUtils';

const isElectron = window.electron?.isElectron || false;

function Dashboard() {
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
  const windDir = condition.wind_dir_last;
  const windOrdinal = windDir !== undefined ? degreesToOrdinal(windDir) : '--';

  return (
    <div className="dashboard">
      {!isElectron && (
        <div className="nav">
          <Link to="/debug">Debug Console</Link>
        </div>
      )}

      {/* Connection Status */}
      <div className="connection-status">
        <span>
          <span className={`status-dot ${wsConnected ? 'connected' : 'disconnected'}`} />
          WebSocket
        </span>
        <span>
          <span className={`status-dot ${httpStatus === 'active' ? 'connected' : 'disconnected'}`} />
          HTTP
        </span>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Primary Readings: Temp and Wind */}
        <div className="primary-readings">
          <div className="temp-display">
            <div className="temp-value">
              {formatValue(condition.temp, 0)}
            </div>
            <div className="temp-label">outdoor</div>
          </div>

          <div className="wind-display">
            <div className="wind-arrow-container">
              <div
                className="wind-arrow"
                style={{ transform: windDir !== undefined ? `rotate(${windDir}deg)` : 'rotate(0deg)' }}
              >
                <svg viewBox="0 0 32 32">
                  <path d="M16 3L26 28L16 22L6 28Z" />
                </svg>
              </div>
            </div>
            <div className="wind-info">
              <div className="wind-speed">
                {formatValue(condition.wind_speed_last, 1)}
                <span className="unit">mph</span>
              </div>
              <div className="wind-direction-text">{windOrdinal}</div>
            </div>
          </div>
        </div>

        {/* Secondary Readings */}
        <div className="secondary-readings">
          <div className="metric">
            <div className="metric-value">
              {formatValue(condition.hum, 0)}
              <span className="unit">%</span>
            </div>
            <div className="metric-label">humidity</div>
          </div>

          <div className="metric tier-3">
            <div className="metric-value">
              {formatValue(condition.dew_point, 0)}
              <span className="unit">°</span>
            </div>
            <div className="metric-label">dew point</div>
          </div>

          <div className="metric tier-2">
            <div className="metric-value">
              {formatValue(pressure, 2)}
              <span className="unit">"</span>
            </div>
            <div className="metric-label">pressure</div>
          </div>

          <div className="metric rain-cluster">
            <div className="rain-metric">
              <div className="metric-value">
                {formatValue(condition.rain_rate_last, 2)}
                <span className="unit">"</span>
              </div>
              <div className="metric-label">rain/hr</div>
            </div>
            <div className="rain-metric">
              <div className="metric-value">
                {formatValue(condition.rain_storm, 2)}
                <span className="unit">"</span>
              </div>
              <div className="metric-label">storm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <div className="indoor-readings">
          <span>Indoor: {formatValue(indoorData.temp_in, 0)}° / {formatValue(indoorData.hum_in, 0)}%</span>
        </div>
        <div className="last-update">
          {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--'}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
