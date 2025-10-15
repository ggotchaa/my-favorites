import { Observable, of, Subject } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { PagingModel, SntCategory, SntClient, SntExportType, SntFilterType, SntImportType, SntListResponseDto, SntSimpleDto, SntStatus, SntTransferType, SntType, SortingOrder } from "src/app/api/GCPClient";
import { SntFilter } from '../../pages/snt/snt-filters/snt-filters.model';
import { DataSourceBaseEntity } from "../DataSourceBaseEntity";
import { Injectable } from "@angular/core";

@Injectable()
export class SntTableDataSource extends DataSourceBaseEntity<SntSimpleDto, SntClient>  {
  subscription$: Subject<void> = new Subject<void>();

  public loading = this.loadingSubject.asObservable();
  public pagingModel: PagingModel;

  constructor() {
    super()
  }
  loadSubjects(pageIndex = 1, pageSize = 1000): Observable<SntSimpleDto[]> {
    let dateTo = new Date();
    let dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDay() - 7)
    dateFrom.toDateOnly()
    dateTo.toDateOnly()
    return this.apiClient.getAll(
      dateFrom, dateTo, null, null, null,
      null, null, null, null, null, null,
      null, null, null, null, null,
      null,
      null,
      undefined,
      pageIndex,
      pageSize )
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.snts),      
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
  }

  loadSntWithFilters(filter: SntFilter, pageIndex: number = 1, pageSize: number = 1000): Observable<SntSimpleDto[]> {
    return this.apiClient.getAll(
      filter.dateFrom,
      filter.dateTo,
      filter.type ? <SntFilterType>filter.type : null,
      filter.importType ? <SntImportType>filter.importType : null,
      filter.exportType ? <SntExportType>filter.exportType : null,
      filter.transferType ? <SntTransferType>filter.transferType : null,
      filter.statuses ? <SntStatus[]>filter.statuses : null,
      null,
      null,
      filter.sellerTin,
      filter.sellerName,
      null,
      filter.number,
      filter.registrationNumber,
      null,
      null,
      filter.category ? <SntCategory>filter.category : null,
      null,
      undefined,
      pageIndex,
      pageSize
    )
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.snts),
        finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Used for loading snt with filters from external modules. For instance, from e-invoicing module.
   * @param filter 
   * @param pageIndex 
   * @param pageSize 
   * @returns 
   */
  loadSntList(filter: SntFilter, pageIndex: number = 1, pageSize: number = 1000): Observable<SntSimpleDto[]> {
    return this.apiClient.getSntList(
      filter.dateFrom,
      filter.dateTo,
      filter.type ? <SntFilterType>filter.type : null,
      filter.importType ? <SntImportType>filter.importType : null,
      filter.exportType ? <SntExportType>filter.exportType : null,
      filter.transferType ? <SntTransferType>filter.transferType : null,
      filter.statuses ? <SntStatus[]>filter.statuses : null,
      null,
      null,
      filter.sellerTin,
      filter.sellerName,
      null,
      filter.number,
      filter.registrationNumber,
      null,
      null,
      filter.category ? <SntCategory>filter.category : null,
      null,
      undefined,
      pageIndex,
      pageSize
    )
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.snts),
        finalize(() => this.loadingSubject.next(false))
    );
  }

  public handleLoad(data: SntSimpleDto[]) {
    this.allSourceSubjects = data;    
    this.dataSourceSubjects.next(this.allSourceSubjects);    
  }
}
