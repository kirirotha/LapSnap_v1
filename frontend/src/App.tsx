import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Races from './pages/Races';
import Results from './pages/Results';
// Import other pages as we create them
// import Participants from './pages/Participants';
// import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/races" element={<Races />} />
            <Route path="/participants" element={<div>Participants Page - Coming Soon</div>} />
            <Route path="/results" element={<Results />} />
            <Route path="/settings" element={<div>Settings Page - Coming Soon</div>} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
