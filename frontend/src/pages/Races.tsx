import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface Race {
  id: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  maxLaps?: number;
  raceType: 'time-based' | 'lap-based' | 'unlimited';
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RaceFormData {
  name: string;
  description: string;
  startTime: string;
  raceType: 'time-based' | 'lap-based' | 'unlimited';
  duration?: number;
  maxLaps?: number;
}

const Races: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [formData, setFormData] = useState<RaceFormData>({
    name: '',
    description: '',
    startTime: new Date().toISOString().slice(0, 16),
    raceType: 'unlimited',
    duration: 60,
    maxLaps: 10,
  });

  const loadRaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now since backend isn't running
      const mockRaces: Race[] = [
        {
          id: '1',
          name: 'Morning 5K Race',
          description: 'Early morning race around the park',
          startTime: new Date('2025-10-04T08:00:00'),
          status: 'pending',
          raceType: 'lap-based',
          maxLaps: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Championship Race',
          description: 'Main championship event',
          startTime: new Date('2025-10-04T14:00:00'),
          status: 'active',
          raceType: 'time-based',
          duration: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      setRaces(mockRaces);
    } catch (err) {
      console.error('Failed to load races:', err);
      setError('Failed to load races. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRaces();
  }, []);

  const handleCreateRace = () => {
    setEditingRace(null);
    setFormData({
      name: '',
      description: '',
      startTime: new Date().toISOString().slice(0, 16),
      raceType: 'unlimited',
      duration: 60,
      maxLaps: 10,
    });
    setDialogOpen(true);
  };

  const handleEditRace = (race: Race) => {
    setEditingRace(race);
    setFormData({
      name: race.name,
      description: race.description || '',
      startTime: race.startTime.toISOString().slice(0, 16),
      raceType: race.raceType,
      duration: race.duration || 60,
      maxLaps: race.maxLaps || 10,
    });
    setDialogOpen(true);
  };

  const handleSubmitRace = async () => {
    try {
      // This would call the API when backend is connected
      console.log('Saving race:', formData);
      setDialogOpen(false);
      // For now, just close the dialog
    } catch (err) {
      console.error('Failed to save race:', err);
      setError('Failed to save race. Please try again.');
    }
  };

  const getStatusColor = (status: Race['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const getRaceTypeLabel = (type: Race['raceType']) => {
    switch (type) {
      case 'time-based': return 'Time Based';
      case 'lap-based': return 'Lap Based';
      default: return 'Unlimited';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading races...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Races
        </Typography>
        <Box>
          <IconButton onClick={loadRaces} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRace}
            sx={{ ml: 1 }}
          >
            Create Race
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration/Laps</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {races.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">
                    No races found. Create your first race to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              races.map((race) => (
                <TableRow key={race.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {race.name}
                      </Typography>
                      {race.description && (
                        <Typography variant="body2" color="textSecondary">
                          {race.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={race.status}
                      color={getStatusColor(race.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{getRaceTypeLabel(race.raceType)}</TableCell>
                  <TableCell>
                    {race.startTime.toLocaleDateString()} {race.startTime.toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    {race.raceType === 'time-based' && `${race.duration} min`}
                    {race.raceType === 'lap-based' && `${race.maxLaps} laps`}
                    {race.raceType === 'unlimited' && 'Unlimited'}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {race.status === 'pending' && (
                        <Tooltip title="Start Race">
                          <IconButton size="small" color="success">
                            <StartIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {race.status === 'active' && (
                        <>
                          <Tooltip title="Pause Race">
                            <IconButton size="small" color="warning">
                              <PauseIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Stop Race">
                            <IconButton size="small" color="error">
                              <StopIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Edit Race">
                        <IconButton
                          size="small"
                          onClick={() => handleEditRace(race)}
                          disabled={race.status === 'active'}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Race">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={race.status === 'active'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Race Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRace ? 'Edit Race' : 'Create New Race'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Race Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Race Type</InputLabel>
              <Select
                value={formData.raceType}
                label="Race Type"
                onChange={(e) => setFormData({ ...formData, raceType: e.target.value as any })}
              >
                <MenuItem value="unlimited">Unlimited</MenuItem>
                <MenuItem value="time-based">Time Based</MenuItem>
                <MenuItem value="lap-based">Lap Based</MenuItem>
              </Select>
            </FormControl>
            {formData.raceType === 'time-based' && (
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            )}
            {formData.raceType === 'lap-based' && (
              <TextField
                fullWidth
                label="Maximum Laps"
                type="number"
                value={formData.maxLaps}
                onChange={(e) => setFormData({ ...formData, maxLaps: parseInt(e.target.value) })}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitRace} variant="contained">
            {editingRace ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Races;