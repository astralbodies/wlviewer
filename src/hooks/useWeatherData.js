import { useState, useEffect, useRef } from 'react';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [httpStatus, setHttpStatus] = useState('waiting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const wsRef = useRef(null);
  const lastHttpUpdateRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.dataSource === 'http') {
          lastHttpUpdateRef.current = Date.now();
          setHttpStatus('active');
        }

        setWeatherData(message.data);
        setLastUpdate(new Date(message.timestamp));
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    // HTTP status checker
    const statusInterval = setInterval(() => {
      if (lastHttpUpdateRef.current) {
        const elapsed = Date.now() - lastHttpUpdateRef.current;
        if (elapsed < 90000) {
          setHttpStatus('active');
        } else {
          setHttpStatus('stale');
        }
      }
    }, 5000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(statusInterval);
    };
  }, []);

  return {
    weatherData,
    wsConnected,
    httpStatus,
    lastUpdate,
  };
};
