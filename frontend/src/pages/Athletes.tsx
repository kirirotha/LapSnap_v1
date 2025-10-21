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
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { athleteApi, Athlete, CreateAthleteDto } from '../services/athleteApi';
import { AthleteModal } from '../components/AthleteModal';
import './Athletes.css';

export const Athletes: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load athletes
  const loadAthletes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await athleteApi.getAll();
      setAthletes(data);
    } catch (error) {
      console.error('Error loading athletes:', error);
      showSnackbar('Failed to load athletes', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAthletes();
  }, [loadAthletes]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddClick = () => {
    setSelectedAthlete(null);
    setModalOpen(true);
  };

  const handleEditClick = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this athlete?')) {
      try {
        await athleteApi.delete(id);
        showSnackbar('Athlete deleted successfully', 'success');
        loadAthletes();
      } catch (error) {
        console.error('Error deleting athlete:', error);
        showSnackbar('Failed to delete athlete', 'error');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAthlete(null);
  };

  const handleSave = async (athleteData: CreateAthleteDto) => {
    try {
      if (selectedAthlete) {
        await athleteApi.update(selectedAthlete.id, athleteData);
        showSnackbar('Athlete updated successfully', 'success');
      } else {
        await athleteApi.create(athleteData);
        showSnackbar('Athlete created successfully', 'success');
      }
      handleModalClose();
      loadAthletes();
    } catch (error) {
      console.error('Error saving athlete:', error);
      showSnackbar('Failed to save athlete', 'error');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'Name',
      width: 200,
      valueGetter: (params, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 220,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'city',
      headerName: 'City',
      width: 150,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'teamAffiliation',
      headerName: 'Team',
      width: 150,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditClick(params.row as Athlete)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDeleteClick(params.row.id)}
        />,
      ],
    },
  ];

  const filteredAthletes = athletes.filter((athlete) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      athlete.firstName.toLowerCase().includes(searchLower) ||
      athlete.lastName.toLowerCase().includes(searchLower) ||
      athlete.email?.toLowerCase().includes(searchLower) ||
      athlete.phone?.includes(searchQuery)
    );
  });

  return (
    <div className="athletes-page">
      <Box className="page-header">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Athletes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage athlete profiles, registrations, and information
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleAddClick}
          size="large"
        >
          Add Athlete
        </Button>
      </Box>

      <Paper className="athletes-content">
        <Box className="table-toolbar">
          <TextField
            placeholder="Search athletes..."
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
            sx={{ minWidth: 300 }}
          />
          <Typography variant="body2" color="text.secondary">
            {filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <DataGrid
          rows={filteredAthletes}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
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

      <AthleteModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        athlete={selectedAthlete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};
