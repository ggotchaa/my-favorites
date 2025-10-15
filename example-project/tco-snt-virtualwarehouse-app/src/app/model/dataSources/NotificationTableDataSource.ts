import { Observable, of, Subject } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import {
  NotificationClient,
  NotificationDto,
  PagingModel,  
} from 'src/app/api/GCPClient';
import { DataSourceBaseEntity } from '../DataSourceBaseEntity';
import { Injectable } from '@angular/core';
import { NotificationFilterModel } from 'src/app/pages/all-notifications/allnotification-filters/allnotification-filters.model';

@Injectable()
export class NotificationTableDataSource extends DataSourceBaseEntity<
  NotificationDto,
  NotificationClient
> {
  subscription$: Subject<void> = new Subject<void>();
  public loading = this.loadingSubject.asObservable();
  public pagingModel: PagingModel;
  constructor() {
    super();
  }
  loadSubjects(pageIndex = 1, pageSize = 1000): Observable<NotificationDto[]> {
    return this.apiClient.get(null, null, null, null, null, pageIndex, pageSize).pipe(
      tap((res) => (this.pagingModel = res.paging)),
      map((res) => res.notifications),
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  loadNotificationsWithFilters(
    filter: NotificationFilterModel,
    pageIndex = 1,
    pageSize = 100
  ): Observable<NotificationDto[]> {
    return this.apiClient
      .get(
        filter.dateFrom,
        filter.dateTo,
        filter.documentTypes,
        filter.actionTypes,
        null,
        pageIndex,
        pageSize
      )
      .pipe(
        tap((res) => (this.pagingModel = res.paging)),
        map((res) => res.notifications),
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      );
  }
}
