import * as signalR from '@microsoft/signalr';
import { localStorageService } from '@/services/local-storage-service';
import type { SosAlert } from './sosService';

const HUB_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/hub/sos`
  : 'http://localhost:6174/hub/sos';

class SosSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;
  private receiveCallbacks: Array<(alert: SosAlert) => void> = [];
  private resolveCallbacks: Array<(sosId: string) => void> = [];

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
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Register multiplexed event handlers
      this.connection.on('ReceiveSosAlert', (alert: SosAlert) => {
        console.log('SignalR Broadcast ReceiveSosAlert:', alert);
        this.receiveCallbacks.forEach((cb) => {
          try {
            cb(alert);
          } catch (e) {
            console.error('Error in ReceiveSosAlert callback:', e);
          }
        });
      });

      this.connection.on('SosAlertResolved', (sosId: string) => {
        console.log('SignalR Broadcast SosAlertResolved:', sosId);
        this.resolveCallbacks.forEach((cb) => {
          try {
            cb(sosId);
          } catch (e) {
            console.error('Error in SosAlertResolved callback:', e);
          }
        });
      });

      await this.connection.start();
      console.log('SignalR SOS Hub Connected in Admin Portal');

      // Automatically join Admin group
      await this.connection.invoke('JoinAdminGroup');

      this.isConnecting = false;
      return this.connection;
    } catch (err) {
      console.warn('SignalR SOS Hub Connection failed in Admin Portal:', err);
      this.isConnecting = false;
      return null;
    }
  }

  public onReceiveSosAlert(callback: (alert: SosAlert) => void) {
    this.receiveCallbacks.push(callback);
    // Ensure connection is active
    this.startConnection();
    return () => {
      this.receiveCallbacks = this.receiveCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  public onSosAlertResolved(callback: (sosId: string) => void) {
    this.resolveCallbacks.push(callback);
    this.startConnection();
    return () => {
      this.resolveCallbacks = this.resolveCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  public async stopConnection() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

export const sosSignalRService = new SosSignalRService();
