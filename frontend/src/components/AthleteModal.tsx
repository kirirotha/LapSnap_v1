import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Tabs,
  Tab,
  Divider,
  Stack,
} from '@mui/material';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import { Athlete, CreateAthleteDto } from '../services/athleteApi';

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
      id={`athlete-tabpanel-${index}`}
      aria-labelledby={`athlete-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

interface AthleteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (athlete: CreateAthleteDto) => void;
  athlete?: Athlete | null;
}

export const AthleteModal: React.FC<AthleteModalProps> = ({
  open,
  onClose,
  onSave,
  athlete,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<CreateAthleteDto>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: undefined,
    nationality: '',
    city: '',
    state: '',
    country: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    bloodType: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    teamAffiliation: '',
    clubMembership: '',
    marketingOptIn: false,
    privacyLevel: 'PUBLIC',
    notes: '',
  });

  useEffect(() => {
    if (athlete) {
      setFormData({
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        email: athlete.email || '',
        phone: athlete.phone || '',
        dateOfBirth: athlete.dateOfBirth ? athlete.dateOfBirth.split('T')[0] : '',
        gender: athlete.gender,
        nationality: athlete.nationality || '',
        city: athlete.city || '',
        state: athlete.state || '',
        country: athlete.country || '',
        emergencyContactName: athlete.emergencyContactName || '',
        emergencyContactPhone: athlete.emergencyContactPhone || '',
        emergencyContactRelation: athlete.emergencyContactRelation || '',
        bloodType: athlete.bloodType || '',
        medicalConditions: athlete.medicalConditions || '',
        medications: athlete.medications || '',
        allergies: athlete.allergies || '',
        teamAffiliation: athlete.teamAffiliation || '',
        clubMembership: athlete.clubMembership || '',
        marketingOptIn: athlete.marketingOptIn,
        privacyLevel: athlete.privacyLevel,
        notes: athlete.notes || '',
      });
    } else {
      // Reset form for new athlete
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: undefined,
        nationality: '',
        city: '',
        state: '',
        country: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        bloodType: '',
        medicalConditions: '',
        medications: '',
        allergies: '',
        teamAffiliation: '',
        clubMembership: '',
        marketingOptIn: false,
        privacyLevel: 'PUBLIC',
        notes: '',
      });
    }
    setTabValue(0);
  }, [athlete, open]);

  const handleChange = (field: keyof CreateAthleteDto) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up empty strings
    const cleanedData: any = { ...formData };
    Object.keys(cleanedData).forEach((key) => {
      if (cleanedData[key] === '') {
        cleanedData[key] = undefined;
      }
    });

    onSave(cleanedData);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {athlete ? 'Edit Athlete' : 'Add New Athlete'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Basic Info" />
              <Tab label="Contact & Location" />
              <Tab label="Emergency & Medical" />
              <Tab label="Additional" />
            </Tabs>
          </Box>

          {/* Tab 1: Basic Info */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                />
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange('email')}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleChange('dateOfBirth')}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender || ''}
                    onChange={handleChange('gender')}
                    label="Gender"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                    <MenuItem value="PREFER_NOT_TO_SAY">Prefer Not to Say</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </TabPanel>

          {/* Tab 2: Contact & Location */}
          <TabPanel value={tabValue} index={1}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={handleChange('city')}
                />
                <TextField
                  fullWidth
                  label="State/Province"
                  value={formData.state}
                  onChange={handleChange('state')}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={handleChange('country')}
                />
                <TextField
                  fullWidth
                  label="Nationality"
                  value={formData.nationality}
                  onChange={handleChange('nationality')}
                />
              </Stack>
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Team Information
                </Typography>
              </Divider>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Team Affiliation"
                  value={formData.teamAffiliation}
                  onChange={handleChange('teamAffiliation')}
                />
                <TextField
                  fullWidth
                  label="Club Membership"
                  value={formData.clubMembership}
                  onChange={handleChange('clubMembership')}
                />
              </Stack>
            </Stack>
          </TabPanel>

          {/* Tab 3: Emergency & Medical */}
          <TabPanel value={tabValue} index={2}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Emergency Contact
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={formData.emergencyContactName}
                  onChange={handleChange('emergencyContactName')}
                />
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange('emergencyContactPhone')}
                />
                <TextField
                  fullWidth
                  label="Relationship"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange('emergencyContactRelation')}
                />
              </Stack>
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Medical Information
                </Typography>
              </Divider>
              <TextField
                fullWidth
                label="Blood Type"
                value={formData.bloodType}
                onChange={handleChange('bloodType')}
                placeholder="e.g., A+, O-, AB+"
                sx={{ maxWidth: '50%' }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Medical Conditions"
                value={formData.medicalConditions}
                onChange={handleChange('medicalConditions')}
                placeholder="Any medical conditions we should be aware of..."
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Medications"
                value={formData.medications}
                onChange={handleChange('medications')}
                placeholder="Current medications..."
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Allergies"
                value={formData.allergies}
                onChange={handleChange('allergies')}
                placeholder="Any known allergies..."
              />
            </Stack>
          </TabPanel>

          {/* Tab 4: Additional */}
          <TabPanel value={tabValue} index={3}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Privacy Level</InputLabel>
                  <Select
                    value={formData.privacyLevel}
                    onChange={handleChange('privacyLevel')}
                    label="Privacy Level"
                  >
                    <MenuItem value="PUBLIC">Public</MenuItem>
                    <MenuItem value="REGISTERED_USERS_ONLY">Registered Users Only</MenuItem>
                    <MenuItem value="ORGANIZERS_ONLY">Organizers Only</MenuItem>
                    <MenuItem value="PRIVATE">Private</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.marketingOptIn || false}
                      onChange={handleChange('marketingOptIn')}
                    />
                  }
                  label="Marketing Opt-In"
                />
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={formData.notes}
                onChange={handleChange('notes')}
                placeholder="Additional notes about this athlete..."
              />
            </Stack>
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
            {athlete ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
