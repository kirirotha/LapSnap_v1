import React, { useState } from 'react';
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
} from '@mui/material';
import { AntennaConfig, PracticeSessionSettings } from '../services/practiceApi';

interface Props {
  open: boolean;
  onClose: () => void;
  onStart: (settings: PracticeSessionSettings) => void;
}

const PracticeSettingsModal: React.FC<Props> = ({ open, onClose, onStart }) => {
  const [minLapTime, setMinLapTime] = useState<number>(5); // seconds
  const [antennas, setAntennas] = useState<AntennaConfig[]>([
    { antennaNumber: 1, isActive: true, powerLevel: 150 },
    { antennaNumber: 2, isActive: true, powerLevel: 150 },
    { antennaNumber: 3, isActive: false, powerLevel: 150 },
    { antennaNumber: 4, isActive: false, powerLevel: 150 },
  ]);

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
    onStart({
      minLapTime: minLapTime * 1000, // convert to milliseconds
      antennas,
    });
    onClose();
  };

  const activeAntennaCount = antennas.filter((a) => a.isActive).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Practice Mode Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Lap Settings
          </Typography>
          <TextField
            label="Minimum Lap Time (seconds)"
            type="number"
            value={minLapTime}
            onChange={(e) => setMinLapTime(Number(e.target.value))}
            fullWidth
            helperText="Laps completed faster than this time will be discarded"
            inputProps={{ min: 1, max: 300 }}
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Antenna Configuration
            {activeAntennaCount > 0 && (
              <Typography
                component="span"
                variant="body2"
                color="primary"
                sx={{ ml: 2 }}
              >
                ({activeAntennaCount} active)
              </Typography>
            )}
          </Typography>

          {antennas.map((antenna, index) => (
            <Box
              key={antenna.antennaNumber}
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: antenna.isActive ? 'action.hover' : 'inherit',
                borderRadius: 1,
                border: antenna.isActive ? '1px solid' : 'none',
                borderColor: antenna.isActive ? 'primary.main' : 'transparent',
              }}
            >
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={antenna.isActive}
                      onChange={() => handleAntennaToggle(index)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body1" fontWeight="medium">
                      Antenna {antenna.antennaNumber}
                    </Typography>
                  }
                />
                <Box>
                  <Typography
                    gutterBottom
                    variant="body2"
                    color={antenna.isActive ? 'text.primary' : 'text.disabled'}
                  >
                    Power: {(antenna.powerLevel / 10).toFixed(1)} dBm (Index:{' '}
                    {antenna.powerLevel})
                  </Typography>
                  <Slider
                    value={antenna.powerLevel}
                    onChange={(_, value) =>
                      handlePowerChange(index, value as number)
                    }
                    disabled={!antenna.isActive}
                    min={1}
                    max={200}
                    step={1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${(value / 10).toFixed(1)} dBm`}
                    marks={[
                      { value: 1, label: 'Min' },
                      { value: 100, label: 'Med' },
                      { value: 200, label: 'Max' },
                    ]}
                  />
                </Box>
              </Stack>
            </Box>
          ))}

          {activeAntennaCount === 0 && (
            <Typography color="error" variant="body2">
              ⚠️ At least one antenna must be active to start practice mode
            </Typography>
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
  );
};

export default PracticeSettingsModal;
