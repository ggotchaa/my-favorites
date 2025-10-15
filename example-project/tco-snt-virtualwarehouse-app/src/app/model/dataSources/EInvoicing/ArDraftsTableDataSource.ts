import { Observable, of, Subject } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { GetInvoicesForSigningDto, GetInvoicesForSigningResponseDto, InvoicesClient, PagingModel } from "src/app/api/GCPClient";
import { Injectable } from "@angular/core";
import { DataSourceBaseEntity } from "../../DataSourceBaseEntity";
import { ArDraftsFilterModel } from "src/app/pages/einvoicing/components/ar-module/ar-drafts/ar-drafts-filter/ar-drafts-filter.model";

@Injectable()
export class ArDraftsTableDataSource extends DataSourceBaseEntity<GetInvoicesForSigningResponseDto, InvoicesClient> {
  subscription$: Subject<void> = new Subject<void>();

  public loading = this.loadingSubject.asObservable();
  public pagingModel: PagingModel;

  constructor() {
    super();
  }

  loadSubjects(pageIndex: number = 1, pageSize: number = 1000): Observable<GetInvoicesForSigningResponseDto[]> {
    return this.apiClient.getInvoicesForSigning(
      false, undefined, undefined,
      pageIndex,
      pageSize)
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.invoices),
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
  }

  loadArDraftsWithFilters(filter: ArDraftsFilterModel, pageIndex: number = 1, pageSize: number = 1000): Observable<GetInvoicesForSigningDto[]> {
    return this.apiClient.getInvoicesForSigning(
      filter?.ownInvoices ?? false,
      undefined,
      undefined,
      pageIndex,
      pageSize
    )
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.invoices),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  public handleLoad(data: GetInvoicesForSigningResponseDto[]) {
    this.allSourceSubjects = data;
    this.dataSourceSubjects.next(this.allSourceSubjects);
  }
}
