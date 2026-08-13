import * as signalR from '@microsoft/signalr';
import { localStorageService } from '@/services/local-storage-service';

export interface AdminRealtimeAlert {
  severity: 'critical' | 'warning' | 'info' | string;
  title: string;
  detail?: string;
  createdAt: string;
}

const HUB_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/hub/admin-alerts`
  : 'http://localhost:6174/hub/admin-alerts';

class AdminAlertsSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;
  private callbacks: Array<(alert: AdminRealtimeAlert) => void> = [];

  public async startConnection(): Promise<signalR.HubConnection | null> {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      return this.connection;
    }
    if (this.isConnecting) return null;
    this.isConnecting = true;
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => localStorageService.getAccessToken() || '',
        })
        .withAutomaticReconnect()
        .build();

      this.connection.on('ReceiveAlert', (alert: AdminRealtimeAlert) => {
        this.callbacks.forEach((cb) => {
          try {
            cb(alert);
          } catch (e) {
            console.error('AdminAlerts callback error', e);
          }
        });
      });

      await this.connection.start();
      return this.connection;
    } catch (err) {
      console.error('AdminAlerts SignalR connect failed', err);
      return null;
    } finally {
      this.isConnecting = false;
    }
  }

  public onAlert(cb: (alert: AdminRealtimeAlert) => void): () => void {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter((c) => c !== cb);
    };
  }

  public async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

export const adminAlertsSignalR = new AdminAlertsSignalRService();
