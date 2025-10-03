export interface TagRead {
  tagId: string;
  readerId: string;
  timestamp: Date;
  signalStrength: number;
  antennaId?: number;
  rawData?: any;
}

export interface TagReadEvent {
  id: string;
  tagRead: TagRead;
  processed: boolean;
  raceId?: string;
  participantId?: string;
  lapNumber?: number;
  splitTime?: number;
}