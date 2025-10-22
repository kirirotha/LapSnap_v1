import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'races',
        element: <Races />,
      },
      {
        path: 'results',
        element: <Results />,
      },
      {
        path: 'practice',
        element: <PracticeMode />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'athletes',
        element: <Athletes />,
      },
      {
        path: 'participants',
        element: <Participants />,
      },
      {
        path: 'laps',
        element: <Laps />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
