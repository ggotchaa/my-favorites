import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { NotificationDto } from '../api/GCPClient';
import { NotificationUtilities } from '../shared/helpers/Notification.utils';
import { SignalrtokenService } from './signalrtoken.service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  private notificationsSubject = new Subject<any>();
  private dsignCallbackNotificationsSubject = new Subject<any>();
  private isConnecting = false;

  public $notifications = this.notificationsSubject.asObservable();
  public $dsignCallbackNotifications = this.dsignCallbackNotificationsSubject.asObservable();

  constructor(private signalrtokenService: SignalrtokenService) {
    this.initializeConnection();
  }

  private initializeConnection() {
    this.getTokenAndConnect();

    this.signalrtokenService.accessTokenSubj.subscribe((token) => {
      if (!this.isConnecting) {
        this.manageConnection(token);
        this.isConnecting = true;
      }
    });
  }

  private startConnection = (token: string) => {
    const retryTimes = [0, 3000, 10000, 30000];

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.signalrtokenService.getSignalrUrl(), {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (context) => {
          const index =
            context.previousRetryCount < retryTimes.length
              ? context.previousRetryCount
              : retryTimes.length - 1;
          return retryTimes[index];
        },
      })
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
        this.isConnecting = false;
      })
      .catch((err) => {
        console.log('Error while starting connection: ' + err);
        this.isConnecting = false;
      });

    this.hubConnection.on('ReceiveNotification', (notification) => {
      const convertedNotification = this.convertNotification(notification);
      this.notificationsSubject.next(convertedNotification);
    });
    
    this.hubConnection.on('ReceiveBackgroundAction', (notification) => {
      const convertedNotification = this.convertNotificationDsign(notification);
      this.dsignCallbackNotificationsSubject.next(convertedNotification);
    });

    this.hubConnection.onreconnecting(() => {      
      this.getTokenAndConnect();
    });

    this.hubConnection.onreconnected(() => {
      console.log('Reconnected');
    });
  };

  private getTokenAndConnect() {
    this.signalrtokenService.getAccessToken().subscribe((token) => {
      if (!this.isConnecting) {
        this.manageConnection(token);
        this.isConnecting = true;
      }
    });
  }

  private manageConnection(token: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.stopConnection();
    }

    this.startConnection(token);
  }

  public stopConnection() {
    this.hubConnection
      .stop()
      .then(() => console.log('Connection stopped'))
      .catch((err) => console.log('Error while stopping  connection: ' + err));
  }

  private convertNotification(notification: any): NotificationDto {
    return {
      ...notification,
      status: NotificationUtilities.convertNotificationStatus(
        notification.status
      ),
      documentType: NotificationUtilities.convertNotificationDocumentType(
        notification.documentType
      ),
      responseDateTime: new Date(notification.responseDateTime),
      registrationNumber: notification.registrationNumber
    };
  }

  private convertNotificationDsign(notification: any): string {
    return notification.documentType
  }
}
