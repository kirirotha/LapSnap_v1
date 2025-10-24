import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { lapApi, Lap } from '../services/lapApi';
import { Athlete } from '../services/athleteApi';

interface AthleteLapAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  athlete: Athlete | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lap-analysis-tabpanel-${index}`}
      aria-labelledby={`lap-analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const AthleteLapAnalysisModal: React.FC<AthleteLapAnalysisModalProps> = ({
  open,
  onClose,
  athlete,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && athlete) {
      loadAthleteLaps();
    }
  }, [open, athlete]);

  const loadAthleteLaps = async () => {
    if (!athlete) return;

    try {
      setLoading(true);
      setError(null);
      const allLaps = await lapApi.getAll();
      
      // Filter laps for this athlete
      const athleteLaps = allLaps.filter(
        lap => lap.athleteId === athlete.id && lap.status === 'COMPLETED'
      );
      
      setLaps(athleteLaps);
    } catch (err) {
      console.error('Error loading athlete laps:', err);
      setError('Failed to load lap data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Prepare data for the chart
  const chartData = [...laps]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map((lap, index) => ({
      lapNumber: index + 1,
      time: lap.lapTime ? lap.lapTime / 1000 : 0, // Convert to seconds
      date: new Date(lap.startTime).toLocaleDateString(),
    }));

  // Chronological laps (most recent first)
  const chronologicalLaps = [...laps].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // Ranked laps (fastest first)
  const rankedLaps = [...laps].sort((a, b) => {
    const durationA = a.lapTime || Infinity;
    const durationB = b.lapTime || Infinity;
    return durationA - durationB;
  });

  const formatDuration = (milliseconds: number | null) => {
    if (!milliseconds) return '-';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const lapColumns: GridColDef[] = [
    {
      field: 'startTime',
      headerName: 'Date',
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      },
    },
    {
      field: 'time',
      headerName: 'Time',
      width: 100,
      renderCell: (params) => {
        const date = new Date(params.row.startTime);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      field: 'duration',
      headerName: 'Lap Time',
      width: 130,
      renderCell: (params) => formatDuration(params.row.lapTime),
    },
  ];

  const rankedColumns: GridColDef[] = [
    {
      field: 'rank',
      headerName: 'Rank',
      width: 80,
      valueGetter: (params, row) => {
        const index = rankedLaps.findIndex(lap => lap.id === row.id);
        return index + 1;
      },
    },
    {
      field: 'duration',
      headerName: 'Lap Time',
      width: 130,
      renderCell: (params) => formatDuration(params.row.lapTime),
    },
    {
      field: 'startTime',
      headerName: 'Date',
      flex: 1,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) + ' ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Lap Analysis - {athlete?.firstName} {athlete?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Laps: {laps.length}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Performance Graph" />
            <Tab label="Recent Laps" />
            <Tab label="Best Times" />
          </Tabs>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            {/* Tab 1: Performance Graph */}
            <TabPanel value={tabValue} index={0}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="lapNumber" 
                      label={{ value: 'Lap Number', position: 'insideBottom', offset: -5 }}
                      tickFormatter={(value, index) => {
                        // Only show date on first and last value
                        if (index === 0 || index === chartData.length - 1) {
                          return chartData[index]?.date || value;
                        }
                        return value;
                      }}
                    />
                    <YAxis 
                      label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(3)}s`, 'Lap Time']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          const data = payload[0].payload;
                          return `Lap ${label} - ${data.date}`;
                        }
                        return `Lap ${label}`;
                      }}
                      isAnimationActive={false}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="time" 
                      stroke="#1976d2" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Lap Time"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No lap data available</Typography>
                </Paper>
              )}
            </TabPanel>

            {/* Tab 2: Chronological Laps */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={chronologicalLaps}
                  columns={lapColumns}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                />
              </Box>
            </TabPanel>

            {/* Tab 3: Ranked Laps */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={rankedLaps}
                  columns={rankedColumns}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-row:nth-of-type(1)': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      fontWeight: 600,
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                />
              </Box>
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
