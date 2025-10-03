// API Endpoints
export const API_ENDPOINTS = {
  RACES: '/api/races',
  PARTICIPANTS: '/api/participants',
  RESULTS: '/api/results',
  TAG_READS: '/api/tag-reads',
  EVENTS: '/api/events',
} as const;

// WebSocket Events
export const WS_EVENTS = {
  RACE_UPDATE: 'race:update',
  PARTICIPANT_UPDATE: 'participant:update',
  LAP_COMPLETED: 'lap:completed',
  TAG_READ: 'tag:read',
  RACE_STATUS: 'race:status',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  MIN_LAP_TIME: 30, // seconds
  MAX_PARTICIPANTS: 1000,
  DEFAULT_RACE_DURATION: 60, // minutes
  READER_HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  TAG_READ_TIMEOUT: 5000, // 5 seconds
} as const;

// RFID Reader Settings
export const RFID_SETTINGS = {
  DEFAULT_POWER: 2700, // millidBm
  READ_INTERVAL: 100, // milliseconds
  ANTENNA_COUNT: 4,
  CONNECTION_TIMEOUT: 10000, // 10 seconds
} as const;