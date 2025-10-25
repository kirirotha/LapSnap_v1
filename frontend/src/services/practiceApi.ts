import api from './api';

export interface AntennaConfig {
  antennaNumber: number;
  isActive: boolean;
  powerLevel: number;
}

export interface PracticeSessionSettings {
  minLapTime: number; // milliseconds
  maxLapTime?: number; // milliseconds - optional, laps exceeding this will be marked invalid
  antennas: AntennaConfig[];
}

export interface ActiveLap {
  id: string;
  tagEpc: string;
  tagId: string;
  lapNumber?: number; // Lap number from laps table
  plateNumber?: string; // Direct plate number assigned to the lap
  startTime: Date;
  startAntenna: number;
  athlete?: {
    id: string;
    firstName: string;
    lastName: string;
    defaultNumber?: string;
  };
}

export interface CompletedLap {
  id: string;
  tagEpc: string;
  tagId: string;
  lapNumber?: number; // Lap number from laps table
  plateNumber?: string; // Direct plate number assigned to the lap
  lapTime: number;
  startTime?: Date; // Add start time for reference
  endTime: Date;
  startAntenna: number;
  endAntenna: number;
  isValid: boolean;
  athlete?: {
    id: string;
    firstName: string;
    lastName: string;
    defaultNumber?: string;
  };
}

export interface SessionStats {
  activeLaps: number;
  completedLaps: number;
  invalidLaps: number;
  fastestLap: number | null;
  slowestLap: number | null;
  averageLap: number | null;
}

export const practiceApi = {
  /**
   * Start a new practice session
   */
  async startSession(settings: PracticeSessionSettings) {
    const response = await api.post('/practice/session/start', settings);
    return response.data.data;
  },

  /**
   * Stop the current practice session
   */
  async stopSession() {
    const response = await api.post('/practice/session/stop');
    return response.data.data;
  },

  /**
   * Get the active practice session
   */
  async getActiveSession() {
    const response = await api.get('/practice/session/active');
    return response.data.data;
  },

  /**
   * Get active laps (laps in progress)
   */
  async getActiveLaps(): Promise<ActiveLap[]> {
    const response = await api.get('/practice/laps/active');
    return response.data.data;
  },

  /**
   * Get completed laps
   */
  async getCompletedLaps(limit: number = 50): Promise<CompletedLap[]> {
    const response = await api.get(`/practice/laps/completed?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<SessionStats> {
    const response = await api.get('/practice/stats');
    return response.data.data;
  },

  /**
   * Update session settings
   */
  async updateSettings(settings: Partial<PracticeSessionSettings>) {
    const response = await api.patch('/practice/session/settings', settings);
    return response.data.data;
  },

  /**
   * Get practice session history
   */
  async getPracticeHistory() {
    const response = await api.get('/practice/history');
    return response.data.data;
  },
};
