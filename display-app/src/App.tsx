import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import RecentLaps from './pages/RecentLaps';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recent-laps'>('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const DarkModeToggle = () => (
    <button 
      className="dark-mode-toggle" 
      onClick={() => setIsDarkMode(!isDarkMode)}
      title={isDarkMode ? 'Light mode' : 'Dark mode'}
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
  );

  return (
    <div className="app">
      {!isFullscreen && (
        <nav className="navbar">
          <h1 className="app-title">SnapLaps</h1>
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-tab ${activeTab === 'recent-laps' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent-laps')}
            >
              Recent Laps
            </button>
          </div>
          <DarkModeToggle />
        </nav>
      )}

      <main className="content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'recent-laps' && <RecentLaps isDarkMode={isDarkMode} isFullscreen={isFullscreen} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      </main>
    </div>
  );
}

export default App;
