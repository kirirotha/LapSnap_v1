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
  totalTime: number; // in milliseconds
  lastLapTime?: number;
  bestLapTime?: number;
  position?: number;
  status: 'racing' | 'finished' | 'dnf' | 'disqualified';
  lapTimes: LapTime[];
}

export interface LapTime {
  lapNumber: number;
  time: number; // in milliseconds
  timestamp: Date;
  splitTimes?: SplitTime[];
}

export interface SplitTime {
  splitNumber: number;
  time: number; // in milliseconds
  timestamp: Date;
}