import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Races } from './pages/Races';
import { Results } from './pages/Results';
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
