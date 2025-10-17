import { api } from './api';

export interface Participant {
  id: string;
  eventId: string;
  athleteId?: string;
  bibNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  category?: string;
  team?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  registrationTime: string;
  registrationSource?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'WAIVED' | 'COMP';
  status: 'REGISTERED' | 'CHECKED_IN' | 'STARTED' | 'FINISHED' | 'DNF' | 'DNS' | 'DQ';
  shirtSize?: string;
  specialRequests?: string;
  waiver: 'NOT_SIGNED' | 'SIGNED_DIGITAL' | 'SIGNED_PAPER';
  waiverSignedAt?: string;
  seedTime?: number;
  startWave?: string;
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    name: string;
  };
  athlete?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateParticipantDto {
  eventId: string;
  athleteId?: string;
  bibNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  category?: string;
  team?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  registrationSource?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED' | 'WAIVED' | 'COMP';
  status?: 'REGISTERED' | 'CHECKED_IN' | 'STARTED' | 'FINISHED' | 'DNF' | 'DNS' | 'DQ';
  shirtSize?: string;
  specialRequests?: string;
  waiver?: 'NOT_SIGNED' | 'SIGNED_DIGITAL' | 'SIGNED_PAPER';
  seedTime?: number;
  startWave?: string;
}

export const participantApi = {
  // Get all participants
  getAll: async (): Promise<Participant[]> => {
    const response = await api.get('/participants');
    return response.data.data;
  },

  // Get single participant by ID
  getById: async (id: string): Promise<Participant> => {
    const response = await api.get(`/participants/${id}`);
    return response.data.data;
  },

  // Get participants by event
  getByEvent: async (eventId: string): Promise<Participant[]> => {
    const response = await api.get(`/participants/event/${eventId}`);
    return response.data.data;
  },

  // Create new participant
  create: async (participant: CreateParticipantDto): Promise<Participant> => {
    const response = await api.post('/participants', participant);
    return response.data.data;
  },

  // Update participant
  update: async (id: string, participant: Partial<CreateParticipantDto>): Promise<Participant> => {
    const response = await api.put(`/participants/${id}`, participant);
    return response.data.data;
  },

  // Delete participant
  delete: async (id: string): Promise<void> => {
    await api.delete(`/participants/${id}`);
  },

  // Search participants
  search: async (query: string): Promise<Participant[]> => {
    const response = await api.get(`/participants/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },
};
