import { api } from './api';

export interface Lap {
  id: string;
  eventId: string;
  participantId?: string;
  tagId: string;
  checkpointId: string;
  lapNumber: number;
  startTime: string;
  endTime?: string;
  lapTime?: number; // in milliseconds
  status: 'IN_PROGRESS' | 'COMPLETED' | 'INVALID' | 'DNF';
  startAntenna?: number;
  endAntenna?: number;
  startTimeRecordId?: string;
  endTimeRecordId?: string;
  isValid: boolean;
  invalidReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  events?: {
    id: string;
    name: string;
  };
  participants?: {
    id: string;
    firstName: string;
    lastName: string;
    bibNumber: string;
  };
  checkpoints?: {
    id: string;
    name: string;
  };
  rfid_tags?: {
    id: string;
    tagId: string;
  };
}

export interface CreateLapDto {
  eventId: string;
  participantId?: string;
  tagId: string;
  checkpointId: string;
  lapNumber: number;
  startTime: string;
  endTime?: string;
  lapTime?: number;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'INVALID' | 'DNF';
  startAntenna?: number;
  endAntenna?: number;
  isValid?: boolean;
  invalidReason?: string;
  notes?: string;
}

export const lapApi = {
  // Get all laps
  getAll: async (): Promise<Lap[]> => {
    const response = await api.get('/laps');
    return response.data.data || response.data;
  },

  // Get single lap by ID
  getById: async (id: string): Promise<Lap> => {
    const response = await api.get(`/laps/${id}`);
    return response.data.data || response.data;
  },

  // Get laps by event
  getByEvent: async (eventId: string): Promise<Lap[]> => {
    const response = await api.get(`/laps/event/${eventId}`);
    return response.data.data || response.data;
  },

  // Get laps by participant
  getByParticipant: async (participantId: string): Promise<Lap[]> => {
    const response = await api.get(`/laps/participant/${participantId}`);
    return response.data.data || response.data;
  },

  // Create new lap
  create: async (lap: CreateLapDto): Promise<Lap> => {
    const response = await api.post('/laps', lap);
    return response.data.data || response.data;
  },

  // Update lap
  update: async (id: string, lap: Partial<CreateLapDto>): Promise<Lap> => {
    const response = await api.put(`/laps/${id}`, lap);
    return response.data.data || response.data;
  },

  // Delete lap
  delete: async (id: string): Promise<void> => {
    await api.delete(`/laps/${id}`);
  },

  // Search laps
  search: async (query: string): Promise<Lap[]> => {
    const response = await api.get(`/laps/search?q=${encodeURIComponent(query)}`);
    return response.data.data || response.data;
  },
};
