import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Slider,
  Typography,
  Box,
  Stack,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { AntennaConfig, PracticeSessionSettings } from '../services/practiceApi';
import { PracticeSettingsStorage, PracticeProfile } from '../services/practiceSettingsStorage';

interface Props {
  open: boolean;
  onClose: () => void;
  onStart: (settings: PracticeSessionSettings) => void;
  initialSettings?: PracticeSessionSettings;
}

const PracticeSettingsModal: React.FC<Props> = ({ open, onClose, onStart, initialSettings }) => {
  const [minLapTime, setMinLapTime] = useState<number>(5); // seconds
  const [maxLapTime, setMaxLapTime] = useState<number>(0); // seconds, 0 means no max
  const [antennas, setAntennas] = useState<AntennaConfig[]>([
    { antennaNumber: 1, isActive: true, powerLevel: 150 },
    { antennaNumber: 2, isActive: true, powerLevel: 150 },
    { antennaNumber: 3, isActive: false, powerLevel: 150 },
    { antennaNumber: 4, isActive: false, powerLevel: 150 },
  ]);

  const [profiles, setProfiles] = useState<PracticeProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [saveMode, setSaveMode] = useState<'new' | 'update'>('new'); // Track if saving new or updating
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load profiles and initial settings on mount
  useEffect(() => {
    if (open) {
      loadProfiles();
      
      // Load initial settings if provided, otherwise load last used
      if (initialSettings) {
        applySettings(initialSettings);
      } else {
        const lastProfile = PracticeSettingsStorage.getLastUsedProfile();
        if (lastProfile) {
          setSelectedProfileId(lastProfile.id);
          applySettings(lastProfile.settings);
        } else {
          const lastSettings = PracticeSettingsStorage.getLastUsedSettings();
          if (lastSettings) {
            applySettings(lastSettings);
          }
        }
      }
    }
  }, [open, initialSettings]);

  const loadProfiles = () => {
    const loadedProfiles = PracticeSettingsStorage.getProfiles();
    setProfiles(loadedProfiles);
  };

  const applySettings = (settings: PracticeSessionSettings) => {
    setMinLapTime(settings.minLapTime / 1000); // Convert ms to seconds
    setMaxLapTime(settings.maxLapTime ? settings.maxLapTime / 1000 : 0); // Convert ms to seconds
    setAntennas(settings.antennas);
  };

  const getCurrentSettings = (): PracticeSessionSettings => ({
    minLapTime: minLapTime * 1000,
    maxLapTime: maxLapTime > 0 ? maxLapTime * 1000 : undefined,
    antennas,
  });

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    if (profileId) {
      const profile = PracticeSettingsStorage.getProfile(profileId);
      if (profile) {
        applySettings(profile.settings);
      }
    }
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a profile name', severity: 'error' });
      return;
    }

    const settings = getCurrentSettings();
    
    if (saveMode === 'new') {
      // Always create a new profile when in 'new' mode
      const existingProfile = profiles.find(p => p.name.toLowerCase() === profileName.toLowerCase());
      
      if (existingProfile) {
        // Name conflict - ask to overwrite
        if (window.confirm(`A profile named "${profileName}" already exists. Overwrite it?`)) {
          PracticeSettingsStorage.updateProfile(existingProfile.id, profileName, settings);
          setSelectedProfileId(existingProfile.id);
          setSnackbar({ open: true, message: `Profile "${profileName}" updated!`, severity: 'success' });
        } else {
          return; // Cancel save
        }
      } else {
        // Save as new profile
        const newProfile = PracticeSettingsStorage.saveProfile(profileName, settings);
        setSelectedProfileId(newProfile.id);
        setSnackbar({ open: true, message: `Profile "${profileName}" saved!`, severity: 'success' });
      }
    } else {
      // Update mode - update the currently selected profile
      if (selectedProfileId && profiles.find(p => p.id === selectedProfileId)) {
        PracticeSettingsStorage.updateProfile(selectedProfileId, profileName, settings);
        setSnackbar({ open: true, message: `Profile "${profileName}" updated!`, severity: 'success' });
      }
    }
    
    loadProfiles();
    setShowSaveDialog(false);
    setProfileName('');
  };

  const handleDeleteProfile = () => {
    if (!selectedProfileId) return;

    const profile = profiles.find(p => p.id === selectedProfileId);
    if (profile && window.confirm(`Delete profile "${profile.name}"?`)) {
      PracticeSettingsStorage.deleteProfile(selectedProfileId);
      setSelectedProfileId('');
      setSnackbar({ open: true, message: 'Profile deleted', severity: 'success' });
      loadProfiles();
    }
  };

  const handleExportProfiles = () => {
    const json = PracticeSettingsStorage.exportProfiles();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-profiles-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Profiles exported!', severity: 'success' });
  };

  const handleImportProfiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (PracticeSettingsStorage.importProfiles(content)) {
        loadProfiles();
        setSnackbar({ open: true, message: 'Profiles imported!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to import profiles', severity: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleAntennaToggle = (index: number) => {
    setAntennas((prev) =>
      prev.map((ant, i) =>
        i === index ? { ...ant, isActive: !ant.isActive } : ant
      )
    );
  };

  const handlePowerChange = (index: number, value: number) => {
    setAntennas((prev) =>
      prev.map((ant, i) =>
        i === index ? { ...ant, powerLevel: value } : ant
      )
    );
  };

  const handleStart = () => {
    const settings = getCurrentSettings();
    
    // Save as last used settings
    PracticeSettingsStorage.saveLastUsedSettings(settings);
    
    // If a profile is selected, mark it as last used
    if (selectedProfileId) {
      PracticeSettingsStorage.setLastUsedProfile(selectedProfileId);
    }
    
    onStart(settings);
    onClose();
  };

  const activeAntennaCount = antennas.filter((a) => a.isActive).length;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Practice Mode Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {/* Profile Management Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Settings Profiles
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl fullWidth size="small">
                  <InputLabel>Load Profile</InputLabel>
                  <Select
                    value={selectedProfileId}
                    onChange={(e) => handleProfileChange(e.target.value)}
                    label="Load Profile"
                  >
                    <MenuItem value="">
                      <em>Manual Settings</em>
                    </MenuItem>
                    {profiles.map((profile) => (
                      <MenuItem key={profile.id} value={profile.id}>
                        {profile.name}
                        {PracticeSettingsStorage.getLastUsedProfileId() === profile.id && ' ★'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Tooltip title={selectedProfileId ? "Update Current Profile" : "Save as New Profile"}>
                  <IconButton onClick={() => {
                    if (selectedProfileId) {
                      const profile = profiles.find(p => p.id === selectedProfileId);
                      setProfileName(profile?.name || '');
                      setSaveMode('update');
                    } else {
                      setProfileName('');
                      setSaveMode('new');
                    }
                    setShowSaveDialog(true);
                  }} color="primary" size="small">
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Save as New Profile">
                  <IconButton onClick={() => {
                    setProfileName('');
                    setSaveMode('new');
                    setShowSaveDialog(true);
                  }} color="primary" size="small">
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete Profile">
                  <IconButton 
                    onClick={handleDeleteProfile} 
                    color="error"
                    disabled={!selectedProfileId}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Export">
                  <IconButton onClick={handleExportProfiles} color="primary" size="small">
                    <ExportIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Import">
                  <IconButton component="label" color="primary" size="small">
                    <ImportIcon fontSize="small" />
                    <input
                      type="file"
                      hidden
                      accept=".json"
                      onChange={handleImportProfiles}
                    />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Lap Settings
            </Typography>
            <TextField
              label="Min Lap Time (sec)"
              type="number"
              value={minLapTime}
              onChange={(e) => setMinLapTime(Number(e.target.value))}
              size="small"
              fullWidth
              helperText="Laps faster than this will be discarded"
              inputProps={{ min: 1, max: 300 }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Max Lap Time (sec)"
              type="number"
              value={maxLapTime}
              onChange={(e) => setMaxLapTime(Number(e.target.value))}
              size="small"
              fullWidth
              helperText="Laps slower than this will be marked invalid (0 = no limit)"
              inputProps={{ min: 0, max: 3600 }}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Antenna Configuration
              {activeAntennaCount > 0 && (
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  sx={{ ml: 1 }}
                >
                  ({activeAntennaCount} active)
                </Typography>
              )}
            </Typography>

            {antennas.map((antenna, index) => (
              <Box
                key={antenna.antennaNumber}
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  backgroundColor: antenna.isActive ? 'action.hover' : 'inherit',
                  borderRadius: 1,
                  border: antenna.isActive ? '1px solid' : '1px solid',
                  borderColor: antenna.isActive ? 'primary.main' : 'divider',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={antenna.isActive}
                        onChange={() => handleAntennaToggle(index)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight="medium">
                        Antenna {antenna.antennaNumber}
                      </Typography>
                    }
                    sx={{ minWidth: '110px', mr: 0 }}
                  />
                  <TextField
                    label="Power Index"
                    type="number"
                    value={antenna.powerLevel}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 1 && value <= 200) {
                        handlePowerChange(index, value);
                      }
                    }}
                    size="small"
                    disabled={!antenna.isActive}
                    inputProps={{ min: 1, max: 200, step: 1 }}
                    sx={{ width: '110px' }}
                  />
                  <Typography
                    variant="body2"
                    color={antenna.isActive ? 'text.primary' : 'text.disabled'}
                    sx={{ minWidth: '70px' }}
                  >
                    {(antenna.powerLevel / 10).toFixed(1)} dBm
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: '120px' }}>
                    <Slider
                      value={antenna.powerLevel}
                      onChange={(_, value) =>
                        handlePowerChange(index, value as number)
                      }
                      disabled={!antenna.isActive}
                      min={1}
                      max={200}
                      step={5}
                      size="small"
                    />
                  </Box>
                </Stack>
              </Box>
            ))}

            {activeAntennaCount === 0 && (
              <Alert severity="error" sx={{ mt: 1 }}>
                At least one antenna must be active
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleStart}
          variant="contained"
          color="primary"
          disabled={activeAntennaCount === 0}
          size="large"
        >
          Start Practice
        </Button>
      </DialogActions>
    </Dialog>

    {/* Save Profile Dialog */}
    <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {saveMode === 'update' ? `Update "${profileName}"` : 'Save as New Profile'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Profile Name"
          type="text"
          fullWidth
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="e.g., Indoor Race, Outdoor Training"
          helperText={
            saveMode === 'update'
              ? `Updating existing profile "${profileName}". Change name to save as new.`
              : "Enter a unique name for this settings profile"
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
        <Button onClick={handleSaveProfile} variant="contained" color="primary">
          {saveMode === 'update' ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Snackbar for notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </>
  );
};

export default PracticeSettingsModal;
