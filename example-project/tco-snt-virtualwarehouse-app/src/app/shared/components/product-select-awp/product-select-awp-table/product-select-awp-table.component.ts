import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { AwpFilter } from '../../../../model/entities/Awp/AwpFilter';
import { AwpTableDataSource } from '../../../../model/dataSources/EInvoicing/AwpTableDataSource';
import { AwpClient, AwpStatus } from '../../../../api/GCPClient';
import { NotificationService } from '../../../../services/notification.service';
import { SntFacade } from '../../../../pages/snt/snt.facade';
import { AwpStatuses } from '../../../../model/lists/Awp/AwpStatuses';

@Component({
    selector: 'app-product-select-awp-table',
    templateUrl: './product-select-awp-table.component.html',
    styleUrls: ['./product-select-awp-table.component.scss'],
    providers: [AwpTableDataSource],
    standalone: false
})
export class ProductSelectAwpTableComponent implements OnInit{

  displayedColumns: string[] = ['select', 'registrationNumber', 'number', 'date', 'confirmationDate', 'senderTin', 'recipientTin', 'status'];  

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  currentFilter: AwpFilter;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() onItemSelected = new EventEmitter<any>();

  @Output() onClose = new EventEmitter<void>();


  selection = new SelectionModel<any>(true, []);  

  constructor(
    public dataSource: AwpTableDataSource,
    public awpApi: AwpClient,
    public notificationService: NotificationService) {
    dataSource.apiClient = awpApi;
  }
  ngOnInit(): void {
      this.dataSource.loadingSubject.next(false);
  }

  onCloseChange() {
    this.onClose.emit();
  }
  filter(filter: AwpFilter) {
    this.currentFilter = filter;
    this.loadAwps(this.currentFilter);
  }

  clearFilter() {
    this.currentFilter = new AwpFilter();;
    this.loadAwps(this.currentFilter);
  }

  select() {
    if (this.selection.selected.length > 0) {
      this.onItemSelected.emit(this.selection.selected[0]);
    }
  }

  loadAwps(filter: AwpFilter, pageIndex: number = 1, pageSize: number = 15) {
    this.dataSource.loadingSubject.next(true);
    this.dataSource.loadAwpWithFilters(filter, pageIndex, pageSize)
      .pipe(takeUntil(this.dataSource.subscription$))
      .subscribe(
        (data) => {
          this.dataSource.handleLoad(data);
          this.resultsLength = this.dataSource.pagingModel.totalRecords;
        },
        error => { this.notificationService.error(error) });
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => {
          if (this.currentFilter) {
            this.loadAwps(this.currentFilter, this.paginator.pageIndex + 1, this.paginator.pageSize);
          }
        }),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe();
  }

  getAwpStatusName(status: AwpStatus): string {
    return AwpStatuses.find(({ value }) => value === status)?.viewValue;
  }
}
