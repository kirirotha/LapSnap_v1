import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Tabs,
  Tab,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Participant, CreateParticipantDto } from '../services/participantApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`participant-tabpanel-${index}`}
      aria-labelledby={`participant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

interface ParticipantModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (participant: CreateParticipantDto) => void;
  participant: Participant | null;
}

export const ParticipantModal: React.FC<ParticipantModalProps> = ({
  open,
  onClose,
  onSave,
  participant,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<CreateParticipantDto>({
    eventId: '',
    athleteId: '',
    bibNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    category: '',
    team: '',
    emergencyContact: '',
    emergencyPhone: '',
    paymentStatus: 'PENDING',
    waiver: 'NOT_SIGNED',
    status: 'REGISTERED',
  });

  useEffect(() => {
    if (participant) {
      setFormData({
        eventId: participant.eventId,
        athleteId: participant.athleteId || '',
        bibNumber: participant.bibNumber,
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email || '',
        phone: participant.phone || '',
        dateOfBirth: participant.dateOfBirth || '',
        gender: participant.gender || 'MALE',
        category: participant.category || '',
        team: participant.team || '',
        emergencyContact: participant.emergencyContact || '',
        emergencyPhone: participant.emergencyPhone || '',
        paymentStatus: participant.paymentStatus,
        waiver: participant.waiver || 'NOT_SIGNED',
        status: participant.status,
        shirtSize: participant.shirtSize || undefined,
        startWave: participant.startWave || undefined,
        seedTime: participant.seedTime || undefined,
        specialRequests: participant.specialRequests || undefined,
        registrationSource: participant.registrationSource || undefined,
      });
    } else {
      // Reset form for new participant
      setFormData({
        eventId: '',
        athleteId: '',
        bibNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'MALE',
        category: '',
        team: '',
        emergencyContact: '',
        emergencyPhone: '',
        paymentStatus: 'PENDING',
        waiver: 'NOT_SIGNED',
        status: 'REGISTERED',
      });
    }
    setTabValue(0);
  }, [participant, open]);

  const handleChange = (field: keyof CreateParticipantDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {participant ? 'Edit Participant' : 'Add Participant'}
      </DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="participant tabs">
          <Tab label="Basic Info" />
          <Tab label="Contact & Location" />
          <Tab label="Event Details" />
          <Tab label="Additional" />
        </Tabs>

        {/* Tab 1: Basic Info */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Event ID"
                value={formData.eventId}
                onChange={(e) => handleChange('eventId', e.target.value)}
                required
                fullWidth
                helperText="Enter the event ID this participant is registering for"
              />
              <TextField
                label="Athlete ID"
                value={formData.athleteId}
                onChange={(e) => handleChange('athleteId', e.target.value)}
                fullWidth
                helperText="Optional: Link to existing athlete"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Bib Number"
                value={formData.bibNumber}
                onChange={(e) => handleChange('bibNumber', e.target.value)}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  label="Gender"
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="NON_BINARY">Non-Binary</MenuItem>
                  <MenuItem value="PREFER_NOT_TO_SAY">Prefer Not to Say</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                fullWidth
                helperText="e.g., Elite, Age Group, Youth"
              />
            </Stack>

            <TextField
              label="Team"
              value={formData.team}
              onChange={(e) => handleChange('team', e.target.value)}
              fullWidth
            />
          </Stack>
        </TabPanel>

        {/* Tab 2: Contact & Location */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
            />
            <TextField
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Emergency Contact Name"
                value={formData.emergencyContact}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                fullWidth
              />
              <TextField
                label="Emergency Contact Phone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
        </TabPanel>

        {/* Tab 3: Event Details */}
        <TabPanel value={tabValue} index={2}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={formData.paymentStatus}
                  onChange={(e) => handleChange('paymentStatus', e.target.value)}
                  label="Payment Status"
                >
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="REFUNDED">Refunded</MenuItem>
                  <MenuItem value="COMP">Comp</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Waiver Status</InputLabel>
                <Select
                  value={formData.waiver}
                  onChange={(e) => handleChange('waiver', e.target.value)}
                  label="Waiver Status"
                >
                  <MenuItem value="NOT_SIGNED">Not Signed</MenuItem>
                  <MenuItem value="SIGNED_DIGITAL">Signed Digital</MenuItem>
                  <MenuItem value="SIGNED_PAPER">Signed Paper</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="REGISTERED">Registered</MenuItem>
                <MenuItem value="CHECKED_IN">Checked In</MenuItem>
                <MenuItem value="STARTED">Started</MenuItem>
                <MenuItem value="FINISHED">Finished</MenuItem>
                <MenuItem value="DNF">DNF</MenuItem>
                <MenuItem value="DNS">DNS</MenuItem>
                <MenuItem value="DQ">DQ</MenuItem>
              </Select>
            </FormControl>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Wave"
                value={formData.startWave || ''}
                onChange={(e) => handleChange('startWave', e.target.value)}
                fullWidth
                helperText="Start wave assignment"
              />
              <TextField
                label="Seed Time (seconds)"
                type="number"
                value={formData.seedTime || ''}
                onChange={(e) => handleChange('seedTime', parseInt(e.target.value) || undefined)}
                fullWidth
                helperText="Expected finish time in seconds"
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Shirt Size</InputLabel>
              <Select
                value={formData.shirtSize || ''}
                onChange={(e) => handleChange('shirtSize', e.target.value)}
                label="Shirt Size"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="XS">XS</MenuItem>
                <MenuItem value="S">S</MenuItem>
                <MenuItem value="M">M</MenuItem>
                <MenuItem value="L">L</MenuItem>
                <MenuItem value="XL">XL</MenuItem>
                <MenuItem value="XXL">XXL</MenuItem>
                <MenuItem value="XXXL">XXXL</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </TabPanel>

        {/* Tab 4: Additional */}
        <TabPanel value={tabValue} index={3}>
          <Stack spacing={2}>
            <TextField
              label="Special Requests"
              value={formData.specialRequests || ''}
              onChange={(e) => handleChange('specialRequests', e.target.value)}
              multiline
              rows={6}
              fullWidth
              helperText="Any additional information or special requirements"
            />
            <TextField
              label="Registration Source"
              value={formData.registrationSource || ''}
              onChange={(e) => handleChange('registrationSource', e.target.value)}
              fullWidth
              helperText="Where did this registration come from? (e.g., website, in-person, phone)"
            />
          </Stack>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {participant ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
