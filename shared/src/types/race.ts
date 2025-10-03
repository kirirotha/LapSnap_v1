export interface Race {
  id: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  maxLaps?: number;
  raceType: 'time-based' | 'lap-based' | 'unlimited';
  duration?: number; // in minutes for time-based races
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceSettings {
  raceId: string;
  minLapTime: number; // minimum lap time in seconds to prevent false reads
  maxParticipants?: number;
  autoStart: boolean;
  timingMode: 'chip' | 'manual' | 'hybrid';
}