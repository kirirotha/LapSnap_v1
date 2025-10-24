import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Timer as TimerIcon,
  CheckCircle as ValidIcon,
  Cancel as InvalidIcon,
} from '@mui/icons-material';
import { lapApi, Lap } from '../services/lapApi';
import './Laps.css';

export const Laps: React.FC = () => {
  const [laps, setLaps] = useState<Lap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [validFilter, setValidFilter] = useState<string>('all');
  const [processedFilter, setProcessedFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lapToDelete, setLapToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load laps
  const loadLaps = useCallback(async () => {
    try {
      setLoading(true);
      const data = await lapApi.getAll();
      setLaps(data);
    } catch (error) {
      console.error('Error loading laps:', error);
      showSnackbar('Failed to load laps', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLaps();
  }, [loadLaps]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDeleteClick = (id: string) => {
    setLapToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (lapToDelete) {
      try {
        await lapApi.delete(lapToDelete);
        showSnackbar('Lap deleted successfully', 'success');
        loadLaps();
      } catch (error) {
        console.error('Error deleting lap:', error);
        showSnackbar('Failed to delete lap', 'error');
      }
    }
    setDeleteConfirmOpen(false);
    setLapToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setLapToDelete(null);
  };

  const handleToggleValid = async (lap: Lap) => {
    try {
      const newIsValid = !lap.isValid;
      const updateData: any = { 
        isValid: newIsValid,
      };
      
      // Update status when marking as invalid
      if (!newIsValid) {
        updateData.status = 'INVALID';
      } else if (lap.status === 'INVALID') {
        // If marking as valid and current status is INVALID, change to COMPLETED
        updateData.status = 'COMPLETED';
      }
      
      await lapApi.update(lap.id, updateData);
      showSnackbar(`Lap marked as ${newIsValid ? 'valid' : 'invalid'}`, 'success');
      loadLaps();
    } catch (error) {
      console.error('Error updating lap:', error);
      showSnackbar('Failed to update lap', 'error');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatLapTime = (milliseconds?: number) => {
    if (!milliseconds) return '-';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const columns: GridColDef[] = [
    {
      field: 'athleteName',
      headerName: 'Athlete',
      flex: 1,
      minWidth: 150,
      valueGetter: (params, row) => {
        // Use the captured athlete from the lap (athleteId relation)
        if (row.athletes) {
          return `${row.athletes.firstName} ${row.athletes.lastName}`;
        }
        // Fallback to participant if no athlete was captured
        if (row.participants) {
          return `${row.participants.firstName} ${row.participants.lastName}`;
        }
        return 'Unassigned';
      },
      renderCell: (params) => (
        <Tooltip title={params.value} arrow>
          <Box sx={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}>
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'tagId',
      headerName: 'Tag ID',
      flex: 1.2,
      minWidth: 170,
      valueGetter: (params, row) => row.rfid_tags?.tagId || row.tagId,
      renderCell: (params) => (
        <Tooltip title={params.value} arrow>
          <Box sx={{ 
            fontFamily: 'monospace', 
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}>
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'lapTime',
      headerName: 'Lap Time',
      flex: 0.6,
      minWidth: 110,
      renderCell: (params) => (
        params.value ? (
          <Chip
            label={formatLapTime(params.value)}
            color="success"
            size="small"
            icon={<TimerIcon />}
          />
        ) : (
          <span>-</span>
        )
      ),
    },
    {
      field: 'startTime',
      headerName: 'Start Time',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => formatTime(params.value),
    },
    {
      field: 'endTime',
      headerName: 'End Time',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => params.value ? formatTime(params.value) : '-',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.75,
      minWidth: 110,
      renderCell: (params) => {
        const statusColors: Record<string, 'success' | 'primary' | 'error' | 'warning' | 'default'> = {
          COMPLETED: 'success',
          IN_PROGRESS: 'primary',
          INVALID: 'error',
          DNF: 'warning',
          CANCELED: 'default',
        };
        return (
          <Chip
            label={params.value}
            color={statusColors[params.value] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 100,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={params.row.isValid ? <InvalidIcon /> : <ValidIcon />}
          label={params.row.isValid ? 'Mark Invalid' : 'Mark Valid'}
          onClick={() => handleToggleValid(params.row as Lap)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(params.row.id)}
        />,
      ],
    },
  ];

  const filteredLaps = laps.filter((lap) => {
    // Apply date range filter
    const lapDate = new Date(lap.startTime);
    const now = new Date();
    let matchesDateRange = true;

    if (dateRangeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDateRange = lapDate >= today && lapDate < tomorrow;
    } else if (dateRangeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      matchesDateRange = lapDate >= weekAgo;
    } else if (dateRangeFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);
      matchesDateRange = lapDate >= monthAgo;
    }
    // 'all' shows everything, no filter needed

    // Apply search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      lap.participants?.firstName.toLowerCase().includes(searchLower) ||
      lap.participants?.lastName.toLowerCase().includes(searchLower) ||
      lap.participants?.bibNumber.includes(searchQuery) ||
      lap.events?.name.toLowerCase().includes(searchLower) ||
      lap.checkpoints?.name?.toLowerCase().includes(searchLower) ||
      lap.rfid_tags?.tagId.toLowerCase().includes(searchLower) ||
      lap.tagId.toLowerCase().includes(searchLower);

    // Apply valid filter
    const matchesValid =
      validFilter === 'all' ||
      (validFilter === 'valid' && lap.isValid) ||
      (validFilter === 'invalid' && !lap.isValid);

    // Apply status filter (repurpose processed filter for status)
    const matchesStatus =
      processedFilter === 'all' ||
      (processedFilter === 'completed' && lap.status === 'COMPLETED') ||
      (processedFilter === 'in_progress' && lap.status === 'IN_PROGRESS');

    return matchesDateRange && matchesSearch && matchesValid && matchesStatus;
  });

  return (
    <div className="laps-page">
      <Box className="page-header">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Lap Times
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage RFID timing records
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<TimerIcon />}
          onClick={loadLaps}
        >
          Refresh
        </Button>
      </Box>

      <Paper className="laps-content">
        <Box className="table-toolbar">
          <Box className="filter-group">
            <ToggleButtonGroup
              value={dateRangeFilter}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  setDateRangeFilter(newValue);
                }
              }}
              aria-label="date range filter"
              size="small"
            >
              <ToggleButton value="today" aria-label="today">
                Today
              </ToggleButton>
              <ToggleButton value="week" aria-label="week">
                Week
              </ToggleButton>
              <ToggleButton value="month" aria-label="month">
                Month
              </ToggleButton>
              <ToggleButton value="all" aria-label="all">
                All
              </ToggleButton>
            </ToggleButtonGroup>
            <TextField
              placeholder="Search laps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Validity</InputLabel>
              <Select
                value={validFilter}
                onChange={(e) => setValidFilter(e.target.value)}
                label="Validity"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="valid">Valid</MenuItem>
                <MenuItem value="invalid">Invalid</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={processedFilter}
                onChange={(e) => setProcessedFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {filteredLaps.length} lap{filteredLaps.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <DataGrid
          rows={filteredLaps}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
            sorting: {
              sortModel: [{ field: 'startTime', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer',
            },
          }}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Lap Record?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this lap record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
