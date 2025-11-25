import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWeatherData } from '../hooks/useWeatherData';
import '../styles/Debug.css';

const MAX_MESSAGES = 50;

const Debug = () => {
  const { wsConnected } = useWeatherData();
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Debug WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => {
          const updated = [message, ...prev];
          return updated.slice(0, MAX_MESSAGES);
        });
      };

      wsRef.current.onclose = () => {
        console.log('Debug WebSocket disconnected');
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('Debug WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const clearData = () => {
    setMessages([]);
  };

  return (
    <div className="debug-page">
      <div className="container">
        <div className="nav">
          <Link to="/">← Back to Dashboard</Link>
        </div>

        <div className="header">
          <h1>Debug Console</h1>
          <span className={`status ${wsConnected ? 'connected' : 'disconnected'}`}>
            {wsConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="info">
          <p><strong>Data Sources:</strong> HTTP Polling (60s) + UDP Broadcasts (2.5s)</p>
          <p><strong>Display:</strong> All data received via WebSocket</p>
          <p><strong>UDP:</strong> Port dynamically obtained from device via /v1/real_time</p>
          <p><strong>Status:</strong> {messages.length > 0 ? `${messages.length} message(s) received` : 'Waiting for data...'}</p>
        </div>

        <button className="clear-btn" onClick={clearData}>Clear Data</button>

        <div className="data-container">
          {messages.length === 0 ? (
            <div className="no-data">No data received yet. Waiting for WebSocket messages...</div>
          ) : (
            messages.map((message, index) => {
              const dataSource = message.dataSource || 'unknown';
              return (
                <div key={index} className={`data-entry ${dataSource}`}>
                  <div className="timestamp">
                    Received: {new Date(message.timestamp).toLocaleString()}
                  </div>
                  <div className="source">
                    Source: {message.source}{' '}
                    <span className={`source-badge ${dataSource}`}>
                      {dataSource.toUpperCase()}
                    </span>
                  </div>
                  <pre>{JSON.stringify(message.data, null, 2)}</pre>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Debug;
