import React from 'react';

const Header = ({ wsConnected, httpStatus }) => {
  const getHttpStatusText = () => {
    switch (httpStatus) {
      case 'active':
        return 'HTTP: Active';
      case 'stale':
        return 'HTTP: Stale';
      default:
        return 'HTTP: Waiting';
    }
  };

  const getHttpStatusClass = () => {
    return httpStatus === 'active' ? 'connected' : 'disconnected';
  };

  return (
    <div className="header">
      <h1>WeatherLink Live Viewer</h1>
      <div>
        <span className={`status ${wsConnected ? 'connected' : 'disconnected'}`}>
          WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}
        </span>
        <span className={`status ${getHttpStatusClass()}`}>
          {getHttpStatusText()}
        </span>
      </div>
    </div>
  );
};

export default Header;
