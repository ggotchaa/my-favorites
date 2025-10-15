import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { defaultIfEmpty, Subscription } from 'rxjs';
import { NotificationClient, NotificationDto } from 'src/app/api/GCPClient';
import { NotificationService } from 'src/app/services/notification.service';
import { SignalRService } from 'src/app/services/signalr.service';
import { NotificationMessageService } from 'src/app/services/notification-message.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-notification-center',
    templateUrl: './notification-center.component.html',
    styleUrls: ['./notification-center.component.scss'],
    standalone: false
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: NotificationDto[] = [];
  notificationCount: number = 0;
  private notificationSubscription: Subscription;

  private statuses: {
    [statusEn: string]: string;
  } = {
    Successful: 'Успешно',
    Failed: 'Неуспешно',
    Queued: 'В очереди',
  };

  private audio = new Audio('assets/notification-sound.wav');

  constructor(
    private signalRService: SignalRService,
    private notificationClient: NotificationClient,
    private notificationService: NotificationService,
    private notificationMessageService: NotificationMessageService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.notificationSubscription =
      this.signalRService.$notifications.subscribe((notification) => {
        this.addNotification(notification);
        this.audio
          .play()
          .catch((error) =>
            console.error('Error playing notification sound: ', error)
          );
        this.showPopupNotification(notification);
      });

    this.getUnreadNotifications();
  }

  private updateNotificationCount() {
    this.notificationCount = this.notifications.length;
  }

  private getUnreadNotifications() {
    this.notificationClient
      .getUnreadNotifications()
      .subscribe((unreadNotifications) => {
        unreadNotifications.forEach((notification) =>
          this.addNotification(notification)
        );
      });
  }

  private addNotification(newNotification: NotificationDto) {
    if (
      !this.notifications.some(
        (notification) => notification.rowKey === newNotification.rowKey
      )
    ) {
      this.notifications.push(newNotification);
      this.updateNotificationCount();
    }
  }

  private showPopupNotification(notification: NotificationDto) {
    const regNo = this.isFieldDisplayed(notification, 'registrationNumber')
      ? `<br/>${notification.registrationNumber}`
      : '';
    const cancelReason = this.isFieldDisplayed(notification, 'cancelReason')
      ? `<br/>${notification.cancelReason}`
      : '';
    const formattedDate = this.datePipe.transform(
      notification.responseDateTime,
      'dd-MM-yyyy h:mm:ss'
    );
    const popupText = `<b>${this.getNotificationMessage(
      notification
    )}</b><br>${this.getStatusText(
      notification.status
    )}${regNo}${cancelReason}<br/>${formattedDate}`;
    
    switch (notification.status) {
      case 'Successful':
        this.notificationService.success(popupText);
        break;
      case 'Failed':
        this.notificationService.error(popupText);
        break;
      case 'Queued':
        this.notificationService.info(popupText);
        break;
    }
  }

  markAllAsRead() {
    if (this.notifications.length > 0) {
      this.notificationClient.markAsReadAll().pipe(defaultIfEmpty(true)).subscribe(() => {
        this.notifications = [];
        this.updateNotificationCount();
      });
    }
  }

  onBellIconClick() {
    this.getUnreadNotifications();
  }

  getIconByStatus(status: string): string {
    switch (status) {
      case 'Successful':
        return 'check_circle';
      case 'Failed':
        return 'cancel';
      case 'Queued':
        return 'pending';
    }
  }

  getIconColorByStatus(status: string): string {
    switch (status) {
      case 'Successful':
        return 'green';
      case 'Failed':
        return 'red';
      case 'Queued':
        return 'gray';
    }
  }

  getStatusText(status: string): string {
    const statusText = this.statuses[status];

    if (!statusText) {
      return 'Неизвестный статус';
    }

    return statusText;
  }

  isFieldDisplayed(notification: NotificationDto, fieldName: string): boolean {
    switch (fieldName) {
      case 'cancelReason':
        return notification.cancelReason && notification.status === 'Failed';
      case 'registrationNumber':
        return (
          notification.registrationNumber &&
          notification.actionType === 'CREATE' &&
          notification.status === 'Successful'
        );
      default:
        return false;
    }
  }

  getNotificationMessage(notification: NotificationDto): string[] {
    return this.notificationMessageService.generateNotificationMessage(
      notification
    );
  }

  getDisplayBadgeCount(count: number): string | null {
    if (!count || count < 1) {
      return null;
    }
    return count > 99 ? '99+' : count.toString();
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    this.signalRService.stopConnection();
  }
}
