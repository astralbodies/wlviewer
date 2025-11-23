import React from 'react';
import { degreesToOrdinal, formatValue } from '../utils/weatherUtils';

const WindDisplay = ({ windDir, windSpeed, timeStr }) => {
  const ordinal = windDir !== undefined ? degreesToOrdinal(windDir) : '--';

  return (
    <div className="wind-featured">
      <div className="section-title">Wind</div>
      <div className="wind-direction">
        <div
          className="wind-arrow"
          style={{ transform: windDir !== undefined ? `rotate(${windDir}deg)` : 'rotate(0deg)' }}
        />
      </div>
      <div className="wind-readings">
        <div className="wind-metric">
          <div className="label">Direction</div>
          <div className="value" style={{ fontSize: '2.5em' }}>{ordinal}</div>
          <div className="unit">{windDir !== undefined ? `${windDir}°` : ''}</div>
          {timeStr && <div className="updated">Updated: {timeStr}</div>}
        </div>
        <div className="wind-metric">
          <div className="label">Speed</div>
          <div className="value">{formatValue(windSpeed, 1)}</div>
          <div className="unit">mph</div>
          {timeStr && <div className="updated">Updated: {timeStr}</div>}
        </div>
      </div>
    </div>
  );
};

export default WindDisplay;
