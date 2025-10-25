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
  Paper,
  IconButton,
  Tooltip,
  InputAdornment,
  DialogContentText,
  Alert,
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Close as CloseIcon,
  QrCodeScanner as ScanIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Athlete, CreateAthleteDto } from '../services/athleteApi';
import { TagScanDialog } from './TagScanDialog';
import { athleteApi } from '../services/athleteApi';

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
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [reassignConfirmOpen, setReassignConfirmOpen] = useState(false);
  const [currentTagOwner, setCurrentTagOwner] = useState<{ firstName: string; lastName: string } | null>(null);
  const [pendingFormData, setPendingFormData] = useState<CreateAthleteDto | null>(null);
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
    defaultTagId: '',
    defaultNumber: '',
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
        defaultTagId: athlete.rfid_tags?.tagId || '',
        defaultNumber: athlete.defaultNumber || '',
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
        defaultTagId: '',
        defaultNumber: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up empty strings
    const cleanedData: any = { ...formData };
    Object.keys(cleanedData).forEach((key) => {
      if (cleanedData[key] === '') {
        cleanedData[key] = undefined;
      }
    });

    // Check if a tag is being assigned and if it's already owned by another athlete
    if (cleanedData.defaultTagId) {
      try {
        const response = await athleteApi.checkTagOwnership(
          cleanedData.defaultTagId,
          athlete?.id
        );
        
        if (response.owner) {
          // Tag is owned by another athlete, show confirmation dialog
          setCurrentTagOwner(response.owner);
          setPendingFormData(cleanedData);
          setReassignConfirmOpen(true);
          return;
        }
      } catch (error) {
        console.error('Error checking tag ownership:', error);
        // Continue with save if check fails
      }
    }

    // No conflict, save directly
    onSave(cleanedData);
  };

  const handleConfirmReassign = () => {
    setReassignConfirmOpen(false);
    if (pendingFormData) {
      onSave(pendingFormData);
      setPendingFormData(null);
      setCurrentTagOwner(null);
    }
  };

  const handleCancelReassign = () => {
    setReassignConfirmOpen(false);
    setPendingFormData(null);
    setCurrentTagOwner(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTagScanned = (tagId: string) => {
    setFormData({ ...formData, defaultTagId: tagId });
  };

  return (
    <>
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

              <Divider sx={{ my: 2 }} />

              {/* RFID Tag Assignment Section */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight="600">
                  RFID Tag Assignment
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Plate Number"
                      value={formData.defaultNumber || ''}
                      onChange={handleChange('defaultNumber')}
                      placeholder="Enter plate/bib number"
                      helperText="Race plate or bib number for this athlete"
                    />
                    <TextField
                      fullWidth
                      label="RFID Tag ID"
                      value={formData.defaultTagId}
                      onChange={handleChange('defaultTagId')}
                      placeholder="Scan or enter tag ID manually"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Scan RFID Tag">
                              <IconButton
                                onClick={() => setScanDialogOpen(true)}
                                color="primary"
                                edge="end"
                              >
                                <ScanIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      helperText="Assign an RFID tag to this athlete for automatic timing"
                    />
                  </Stack>
                </Paper>
              </Box>
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

    {/* Tag Scan Dialog */}
    <TagScanDialog
      open={scanDialogOpen}
      onClose={() => setScanDialogOpen(false)}
      onTagSelected={handleTagScanned}
      currentTagId={formData.defaultTagId}
    />

    {/* Tag Reassignment Confirmation Dialog */}
    <Dialog
      open={reassignConfirmOpen}
      onClose={handleCancelReassign}
      aria-labelledby="reassign-dialog-title"
      aria-describedby="reassign-dialog-description"
    >
      <DialogTitle id="reassign-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Reassign RFID Tag?
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This tag is currently assigned to another athlete
        </Alert>
        <DialogContentText id="reassign-dialog-description">
          {currentTagOwner && (
            <>
              The tag <strong>{pendingFormData?.defaultTagId}</strong> is currently assigned to{' '}
              <strong>{currentTagOwner.firstName} {currentTagOwner.lastName}</strong>.
              <br /><br />
              If you continue, the tag will be unassigned from {currentTagOwner.firstName} and 
              assigned to {formData.firstName || 'this athlete'}.
              <br /><br />
              Do you want to proceed with this reassignment?
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelReassign} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirmReassign} color="warning" variant="contained" autoFocus>
          Reassign Tag
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};
