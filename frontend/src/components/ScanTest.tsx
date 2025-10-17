import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import './ScanTest.css';

interface TagRead {
  epc: string;
  antenna: number;
  rssi: number;
  timestamp: string;
  count: number;
}

interface ReaderStatus {
  connected: boolean;
  scanning: boolean;
  activeAntennas: number[];
  tagCount: number;
  lastRead: string | null;
}

export const ScanTest: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<ReaderStatus>({
    connected: false,
    scanning: false,
    activeAntennas: [],
    tagCount: 0,
    lastRead: null
  });
  const [tagReads, setTagReads] = useState<TagRead[]>([]);
  const [selectedAntennas, setSelectedAntennas] = useState<number[]>([1, 2, 3, 4]);
  const [antennaPower, setAntennaPower] = useState<Record<number, number>>({
    1: 150,
    2: 150,
    3: 150,
    4: 150
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Define fetchStatus as useCallback so it can be used in WebSocket setup
  const fetchStatus = useCallback(async () => {
    try {
      const response = await api.get('/rfid/status');
      if (response.data.success) {
        setStatus(response.data.status);
      }
      return true;
    } catch (err: any) {
      console.error('Failed to fetch status:', err);
      return false;
    }
  }, []);

  // Manual heartbeat to detect if backend is actually reachable
  useEffect(() => {
    let consecutiveFailures = 0;
    const heartbeatInterval = setInterval(async () => {
      const isAlive = await fetchStatus();
      
      if (isAlive) {
        consecutiveFailures = 0;
        if (!wsConnected) {
          // Backend is alive but WebSocket thinks it's disconnected
          if (socketRef.current && !socketRef.current.connected) {
            socketRef.current.connect();
          }
        }
      } else {
        consecutiveFailures++;
        if (consecutiveFailures >= 2 && wsConnected) {
          // Only mark as disconnected after 2 consecutive failures
          setWsConnected(false);
        }
      }
    }, 3000);

    return () => clearInterval(heartbeatInterval);
  }, [wsConnected, fetchStatus]);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 5000,
      forceNew: true,
      closeOnBeforeunload: false
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setWsConnected(true);
      fetchStatus();
    });

    newSocket.on('rfid:status', (newStatus: ReaderStatus) => {
      setStatus(newStatus);
    });

    newSocket.on('rfid:tagRead', (tagRead: TagRead) => {
      setTagReads(prev => [tagRead, ...prev].slice(0, 100));
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setWsConnected(false);
    });

    newSocket.io.on('close', () => {
      setWsConnected(false);
    });

    newSocket.io.on('error', (error) => {
      console.error('WebSocket transport error:', error);
      setWsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      setWsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      setWsConnected(true);
      fetchStatus();
    });

    socketRef.current = newSocket;

    return () => {
      newSocket.close();
    };
  }, [fetchStatus]);

  // Fetch initial status
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleStartScanning = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/rfid/start', {
        antennas: selectedAntennas,
        power: antennaPower
      });

      if (response.data.success) {
        console.log('Scanning started');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start scanning');
      console.error('Failed to start scanning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopScanning = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/rfid/stop');

      if (response.data.success) {
        console.log('Scanning stopped');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to stop scanning');
      console.error('Failed to stop scanning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearReads = async () => {
    try {
      await api.delete('/rfid/reads');
      setTagReads([]);
    } catch (err: any) {
      console.error('Failed to clear reads:', err);
    }
  };

  const toggleAntenna = (antenna: number) => {
    setSelectedAntennas(prev => {
      if (prev.includes(antenna)) {
        return prev.filter(a => a !== antenna);
      } else {
        return [...prev, antenna].sort();
      }
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return 'excellent';
    if (rssi > -60) return 'good';
    if (rssi > -70) return 'fair';
    return 'poor';
  };

  return (
    <div className="scan-test">
      <h2>RFID Scan Test</h2>
      
      {/* WebSocket Status Indicator */}
      <div style={{ 
        padding: '10px', 
        marginBottom: '15px', 
        backgroundColor: wsConnected ? '#d4edda' : '#f8d7da',
        border: `1px solid ${wsConnected ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '4px',
        color: wsConnected ? '#155724' : '#721c24'
      }}>
        <strong>WebSocket: </strong>
        {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      {/* Status Panel */}
      <div className="status-panel">
        <h3>Reader Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">RFID Reader:</span>
            <span className={`value ${status.connected ? 'connected' : 'disconnected'}`}>
              {status.connected ? '✓ Connected' : '✗ Disconnected'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Scanning:</span>
            <span className={`value ${status.scanning ? 'scanning' : ''}`}>
              {status.scanning ? '⚡ Active' : '⏸ Stopped'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Tags Detected:</span>
            <span className="value">{status.tagCount}</span>
          </div>
          <div className="status-item">
            <span className="label">Active Antennas:</span>
            <span className="value">{status.activeAntennas.join(', ') || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="controls-panel">
        <h3>Controls</h3>
        
        <div className="antenna-selection">
          <label>Select Antennas:</label>
          <div className="antenna-buttons">
            {[1, 2, 3, 4].map(antenna => (
              <button
                key={antenna}
                className={`antenna-btn ${selectedAntennas.includes(antenna) ? 'selected' : ''}`}
                onClick={() => toggleAntenna(antenna)}
                disabled={status.scanning}
              >
                Antenna {antenna}
              </button>
            ))}
          </div>
        </div>

        <div className="power-control">
          <label>Antenna Power (1-200):</label>
          <div className="power-inputs">
            {[1, 2, 3, 4].map(antenna => (
              <div key={antenna} className="power-input-group">
                <label htmlFor={`power-${antenna}`}>Ant {antenna}:</label>
                <input
                  id={`power-${antenna}`}
                  type="number"
                  min="1"
                  max="200"
                  value={antennaPower[antenna]}
                  onChange={(e) => {
                    const value = Math.min(200, Math.max(1, parseInt(e.target.value) || 1));
                    setAntennaPower(prev => ({ ...prev, [antenna]: value }));
                  }}
                  disabled={status.scanning}
                  className="power-input"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={handleStartScanning}
            disabled={loading || status.scanning || selectedAntennas.length === 0}
          >
            {loading ? 'Starting...' : 'Start Scanning'}
          </button>
          
          <button
            className="btn btn-danger"
            onClick={handleStopScanning}
            disabled={loading || !status.scanning}
          >
            {loading ? 'Stopping...' : 'Stop Scanning'}
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={handleClearReads}
            disabled={tagReads.length === 0}
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Tag Reads Table */}
      <div className="reads-panel">
        <h3>Tag Reads ({tagReads.length})</h3>
        
        {tagReads.length === 0 ? (
          <div className="no-data">
            {status.scanning ? 'Waiting for tag reads...' : 'Start scanning to detect tags'}
          </div>
        ) : (
          <div className="reads-table-container">
            <table className="reads-table">
              <thead>
                <tr>
                  <th>EPC</th>
                  <th>Antenna</th>
                  <th>RSSI</th>
                  <th>Signal</th>
                  <th>Count</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {tagReads.map((read, index) => (
                  <tr key={`${read.epc}-${index}`}>
                    <td className="epc">{read.epc}</td>
                    <td>Antenna {read.antenna}</td>
                    <td>{read.rssi} dBm</td>
                    <td>
                      <span className={`signal-badge ${getSignalStrength(read.rssi)}`}>
                        {getSignalStrength(read.rssi)}
                      </span>
                    </td>
                    <td>{read.count}</td>
                    <td>{formatTimestamp(read.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
