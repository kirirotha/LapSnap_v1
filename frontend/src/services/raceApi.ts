import apiClient from './api';

// Shared types (you would normally import these from your shared package)
export interface Race {
  id: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  maxLaps?: number;
  raceType: 'time-based' | 'lap-based' | 'unlimited';
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  id: string;
  raceId: string;
  tagId: string;
  name: string;
  number: string;
  category?: string;
  team?: string;
  email?: string;
  phone?: string;
  registrationTime: Date;
  status: 'registered' | 'active' | 'dnf' | 'disqualified' | 'finished';
}

export interface ParticipantResult {
  participantId: string;
  raceId: string;
  totalLaps: number;
  totalTime: number;
  lastLapTime?: number;
  bestLapTime?: number;
  position?: number;
  status: 'racing' | 'finished' | 'dnf' | 'disqualified';
  lapTimes: LapTime[];
}

export interface LapTime {
  lapNumber: number;
  time: number;
  timestamp: Date;
  splitTimes?: SplitTime[];
}

export interface SplitTime {
  splitNumber: number;
  time: number;
  timestamp: Date;
}

export interface TagRead {
  tagId: string;
  readerId: string;
  timestamp: Date;
  signalStrength: number;
  antennaId?: number;
}

// Race API
export const raceApi = {
  getAllRaces: () => apiClient.get<Race[]>('/api/races'),
  getRace: (id: string) => apiClient.get<Race>(`/api/races/${id}`),
  createRace: (race: Omit<Race, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<Race>('/api/races', race),
  updateRace: (id: string, race: Partial<Race>) => 
    apiClient.put<Race>(`/api/races/${id}`, race),
  deleteRace: (id: string) => apiClient.delete(`/api/races/${id}`),
  startRace: (id: string) => apiClient.post(`/api/races/${id}/start`),
  stopRace: (id: string) => apiClient.post(`/api/races/${id}/stop`),
  pauseRace: (id: string) => apiClient.post(`/api/races/${id}/pause`),
  resumeRace: (id: string) => apiClient.post(`/api/races/${id}/resume`),
};

// Participant API
export const participantApi = {
  getParticipants: (raceId: string) => 
    apiClient.get<Participant[]>(`/api/races/${raceId}/participants`),
  getParticipant: (id: string) => 
    apiClient.get<Participant>(`/api/participants/${id}`),
  registerParticipant: (participant: Omit<Participant, 'id' | 'registrationTime'>) => 
    apiClient.post<Participant>('/api/participants', participant),
  updateParticipant: (id: string, participant: Partial<Participant>) => 
    apiClient.put<Participant>(`/api/participants/${id}`, participant),
  deleteParticipant: (id: string) => apiClient.delete(`/api/participants/${id}`),
  bulkRegister: (participants: Omit<Participant, 'id' | 'registrationTime'>[]) => 
    apiClient.post<Participant[]>('/api/participants/bulk', { participants }),
};

// Results API
export const resultsApi = {
  getRaceResults: (raceId: string) => 
    apiClient.get<ParticipantResult[]>(`/api/results/${raceId}`),
  getParticipantResult: (participantId: string) => 
    apiClient.get<ParticipantResult>(`/api/results/participant/${participantId}`),
  getLiveResults: (raceId: string) => 
    apiClient.get<ParticipantResult[]>(`/api/results/${raceId}/live`),
  exportResults: (raceId: string, format: 'csv' | 'pdf' | 'json') => 
    apiClient.get(`/api/results/${raceId}/export?format=${format}`, {
      responseType: 'blob'
    }),
};

// Tag reads API
export const tagReadsApi = {
  getTagReads: (raceId: string, limit = 100) => 
    apiClient.get<TagRead[]>(`/api/tag-reads?raceId=${raceId}&limit=${limit}`),
  getRecentTagReads: (minutes = 5) => 
    apiClient.get<TagRead[]>(`/api/tag-reads/recent?minutes=${minutes}`),
};

// System API
export const systemApi = {
  getSystemStatus: () => apiClient.get('/api/system/status'),
  getReaderStatus: () => apiClient.get('/api/system/readers'),
  testReader: (readerId: string) => apiClient.post(`/api/system/readers/${readerId}/test`),
};