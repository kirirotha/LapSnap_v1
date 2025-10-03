export interface RaceEvent {
  type: 'race.started' | 'race.finished' | 'race.paused' | 'race.resumed';
  raceId: string;
  timestamp: Date;
  data?: any;
}

export interface ParticipantEvent {
  type: 'participant.registered' | 'participant.started' | 'participant.finished' | 'participant.lap_completed';
  participantId: string;
  raceId: string;
  timestamp: Date;
  data?: any;
}

export interface TagReadEventData {
  type: 'tag.read';
  tagRead: TagRead;
  timestamp: Date;
}

export interface SystemEvent {
  type: 'reader.connected' | 'reader.disconnected' | 'reader.error' | 'system.startup' | 'system.shutdown';
  readerId?: string;
  timestamp: Date;
  data?: any;
}

export type TimingEvent = RaceEvent | ParticipantEvent | TagReadEventData | SystemEvent;

// Import TagRead from tag-read.ts
import { TagRead } from './tag-read';