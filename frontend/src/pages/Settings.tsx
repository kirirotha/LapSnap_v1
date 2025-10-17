import React, { useState } from 'react';
import { ScanTest } from '../components/ScanTest';
import './Settings.css';

type SettingsTab = 'rfid' | 'general' | 'display' | 'advanced';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('rfid');

  const renderContent = () => {
    switch (activeTab) {
      case 'rfid':
        return <ScanTest />;
      case 'general':
        return (
          <div className="settings-content">
            <h2>General Settings</h2>
            <p>Configure general application settings.</p>
            {/* Add general settings here */}
          </div>
        );
      case 'display':
        return (
          <div className="settings-content">
            <h2>Display Settings</h2>
            <p>Customize the appearance and display options.</p>
            {/* Add display settings here */}
          </div>
        );
      case 'advanced':
        return (
          <div className="settings-content">
            <h2>Advanced Settings</h2>
            <p>Advanced configuration options.</p>
            {/* Add advanced settings here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-sidebar">
        <h3>Settings</h3>
        <nav className="settings-nav">
          <button
            className={`settings-nav-item ${activeTab === 'rfid' ? 'active' : ''}`}
            onClick={() => setActiveTab('rfid')}
          >
            <span className="nav-icon">📡</span>
            <span className="nav-label">RFID Scanner</span>
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">General</span>
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'display' ? 'active' : ''}`}
            onClick={() => setActiveTab('display')}
          >
            <span className="nav-icon">🎨</span>
            <span className="nav-label">Display</span>
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            <span className="nav-icon">🔧</span>
            <span className="nav-label">Advanced</span>
          </button>
        </nav>
      </div>
      <div className="settings-main">
        {renderContent()}
      </div>
    </div>
  );
};
