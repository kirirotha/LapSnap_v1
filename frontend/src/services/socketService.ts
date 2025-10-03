import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3000';

export interface SocketEvents {
  'race:update': (data: any) => void;
  'participant:update': (data: any) => void;
  'lap:completed': (data: any) => void;
  'tag:read': (data: any) => void;
  'race:status': (data: any) => void;
  'system:status': (data: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  // Event listeners
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Room management
  joinRace(raceId: string): void {
    this.emit('join:race', { raceId });
  }

  leaveRace(raceId: string): void {
    this.emit('leave:race', { raceId });
  }

  // Race-specific methods
  subscribeToRaceUpdates(raceId: string, callback: (data: any) => void): void {
    this.joinRace(raceId);
    this.on('race:update', (data) => {
      if (data.raceId === raceId) {
        callback(data);
      }
    });
  }

  subscribeToLapUpdates(raceId: string, callback: (data: any) => void): void {
    this.on('lap:completed', (data) => {
      if (data.raceId === raceId) {
        callback(data);
      }
    });
  }

  subscribeToParticipantUpdates(raceId: string, callback: (data: any) => void): void {
    this.on('participant:update', (data) => {
      if (data.raceId === raceId) {
        callback(data);
      }
    });
  }

  subscribeToTagReads(callback: (data: any) => void): void {
    this.on('tag:read', callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;