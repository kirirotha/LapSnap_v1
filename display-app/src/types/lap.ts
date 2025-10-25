export interface Lap {
  id: number;
  athleteId?: number;
  athleteName?: string;
  plateNumber?: string;
  lapTime: number;
  timestamp: string;
  status?: string;
}
