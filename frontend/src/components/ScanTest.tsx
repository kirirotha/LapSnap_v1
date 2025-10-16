import React, { useState, useEffect } from 'react';
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
  const [, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ReaderStatus>({
    connected: false,
    scanning: false,
    activeAntennas: [],
    tagCount: 0,
    lastRead: null
  });
  const [tagReads, setTagReads] = useState<TagRead[]>([]);
  const [selectedAntennas, setSelectedAntennas] = useState<number[]>([1, 2, 3, 4]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('rfid:status', (newStatus: ReaderStatus) => {
      console.log('Received rfid:status event:', newStatus);
      setStatus(newStatus);
    });

    newSocket.on('rfid:tagRead', (tagRead: TagRead) => {
      setTagReads(prev => [tagRead, ...prev].slice(0, 100));
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch initial status
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/rfid/status');
      if (response.data.success) {
        setStatus(response.data.status);
      }
    } catch (err: any) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleStartScanning = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('API baseURL:', api.defaults.baseURL);
      console.log('Making request to /rfid/start');
      
      const response = await api.post('/rfid/start', {
        antennas: selectedAntennas
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
      
      {/* Status Panel */}
      <div className="status-panel">
        <h3>Reader Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">Connection:</span>
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
