import { Observable, of, Subject } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { EsfJdeArMatchDto, GetJdeArMatchesResponseDto, JdeClient, PagingModel } from "src/app/api/GCPClient";
import { Injectable } from "@angular/core";
import { DataSourceBaseEntity } from "../../DataSourceBaseEntity";
import { FilterModel } from "src/app/pages/einvoicing/components/shared/components/filter/filter.model";
import { ArReconciliationStatusesEnum } from "../../enums/ArReconciliationStatusesEnum";
import { ArReconciliationStatusesAdapter } from "../../entities/Einvoicing/Adapters/ArReconciliationStatusesAdapter";

@Injectable()
export class ArTableDataSource extends DataSourceBaseEntity<GetJdeArMatchesResponseDto, JdeClient>  {
  subscription$: Subject<void> = new Subject<void>();

  public loading = this.loadingSubject.asObservable();
  public pagingModel: PagingModel;
  private arReconciliationStatusesAdapter: ArReconciliationStatusesAdapter

  constructor() { 
    super(); 
    this.arReconciliationStatusesAdapter = new ArReconciliationStatusesAdapter();
  }

  loadSubjects(): Observable<GetJdeArMatchesResponseDto[]> {
    return this.apiClient.getJdeArMatches(
      null, null, null, null, undefined, undefined, undefined, false, false, undefined,undefined,
      1,
      1000)
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.matches),
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
  }

  loadArWithFilters(filter: FilterModel<ArReconciliationStatusesEnum>, pageIndex: number = 1, pageSize: number = 1000): Observable<EsfJdeArMatchDto[]> {
    return this.apiClient.getJdeArMatches(
      filter?.dateFrom,
      filter?.dateTo,
      filter?.number,    
      this.arReconciliationStatusesAdapter.adapt(filter?.reconciliationStatus),
      undefined,
      filter?.tin,
      filter?.registerNumber,
      filter?.ownInvoices,
      filter?.isDrafts,
      undefined,
      undefined,
      pageIndex,
      pageSize
    )
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.matches),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  public handleLoad(data: GetJdeArMatchesResponseDto[]) {
    this.allSourceSubjects = data;
    this.dataSourceSubjects.next(this.allSourceSubjects);
  }
}
