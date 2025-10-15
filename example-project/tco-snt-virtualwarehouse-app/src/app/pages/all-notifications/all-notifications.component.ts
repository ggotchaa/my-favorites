import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { NotificationTableDataSource } from 'src/app/model/dataSources/NotificationTableDataSource';
import { AllnotificationFiltersComponent } from './allnotification-filters/allnotification-filters.component';
import { NotificationFilterModel } from 'src/app/pages/all-notifications/allnotification-filters/allnotification-filters.model';
import { NotificationClient, NotificationDto } from 'src/app/api/GCPClient';
import { takeUntil, tap } from 'rxjs';
import { NotificationMessageService } from 'src/app/services/notification-message.service';

@Component({
    selector: 'app-all-notifications',
    templateUrl: './all-notifications.component.html',
    styleUrls: ['./all-notifications.component.scss'],
    providers: [NotificationTableDataSource],
    standalone: false
})
export class AllNotificationsComponent implements OnInit {
  title = 'Notifications';
  filterForm: UntypedFormGroup;  
  loadingReport = false;
  displayedColumns: string[] = [
    'actionType',
    'responseDateTime',
    'status',
  ];
  resultsLength = 0;
  pageSizeOptions = [15, 50, 100, 300, 1000];
  private filterNotification = new NotificationFilterModel();

  private statuses: {
    [statusEn: string]: string;
  } = {
    Successful: 'Успешно',
    Failed: 'Неуспешно',
    Queued: 'В очереди',
  };

  @ViewChild('notificationFilters')
  notificationFiltersComponent: AllnotificationFiltersComponent;
  @ViewChild('importButton') importButton: MatButton;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    notificationApi: NotificationClient,
    private titleService: Title,
    private notificationMessageService: NotificationMessageService,
    public dataSource: NotificationTableDataSource
  ) {
    this.titleService.setTitle('Все уведомления');
    this.dataSource.apiClient = notificationApi;
  }

  ngOnInit() {
    this.dataSource.loadingSubject.next(true);

    this.dataSource
      .loadSubjects(1, 15)
      .pipe(takeUntil(this.dataSource.subscription$))
      .subscribe((data) => {
        this.resultsLength = this.dataSource.pagingModel.totalRecords;
        this.dataSource.dataSourceSubjects.next(data);
      });
  }
  private loadDataSource(
    filter: NotificationFilterModel,
    pageIndex: number = 1,
    pageSize: number = 15
  ): void {
    this.dataSource.loadingSubject.next(true);
    this.dataSource
      .loadNotificationsWithFilters(filter, pageIndex, pageSize)
      .pipe(takeUntil(this.dataSource.subscription$))
      .subscribe((data) => {
        this.resultsLength = this.dataSource.pagingModel.totalRecords;
        this.dataSource.dataSourceSubjects.next(data);
      });
  }
  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => {
          if (this.notificationFiltersComponent.model) {
            this.loadDataSource(
              this.filterNotification,
              this.paginator.pageIndex + 1,
              this.paginator.pageSize
            );
          }
        }),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe();
  }

  filterNotifications(filter: NotificationFilterModel) {    
    this.dataSource.loadingSubject.next(true);
    this.filterNotification = filter;
    this.loadDataSource(
      filter,
      this.paginator.pageIndex + 1,
      this.paginator.pageSize
    );
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
    return this.notificationMessageService.generateNotificationMessage(notification);
  }
  
}
