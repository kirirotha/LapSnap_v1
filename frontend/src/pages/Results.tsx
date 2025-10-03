import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Button,
  Stack,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

interface Race {
  id: string;
  name: string;
  status: string;
}

interface ParticipantResult {
  participantId: string;
  participantName: string;
  participantNumber: string;
  raceId: string;
  totalLaps: number;
  totalTime: number;
  lastLapTime?: number;
  bestLapTime?: number;
  position?: number;
  status: 'racing' | 'finished' | 'dnf' | 'disqualified';
}

const Results: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>('');
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadRaces = async () => {
    try {
      // Mock data for now since backend isn't running
      const mockRaces: Race[] = [
        { id: '1', name: 'Morning 5K Race', status: 'pending' },
        { id: '2', name: 'Championship Race', status: 'active' },
      ];
      
      setRaces(mockRaces);
      
      // Auto-select first active race
      const activeRace = mockRaces.find(race => race.status === 'active');
      if (activeRace && !selectedRaceId) {
        setSelectedRaceId(activeRace.id);
      }
    } catch (err) {
      console.error('Failed to load races:', err);
      setError('Failed to load races.');
    }
  };

  const loadResults = async (raceId: string) => {
    if (!raceId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Mock results data
      const mockResults: ParticipantResult[] = [
        {
          participantId: '1',
          participantName: 'John Smith',
          participantNumber: '001',
          raceId,
          totalLaps: 5,
          totalTime: 1543000, // 25:43
          lastLapTime: 310000, // 5:10
          bestLapTime: 290000, // 4:50
          position: 1,
          status: 'racing',
        },
        {
          participantId: '2',
          participantName: 'Jane Doe',
          participantNumber: '002',
          raceId,
          totalLaps: 4,
          totalTime: 1320000, // 22:00
          lastLapTime: 335000, // 5:35
          bestLapTime: 305000, // 5:05
          position: 2,
          status: 'racing',
        },
        {
          participantId: '3',
          participantName: 'Mike Johnson',
          participantNumber: '003',
          raceId,
          totalLaps: 5,
          totalTime: 1650000, // 27:30
          status: 'finished',
          position: 3,
        },
      ];
      
      setResults(mockResults);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to load results:', err);
      setError('Failed to load results.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${Math.floor(ms / 100)}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${Math.floor(ms / 100)}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished': return 'success';
      case 'racing': return 'primary';
      case 'dnf': return 'warning';
      case 'disqualified': return 'error';
      default: return 'default';
    }
  };

  useEffect(() => {
    loadRaces();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedRaceId) {
      loadResults(selectedRaceId);
    }
  }, [selectedRaceId]);

  const selectedRace = races.find(race => race.id === selectedRaceId);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Live Results
        </Typography>
        <Box display="flex" gap={1}>
          <IconButton onClick={() => loadResults(selectedRaceId)} disabled={loading || !selectedRaceId}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={!selectedRaceId || results.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Race Selection and Info */}
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <Box sx={{ minWidth: 300 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Race</InputLabel>
                  <Select
                    value={selectedRaceId}
                    label="Select Race"
                    onChange={(e) => setSelectedRaceId(e.target.value)}
                  >
                    {races.map((race) => (
                      <MenuItem key={race.id} value={race.id}>
                        {race.name} - {race.status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {selectedRace && (
                <>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Race Status
                    </Typography>
                    <Chip 
                      label={selectedRace.status} 
                      color={selectedRace.status === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Participants
                    </Typography>
                    <Typography variant="h6">
                      {results.length}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
            {lastUpdate && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Results Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Position</TableCell>
                <TableCell>Number</TableCell>
                <TableCell>Participant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Laps</TableCell>
                <TableCell>Total Time</TableCell>
                <TableCell>Last Lap</TableCell>
                <TableCell>Best Lap</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">
                      {!selectedRaceId 
                        ? 'Select a race to view results' 
                        : loading 
                          ? 'Loading results...' 
                          : 'No participants found'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result, index) => (
                  <TableRow key={result.participantId}>
                    <TableCell>
                      <Typography variant="h6" color="primary">
                        {result.position || index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        #{result.participantNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {result.participantName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={result.status} 
                        color={getStatusColor(result.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TimerIcon fontSize="small" color="action" />
                        {result.totalLaps}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {formatTime(result.totalTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {result.lastLapTime ? formatTime(result.lastLapTime) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" color="success.main">
                        {result.bestLapTime ? formatTime(result.bestLapTime) : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Box>
  );
};

export default Results;