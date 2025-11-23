import React from 'react';
import { formatValue } from '../utils/weatherUtils';

const WeatherCard = ({ label, value, unit, decimals = 1, timeStr, className = '' }) => {
  return (
    <div className={`weather-card ${className}`}>
      <div className="label">{label}</div>
      <div className="value">{formatValue(value, decimals)}</div>
      <div className="unit">{unit}</div>
      {timeStr && <div className="updated">Updated: {timeStr}</div>}
    </div>
  );
};

export default WeatherCard;
