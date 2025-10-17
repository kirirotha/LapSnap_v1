import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Races } from './pages/Races';
import { Results } from './pages/Results';
import { PracticeMode } from './pages/PracticeMode';
import { Settings } from './pages/Settings';
import { Athletes } from './pages/Athletes';
import { Participants } from './pages/Participants';
import { Laps } from './pages/Laps';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/races" element={<Races />} />
          <Route path="/results" element={<Results />} />
          <Route path="/practice" element={<PracticeMode />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/athletes" element={<Athletes />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/laps" element={<Laps />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
