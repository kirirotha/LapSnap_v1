import { api } from './api';

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  nationality?: string;
  city?: string;
  state?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  bloodType?: string;
  medicalConditions?: string;
  medications?: string;
  allergies?: string;
  profilePhoto?: string;
  teamAffiliation?: string;
  clubMembership?: string;
  sponsorships?: string;
  preferredCategories?: string;
  instagramHandle?: string;
  facebookProfile?: string;
  twitterHandle?: string;
  website?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  marketingOptIn: boolean;
  privacyLevel: 'PUBLIC' | 'REGISTERED_USERS_ONLY' | 'ORGANIZERS_ONLY' | 'PRIVATE';
  defaultTagId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

export interface CreateAthleteDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  nationality?: string;
  city?: string;
  state?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  bloodType?: string;
  medicalConditions?: string;
  medications?: string;
  allergies?: string;
  teamAffiliation?: string;
  clubMembership?: string;
  marketingOptIn?: boolean;
  privacyLevel?: 'PUBLIC' | 'REGISTERED_USERS_ONLY' | 'ORGANIZERS_ONLY' | 'PRIVATE';
  notes?: string;
}

export const athleteApi = {
  // Get all athletes
  getAll: async (): Promise<Athlete[]> => {
    const response = await api.get('/athletes');
    return response.data;
  },

  // Get single athlete by ID
  getById: async (id: string): Promise<Athlete> => {
    const response = await api.get(`/athletes/${id}`);
    return response.data;
  },

  // Create new athlete
  create: async (athlete: CreateAthleteDto): Promise<Athlete> => {
    const response = await api.post('/athletes', athlete);
    return response.data;
  },

  // Update athlete
  update: async (id: string, athlete: Partial<CreateAthleteDto>): Promise<Athlete> => {
    const response = await api.patch(`/athletes/${id}`, athlete);
    return response.data;
  },

  // Delete athlete
  delete: async (id: string): Promise<void> => {
    await api.delete(`/athletes/${id}`);
  },

  // Search athletes
  search: async (query: string): Promise<Athlete[]> => {
    const response = await api.get(`/athletes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};
