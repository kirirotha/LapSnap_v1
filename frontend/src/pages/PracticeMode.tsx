import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
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
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Settings as SettingsIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import PracticeSettingsModal from '../components/PracticeSettingsModal';
import { practiceApi, ActiveLap, CompletedLap, PracticeSessionSettings } from '../services/practiceApi';
import { lapApi, Lap } from '../services/lapApi';
import { io, Socket } from 'socket.io-client';
import { useNavigate, useBlocker } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeLaps, setActiveLaps] = useState<ActiveLap[]>([]);
  const [completedLaps, setCompletedLaps] = useState<CompletedLap[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [navigationDialogOpen, setNavigationDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [lapToCancel, setLapToCancel] = useState<ActiveLap | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [currentSettings, setCurrentSettings] = useState<PracticeSessionSettings | null>(null);
  const [showFastestLaps, setShowFastestLaps] = useState(false);

  // Load today's completed laps on mount
  useEffect(() => {
    const loadTodaysLaps = async () => {
      try {
        const allLaps = await lapApi.getAll();
        
        // Filter for today's completed laps
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaysCompletedLaps = allLaps
          .filter((lap) => {
            const lapDate = new Date(lap.startTime);
            lapDate.setHours(0, 0, 0, 0);
            return lap.status === 'COMPLETED' && lap.isValid && lapDate.getTime() === today.getTime();
          })
          .map((lap): CompletedLap => ({
            id: lap.id,
            tagEpc: lap.rfid_tags?.tagId || lap.tagId,
            tagId: lap.tagId,
            lapNumber: lap.lapNumber,
            startTime: new Date(lap.startTime),
            endTime: new Date(lap.endTime!),
            lapTime: lap.lapTime!,
            startAntenna: lap.startAntenna || 0,
            endAntenna: lap.endAntenna || 0,
            isValid: lap.isValid,
            athlete: lap.athletes || (lap.participants ? {
              id: lap.participants.id,
              firstName: lap.participants.firstName,
              lastName: lap.participants.lastName,
            } : undefined),
          }))
          .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())
          .slice(0, 50); // Keep last 50
        
        setCompletedLaps(todaysCompletedLaps);
      } catch (error) {
        console.error('Error loading today\'s laps:', error);
      }
    };

    loadTodaysLaps();
  }, []);

  // Block navigation if scanning is active
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isScanning && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle navigation blocking
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setNavigationDialogOpen(true);
      setPendingNavigation(() => () => {
        blocker.proceed?.();
      });
    }
  }, [blocker]);

  // Socket.IO connection for real-time lap updates
  const handleLapUpdate = useCallback((data: any) => {
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

      console.log('Removing lap from active laps:', completedLap.tagEpc);
      // Remove from active laps
      setActiveLaps((prev) => {
        const filtered = prev.filter((lap) => lap.tagEpc !== completedLap.tagEpc);
        console.log('Active laps before:', prev.length, 'after:', filtered.length);
        return filtered;
      });

      // Show appropriate message based on validity
      if (completedLap.isValid) {
        setCompletedLaps((prev) => [completedLap, ...prev].slice(0, 50));
        setSuccess(
          `Lap #${completedLap.lapNumber} completed: ${completedLap.tagEpc} - ${formatTime(completedLap.lapTime)}`
        );
      } else {
        // Still add invalid laps to completed laps list (so they're visible)
        // But show error message instead of success
        const invalidReason = data.lap.invalidReason || 'Invalid lap';
        if (invalidReason.includes('exceeds maximum')) {
          setError(`Lap #${completedLap.lapNumber} exceeded time limit: ${completedLap.tagEpc}`);
        } else if (invalidReason.includes('below minimum')) {
          setError(`Lap #${completedLap.lapNumber} too fast: ${completedLap.tagEpc} - ${formatTime(completedLap.lapTime)}`);
        } else {
          setError(`Lap #${completedLap.lapNumber} invalid: ${completedLap.tagEpc} - ${invalidReason}`);
        }
      }
    }
  }, []);

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
  }, [handleLapUpdate]);

  // Compute display laps based on toggle state
  const displayLaps = React.useMemo(() => {
    if (!showFastestLaps) {
      // Show all laps sorted by completion time (most recent first)
      return completedLaps;
    } else {
      // Show laps sorted by lap time (fastest first)
      return [...completedLaps].sort((a, b) => a.lapTime - b.lapTime);
    }
  }, [completedLaps, showFastestLaps]);

  const handleToggleLapsView = () => {
    setShowFastestLaps((prev) => !prev);
  };

  const handleStart = async (settings: PracticeSessionSettings) => {
    try {
      setLoading(true);
      setLoadingMessage('Initializing RFID scanner...');
      
      const session = await practiceApi.startSession(settings);
      setSessionId(session.event.id);
      setCurrentSettings(settings);
      setError('');

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

      setLoadingMessage('Configuring antennas and power levels...');
      
      // Start RFID scanner
      await fetch('http://localhost:3000/api/rfid/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antennas, power }),
      });

      setIsScanning(true);
      setLoading(false);
      setSuccess('Practice session started!');
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to start session');
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Stopping RFID scanner...');
      
      // Stop RFID scanning
      await fetch('http://localhost:3000/api/rfid/stop', {
        method: 'POST',
      });

      setLoadingMessage('Ending practice session...');
      
      // Stop practice session
      await practiceApi.stopSession();
      setIsScanning(false);
      setActiveLaps([]);
      setSessionId(null);
      setCurrentSettings(null);
      setLoading(false);
      setSuccess('Practice session stopped!');
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to stop session');
    }
  };

  const handleConfirmNavigation = async () => {
    setNavigationDialogOpen(false);
    
    try {
      // Stop the session
      await handleStop();
      
      // Proceed with navigation after stopping
      if (pendingNavigation) {
        pendingNavigation();
        setPendingNavigation(null);
      }
    } catch (err) {
      console.error('Error stopping session during navigation:', err);
      // Still allow navigation even if stop fails
      if (pendingNavigation) {
        pendingNavigation();
        setPendingNavigation(null);
      }
    }
  };

  const handleCancelNavigation = () => {
    setNavigationDialogOpen(false);
    setPendingNavigation(null);
    blocker.reset?.();
  };

  const handleOpenCancelDialog = (lap: ActiveLap) => {
    setLapToCancel(lap);
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setLapToCancel(null);
  };

  const handleConfirmCancelLap = async () => {
    if (!lapToCancel) return;

    try {
      setLoading(true);
      setLoadingMessage('Canceling lap...');

      // Update the lap status to CANCELED instead of deleting
      await lapApi.update(lapToCancel.id, {
        status: 'CANCELED',
        isValid: false,
        invalidReason: 'Canceled by user',
        lapTime: undefined,
        endTime: undefined,
      });

      // Remove from active laps
      setActiveLaps((prev) => prev.filter((lap) => lap.id !== lapToCancel.id));

      setSuccess(`Lap #${lapToCancel.lapNumber} canceled successfully`);
      handleCloseCancelDialog();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to cancel lap');
    } finally {
      setLoading(false);
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
      field: 'tagEpc', 
      headerName: 'Tag EPC',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'athlete',
      headerName: 'Athlete',
      flex: 1,
      minWidth: 150,
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
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'center' as const,
      sortable: false,
      filterable: false,
      hideable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton
          color="error"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenCancelDialog(params.row);
          }}
          title="Cancel Lap"
          aria-label="Cancel lap"
        >
          <CancelIcon />
        </IconButton>
      ),
    },
  ];

  const completedColumns: GridColDef[] = [
    { 
      field: 'tagEpc', 
      headerName: 'Tag EPC',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'athlete',
      headerName: 'Athlete',
      flex: 1,
      minWidth: 150,
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
          Practice session active - Min lap time: {currentSettings.minLapTime / 1000}s
          {currentSettings.maxLapTime && ` - Max lap time: ${currentSettings.maxLapTime / 1000}s`}
          {' - '}Active antennas: {currentSettings.antennas.filter((a) => a.isActive).map((a) => a.antennaNumber).join(', ')}
        </Alert>
      )}

      <Paper className="practice-section">
        <Typography variant="h6" gutterBottom>
          Active Laps ({activeLaps.length})
        </Typography>
        <DataGrid
          rows={activeLaps}
          columns={activeColumns}
          getRowId={(row) => row.id}
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
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': { 
              backgroundColor: 'action.hover',
              borderRadius: 1,
            },
            padding: 1,
            marginLeft: -1,
            marginTop: -1,
            marginBottom: 1,
          }}
          onClick={handleToggleLapsView}
        >
          <Typography variant="h6">
            {showFastestLaps 
              ? `Today's Fastest Laps (${displayLaps.length})` 
              : `Completed Laps - Today (${displayLaps.length})`}
          </Typography>
          <Chip 
            label={showFastestLaps ? 'Fastest' : 'Recent'} 
            size="small" 
            color={showFastestLaps ? 'secondary' : 'primary'}
            sx={{ ml: 2 }}
          />
        </Box>
        <DataGrid
          rows={displayLaps}
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      {/* Loading Overlay */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {loadingMessage}
        </Typography>
      </Backdrop>

      {/* Navigation Confirmation Dialog */}
      <Dialog
        open={navigationDialogOpen}
        onClose={handleCancelNavigation}
        aria-labelledby="navigation-dialog-title"
        aria-describedby="navigation-dialog-description"
      >
        <DialogTitle id="navigation-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          End Practice Session?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="navigation-dialog-description">
            You have an active practice session running. Leaving this page will stop the RFID scanner and end your session.
            <br /><br />
            <strong>Active Laps:</strong> {activeLaps.length}
            <br />
            <strong>Completed Laps:</strong> {completedLaps.length}
            <br /><br />
            Do you want to end the session and leave?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNavigation} color="inherit">
            Stay on Page
          </Button>
          <Button onClick={handleConfirmNavigation} color="warning" variant="contained" autoFocus>
            End Session & Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Lap Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        aria-labelledby="cancel-lap-dialog-title"
        aria-describedby="cancel-lap-dialog-description"
      >
        <DialogTitle id="cancel-lap-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Cancel Lap?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-lap-dialog-description">
            Are you sure you want to cancel this lap? This action cannot be undone.
            <br /><br />
            {lapToCancel && (
              <>
                <strong>Lap #:</strong> {lapToCancel.lapNumber}
                <br />
                <strong>Tag EPC:</strong> {lapToCancel.tagEpc}
                <br />
                <strong>Athlete:</strong> {lapToCancel.athlete 
                  ? `${lapToCancel.athlete.firstName} ${lapToCancel.athlete.lastName}` 
                  : 'Unknown'}
                <br />
                <strong>Started:</strong> {new Date(lapToCancel.startTime).toLocaleTimeString()}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="inherit">
            Keep Lap
          </Button>
          <Button onClick={handleConfirmCancelLap} color="error" variant="contained" autoFocus>
            Cancel Lap
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
