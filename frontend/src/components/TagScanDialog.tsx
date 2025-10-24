import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  Backdrop,
} from '@mui/material';
import {
  RadioButtonChecked as ScanIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';

// Backend server URL (not the API URL which has /api suffix)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

interface TagRead {
  epc: string;
  antenna: number;
  rssi: number;
  timestamp: string;
  count: number;
}

interface TagScanDialogProps {
  open: boolean;
  onClose: () => void;
  onTagSelected: (tagId: string) => void;
  currentTagId?: string;
}

export const TagScanDialog: React.FC<TagScanDialogProps> = ({
  open,
  onClose,
  onTagSelected,
  currentTagId,
}) => {
  const [scanning, setScanning] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [detectedTags, setDetectedTags] = useState<Map<string, TagRead>>(new Map());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Connect to WebSocket when dialog opens
  useEffect(() => {
    if (open) {
      const newSocket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });
      
      newSocket.on('connect', () => {
        console.log('WebSocket connected for tag scanning');
      });

      newSocket.on('rfid:status', (data: any) => {
        console.log('RFID status update received:', data);
        if (data.isScanning) {
          console.log('Scanner is now active, hiding initialization overlay');
          setInitializing(false);
        }
      });

      newSocket.on('rfid:tagRead', (data: TagRead) => {
        console.log('Tag detected:', data);
        // If we detect a tag, scanner must be initialized
        setInitializing(false);
        setDetectedTags(prev => {
          const updated = new Map(prev);
          updated.set(data.epc, data);
          return updated;
        });
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [open]);

  // Start scanning when dialog opens
  const startScanning = useCallback(async () => {
    try {
      setInitializing(true);
      setScanning(true);
      setError(null);
      setDetectedTags(new Map());
      
      // Fallback: Remove loading overlay after 2 seconds even if status event doesn't fire
      setTimeout(() => {
        console.log('Timeout fallback: hiding initialization overlay');
        setInitializing(false);
      }, 3000);
      
      const response = await fetch(`${BACKEND_URL}/api/rfid/quick-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antenna: 1, power: 5 }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to start scanning');
      }

      console.log('Quick scan started');
    } catch (err: any) {
      console.error('Error starting scan:', err);
      setError(err.message || 'Failed to start scanning. Make sure the RFID reader is connected.');
      setScanning(false);
      setInitializing(false);
    }
  }, []);

  // Stop scanning
  const stopScanning = useCallback(async () => {
    try {
      await fetch(`${BACKEND_URL}/api/rfid/stop`, {
        method: 'POST',
        credentials: 'include',
      });
      setScanning(false);
      console.log('Scanning stopped');
    } catch (err) {
      console.error('Error stopping scan:', err);
    }
  }, []);

  // Auto-start scanning when dialog opens
  useEffect(() => {
    if (open) {
      startScanning();
    } else {
      stopScanning();
    }
  }, [open, startScanning, stopScanning]);

  const handleSelectTag = (tagId: string) => {
    setSelectedTag(tagId);
  };

  const handleAssign = () => {
    if (selectedTag) {
      onTagSelected(selectedTag);
      stopScanning();
      onClose();
    }
  };

  const handleCancel = () => {
    stopScanning();
    onClose();
  };

  const sortedTags = Array.from(detectedTags.values()).sort((a, b) => b.rssi - a.rssi);

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <ScanIcon color={scanning ? 'primary' : 'disabled'} />
          <Typography variant="h6">Scan RFID Tag</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ position: 'relative', minHeight: 300 }}>
        {/* Loading Overlay for Scanner Initialization */}
        {initializing && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6">
              Initializing RFID Scanner...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configuring antennas and power levels
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          {scanning && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Scanning for RFID tags... Wave the tag near the reader.
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {currentTagId && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<WarningIcon />}>
              Current tag: <strong>{currentTagId}</strong>
              <br />
              Selecting a new tag will replace it.
            </Alert>
          )}

          {detectedTags.size === 0 && !error && (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'action.hover',
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Waiting for tag detection...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Make sure the RFID reader is powered on and connected
              </Typography>
            </Paper>
          )}

          {detectedTags.size > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Detected Tags ({detectedTags.size})
              </Typography>
              <Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto' }}>
                {sortedTags.map((tag) => (
                  <Paper
                    key={tag.epc}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: 2,
                      borderColor: selectedTag === tag.epc ? 'primary.main' : 'transparent',
                      bgcolor: selectedTag === tag.epc ? 'action.selected' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleSelectTag(tag.epc)}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {selectedTag === tag.epc && (
                        <CheckIcon color="primary" />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontFamily="monospace" fontWeight="600">
                          {tag.epc}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip
                            label={`Antenna ${tag.antenna}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`RSSI: ${tag.rssi} dBm`}
                            size="small"
                            color={tag.rssi > -50 ? 'success' : tag.rssi > -70 ? 'warning' : 'default'}
                          />
                          <Chip
                            label={`Reads: ${tag.count}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        {detectedTags.size > 0 && (
          <Button
            onClick={handleAssign}
            variant="contained"
            color="primary"
            disabled={!selectedTag}
          >
            Assign Selected Tag
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
