import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <nav className="nav">
        <h1>LapSnap Race Timing</h1>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/races">Races</Link></li>
          <li><Link to="/results">Results</Link></li>
          <li><Link to="/practice">Practice Mode</Link></li>
          <li><Link to="/athletes">Athletes</Link></li>
          <li><Link to="/participants">Participants</Link></li>
          <li><Link to="/laps">Laps</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
