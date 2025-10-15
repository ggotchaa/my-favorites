import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { of, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { SntClient, SntSimpleDto } from 'src/app/api/GCPClient';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { SntFilterDto } from 'src/app/model/entities/Snt/SntFilterDto';
import { SntTableDataSource } from '../../../../model/dataSources/SntTableDataSource';
import { SntFilter } from '../../../../pages/snt/snt-filters/snt-filters.model';
import { NotificationService } from '../../../../services/notification.service';
import { SntStatus } from '../../../../model/enums/SntStatus';

@Component({
    selector: 'app-product-select-snt-table',
    templateUrl: './product-select-snt-table.component.html',
    styleUrls: ['./product-select-snt-table.component.scss'],
    providers: [SntTableDataSource],
    standalone: false
})
export class ProductSelectSntTableComponent{

  displayedColumns: string[] = ['select', 'registrationNumber', 'number', 'date', 'senderTin', 'recipientTin', 'status', 'lastUpdateDate'];  

  resultsLength = 0;
  currentFilter: SntFilter;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  selection = new SelectionModel<SntSimpleDto>(false, []);

  @Output() onItemSelected = new EventEmitter<SntSimpleDto>();  
  @Output() onClose = new EventEmitter<void>();

  SntStatus = SntStatus;
  
  constructor(
    public dataSource: SntTableDataSource,
    public sntApi: SntClient,
    public notificationService: NotificationService) {
      dataSource.apiClient = sntApi;
  }    

  filter(filterDto: SntFilter) {
    this.currentFilter = filterDto;
    this.loadSnts(this.currentFilter);
  }

  clearFilter() {
    this.currentFilter = new SntFilter();
    this.loadSnts(this.currentFilter);
  }

  onCloseChange() {
    this.onClose.emit();
  }

  select() {
    if (this.selection.selected.length > 0) {
      this.onItemSelected.emit(this.selection.selected[0]);
    }
  }

  loadSnts(filter: SntFilter, pageIndex: number = 1, pageSize: number = 15) {    
    this.dataSource.loadingSubject.next(true);
    this.dataSource.loadSntList(filter, pageIndex, pageSize)
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
            this.loadSnts(this.currentFilter, this.paginator.pageIndex + 1, this.paginator.pageSize);
          }
        }),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe();       
  }

  ngOnInit(): void {
    this.dataSource.loadingSubject.next(false);
  }
}

