import React, { useState, useEffect } from 'react';
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
import { participantApi, Participant, CreateParticipantDto } from '../services/participantApi';
import { ParticipantModal } from '../components/ParticipantModal';
import './Participants.css';

export const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load participants
  const loadParticipants = async () => {
    try {
      setLoading(true);
      const data = await participantApi.getAll();
      setParticipants(data);
    } catch (error) {
      console.error('Error loading participants:', error);
      showSnackbar('Failed to load participants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddClick = () => {
    setSelectedParticipant(null);
    setModalOpen(true);
  };

  const handleEditClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      try {
        await participantApi.delete(id);
        showSnackbar('Participant deleted successfully', 'success');
        loadParticipants();
      } catch (error) {
        console.error('Error deleting participant:', error);
        showSnackbar('Failed to delete participant', 'error');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedParticipant(null);
  };

  const handleSave = async (participantData: CreateParticipantDto) => {
    try {
      if (selectedParticipant) {
        await participantApi.update(selectedParticipant.id, participantData);
        showSnackbar('Participant updated successfully', 'success');
      } else {
        await participantApi.create(participantData);
        showSnackbar('Participant created successfully', 'success');
      }
      handleModalClose();
      loadParticipants();
    } catch (error) {
      console.error('Error saving participant:', error);
      showSnackbar('Failed to save participant', 'error');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'bibNumber',
      headerName: 'Bib #',
      width: 80,
    },
    {
      field: 'fullName',
      headerName: 'Name',
      width: 200,
      valueGetter: (params, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      field: 'eventName',
      headerName: 'Event',
      width: 180,
      valueGetter: (params, row) => row.event?.name || '-',
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 140,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'PAID' ? 'success' :
            params.value === 'PENDING' ? 'warning' :
            params.value === 'COMP' ? 'info' : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'FINISHED' ? 'success' :
            params.value === 'STARTED' ? 'primary' :
            params.value === 'CHECKED_IN' ? 'info' :
            params.value === 'REGISTERED' ? 'default' : 'error'
          }
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
          onClick={() => handleEditClick(params.row as Participant)}
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

  const filteredParticipants = participants.filter((participant) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      participant.firstName.toLowerCase().includes(searchLower) ||
      participant.lastName.toLowerCase().includes(searchLower) ||
      participant.bibNumber.includes(searchQuery) ||
      participant.email?.toLowerCase().includes(searchLower) ||
      participant.phone?.includes(searchQuery) ||
      participant.event?.name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="participants-page">
      <Box className="page-header">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Participants
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage event participants and registrations
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleAddClick}
          size="large"
        >
          Add Participant
        </Button>
      </Box>

      <Paper className="participants-content">
        <Box className="table-toolbar">
          <TextField
            placeholder="Search participants..."
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
            {filteredParticipants.length} participant{filteredParticipants.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <DataGrid
          rows={filteredParticipants}
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

      <ParticipantModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        participant={selectedParticipant}
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
