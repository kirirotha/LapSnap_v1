import { useEffect, useState } from 'react';
import { lapApi } from '../services/api';
import type { Lap } from '../types/lap';
import './RecentLaps.css';

interface RecentLapsProps {
  isDarkMode?: boolean;
  isFullscreen?: boolean;
  onToggleDarkMode?: () => void;
}

function RecentLaps({ isDarkMode, isFullscreen: isFullscreenProp = false, onToggleDarkMode }: RecentLapsProps) {
  const [laps, setLaps] = useState<Lap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchLaps = async () => {
      try {
        setLoading(true);
        const data = await lapApi.getAll();
        // Sort by start time (most recent first)
        const sortedLaps = [...data].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLaps(sortedLaps);
        setError(null);
      } catch (err) {
        setError('Failed to load laps');
        console.error('Error fetching laps:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLaps();
    
    // Refresh data every 5 seconds
    const interval = setInterval(fetchLaps, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const formatLapTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const formatTimestamp = (timestamp: string): string => {
    // Parse the timestamp and manually adjust for Central Time (UTC-5)
    const date = new Date(timestamp);
    
    // Subtract 5 hours (in milliseconds)
    const centralDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    return formatter.format(centralDate);
  };

  const getAthleteName = (lap: Lap): string => {
    return lap.athleteName || 'Unknown';
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  if (loading && laps.length === 0) {
    return (
      <div className="recent-laps">
        <div className="loading">Loading laps...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recent-laps">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="recent-laps">
      <div className="page-header">
        <h2 className="page-title">Recent Laps</h2>
        <div className="header-controls">
          {isFullscreenProp && (
            <button 
              className="dark-mode-toggle" 
              onClick={() => {
                onToggleDarkMode?.();
              }}
              title="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          )}
          <button 
            className="fullscreen-btn" 
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="laps-table">
          <thead>
            <tr>
              <th>Athlete Name</th>
              <th>Plate #</th>
              <th>Lap Time</th>
              <th>Start Time</th>
            </tr>
          </thead>
          <tbody>
            {laps.length === 0 ? (
              <tr>
                <td colSpan={4} className="no-data">No laps recorded yet</td>
              </tr>
            ) : (
              laps.map((lap) => (
                <tr 
                  key={lap.id}
                  className={lap.status === 'IN_PROGRESS' ? 'in-progress' : ''}
                >
                  <td className="athlete-name">{getAthleteName(lap)}</td>
                  <td className="plate-number">{lap.plateNumber || '-'}</td>
                  <td className="lap-time">
                    {lap.status === 'IN_PROGRESS' ? (
                      <span className="loading-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </span>
                    ) : (
                      formatLapTime(lap.lapTime)
                    )}
                  </td>
                  <td>{formatTimestamp(lap.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentLaps;
