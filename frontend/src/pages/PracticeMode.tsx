import React, { useState, useEffect, useRef, memo } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Settings as SettingsIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import PracticeSettingsModal from '../components/PracticeSettingsModal';
import { practiceApi, ActiveLap, CompletedLap, PracticeSessionSettings } from '../services/practiceApi';
import { io, Socket } from 'socket.io-client';
import './PracticeMode.css';

// Smooth elapsed time display using requestAnimationFrame
const SmoothElapsedTime = memo(({ startTime }: { startTime: Date }) => {
  const [elapsed, setElapsed] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const start = new Date(startTime).getTime();
      setElapsed(now - start);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [startTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds
      .toString()
      .padStart(3, '0')}`;
  };

  return <>{formatTime(elapsed)}</>;
});

SmoothElapsedTime.displayName = 'SmoothElapsedTime';

export const PracticeMode: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeLaps, setActiveLaps] = useState<ActiveLap[]>([]);
  const [completedLaps, setCompletedLaps] = useState<CompletedLap[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [currentSettings, setCurrentSettings] = useState<PracticeSessionSettings | null>(null);

  // Socket.IO connection for real-time lap updates
  useEffect(() => {
    const socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('Practice Mode: Socket connected');
    });

    socket.on('practice:lapUpdate', handleLapUpdate);

    socket.on('disconnect', () => {
      console.log('Practice Mode: Socket disconnected');
    });

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  const handleLapUpdate = (data: any) => {
    console.log('Lap update received:', data);

    if (data.type === 'lap_started') {
      const newLap: ActiveLap = {
        id: data.lap.id,
        tagEpc: data.lap.rfid_tags.tagId,
        tagId: data.lap.tagId,
        lapNumber: data.lap.lapNumber, // Now from laps table
        startTime: new Date(data.lap.startTime),
        startAntenna: data.lap.startAntenna || 0,
        athlete: data.lap.athlete,
      };
      setActiveLaps((prev) => [newLap, ...prev]);
      setSuccess(`Lap #${newLap.lapNumber} started: ${newLap.tagEpc}`);
    } else if (data.type === 'lap_completed') {
      const completedLap: CompletedLap = {
        id: data.lap.id,
        tagEpc: data.lap.rfid_tags.tagId,
        tagId: data.lap.tagId,
        lapNumber: data.lap.lapNumber, // Now from laps table
        startTime: new Date(data.lap.startTime), // Add start time
        endTime: new Date(data.lap.endTime),
        lapTime: data.lap.lapTime,
        startAntenna: data.lap.startAntenna,
        endAntenna: data.lap.endAntenna,
        isValid: data.lap.isValid,
        athlete: data.lap.athlete,
      };

      // Remove from active laps
      setActiveLaps((prev) => prev.filter((lap) => lap.tagEpc !== completedLap.tagEpc));

      // Add to completed laps if valid
      if (completedLap.isValid) {
        setCompletedLaps((prev) => [completedLap, ...prev].slice(0, 50));
        setSuccess(
          `Lap #${completedLap.lapNumber} completed: ${completedLap.tagEpc} - ${formatTime(completedLap.lapTime)}`
        );
      } else {
        setError(`Lap #${completedLap.lapNumber} too fast: ${completedLap.tagEpc} - ${formatTime(completedLap.lapTime)}`);
      }
    }
  };

  const handleStart = async (settings: PracticeSessionSettings) => {
    try {
      const session = await practiceApi.startSession(settings);
      setSessionId(session.event.id);
      setCurrentSettings(settings);
      setIsScanning(true);
      setError('');
      setSuccess('Practice session started!');

      // Start RFID scanning with antenna configuration
      const antennas = settings.antennas
        .filter((a) => a.isActive)
        .map((a) => a.antennaNumber);

      const power: Record<number, number> = {};
      settings.antennas
        .filter((a) => a.isActive)
        .forEach((a) => {
          power[a.antennaNumber] = a.powerLevel;
        });

      // Start RFID scanner
      await fetch('http://localhost:3000/api/rfid/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antennas, power }),
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to start session');
    }
  };

  const handleStop = async () => {
    try {
      // Stop RFID scanning
      await fetch('http://localhost:3000/api/rfid/stop', {
        method: 'POST',
      });

      // Stop practice session
      await practiceApi.stopSession();
      setIsScanning(false);
      setActiveLaps([]);
      setSessionId(null);
      setCurrentSettings(null);
      setSuccess('Practice session stopped!');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to stop session');
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds
      .toString()
      .padStart(3, '0')}`;
  };

  const activeColumns: GridColDef[] = [
    { 
      field: 'lapNumber', 
      headerName: 'Lap #', 
      width: 80,
      align: 'center',
    },
    { 
      field: 'tagEpc', 
      headerName: 'Tag EPC', 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'athlete',
      headerName: 'Athlete',
      width: 180,
      valueGetter: (value, row) =>
        row.athlete
          ? `${row.athlete.firstName} ${row.athlete.lastName}`
          : 'Unknown',
    },
    { 
      field: 'startAntenna', 
      headerName: 'Antenna', 
      width: 100,
      align: 'center',
    },
    {
      field: 'startTime',
      headerName: 'Elapsed Time',
      width: 150,
      renderCell: (params) => (
        <Chip
          icon={<TimerIcon />}
          label={<SmoothElapsedTime startTime={params.value} />}
          color="primary"
          size="small"
        />
      ),
    },
  ];

  const completedColumns: GridColDef[] = [
    { field: 'lapNumber', headerName: 'Lap #', width: 80, align: 'center' },
    { 
      field: 'tagEpc', 
      headerName: 'Tag EPC', 
      width: 220,
      renderCell: (params) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'athlete',
      headerName: 'Athlete',
      width: 200,
      valueGetter: (value, row) =>
        row.athlete
          ? `${row.athlete.firstName} ${row.athlete.lastName}`
          : 'Unknown',
    },
    {
      field: 'lapTime',
      headerName: 'Lap Time',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={formatTime(params.value)}
          color="success"
          size="small"
          variant="filled"
        />
      ),
    },
    {
      field: 'endTime',
      headerName: 'Completed At',
      width: 180,
      valueGetter: (value) =>
        new Date(value).toLocaleTimeString(),
    },
  ];

  return (
    <Box className="practice-mode-container">
      <Box className="practice-header">
        <Typography variant="h4" component="h1">
          Practice Mode
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton 
            onClick={() => setSettingsOpen(true)}
            disabled={isScanning}
            color="primary"
          >
            <SettingsIcon />
          </IconButton>
          {!isScanning ? (
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrow />}
              onClick={() => setSettingsOpen(true)}
              size="large"
            >
              Start Practice
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={handleStop}
              size="large"
            >
              Stop Practice
            </Button>
          )}
        </Stack>
      </Box>

      {isScanning && currentSettings && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Practice session active - Min lap time: {currentSettings.minLapTime / 1000}s - Active
          antennas: {currentSettings.antennas.filter((a) => a.isActive).map((a) => a.antennaNumber).join(', ')}
        </Alert>
      )}

      <Paper className="practice-section">
        <Typography variant="h6" gutterBottom>
          Active Laps ({activeLaps.length})
        </Typography>
        <DataGrid
          rows={activeLaps}
          columns={activeColumns}
          autoHeight
          disableRowSelectionOnClick
          hideFooter={activeLaps.length <= 10}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Paper>

      <Paper className="practice-section">
        <Typography variant="h6" gutterBottom>
          Completed Laps (Last 50)
        </Typography>
        <DataGrid
          rows={completedLaps}
          columns={completedColumns}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      <PracticeSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onStart={handleStart}
        initialSettings={currentSettings || undefined}
      />

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};
