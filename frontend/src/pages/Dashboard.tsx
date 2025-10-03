import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Alert,
  Stack,
} from '@mui/material';
import {
  EmojiEvents as RaceIcon,
  People as PeopleIcon,
  Timer as TimerIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface DashboardStats {
  totalRaces: number;
  activeRaces: number;
  totalParticipants: number;
  activeParticipants: number;
  recentTagReads: number;
  systemStatus: 'online' | 'offline' | 'error';
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRaces: 0,
    activeRaces: 0,
    totalParticipants: 0,
    activeParticipants: 0,
    recentTagReads: 0,
    systemStatus: 'offline',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now since backend isn't running
      setStats({
        totalRaces: 5,
        activeRaces: 1,
        totalParticipants: 25,
        activeParticipants: 8,
        recentTagReads: 142,
        systemStatus: 'offline', // Will be online when backend is connected
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactElement; color: string }> = 
    ({ title, value, icon, color }) => (
    <Card sx={{ minWidth: 200, flex: 1 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <IconButton onClick={loadDashboardData} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ mb: 3, flexWrap: 'wrap' }}
      >
        <StatCard
          title="Total Races"
          value={stats.totalRaces}
          icon={<RaceIcon />}
          color="#1976d2"
        />
        <StatCard
          title="Active Races"
          value={stats.activeRaces}
          icon={<TimerIcon />}
          color="#2e7d32"
        />
        <StatCard
          title="Total Participants"
          value={stats.totalParticipants}
          icon={<PeopleIcon />}
          color="#ed6c02"
        />
        <StatCard
          title="Recent Tag Reads"
          value={stats.recentTagReads}
          icon={<TrendingUpIcon />}
          color="#9c27b0"
        />
      </Stack>

      {/* System Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Chip
              label={stats.systemStatus === 'online' ? 'System Online' : 'System Offline'}
              color={stats.systemStatus === 'online' ? 'success' : 'error'}
            />
            <Chip
              label={`${stats.activeParticipants} Active Participants`}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Placeholder for charts and activity */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tag Read Activity
            </Typography>
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography color="textSecondary">
                Real-time charts will appear here when backend services are connected.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography color="textSecondary">
                Activity feed will appear here when backend services are connected.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Dashboard;