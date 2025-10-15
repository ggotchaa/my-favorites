import { Injectable, Optional } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { catchError, finalize, takeUntil } from "rxjs/operators";
import { EInvoicingApiClient, VNoContractEsfInvoices } from "src/app/api/EInvoicingApiClient";
import { DataSourceBaseEntity } from "../../DataSourceBaseEntity";

@Injectable()
export class ReconsiliationTableDataSource extends DataSourceBaseEntity<VNoContractEsfInvoices, EInvoicingApiClient> {
  subscription$: Subject<void> = new Subject<void>();
  public loading = this.loadingSubject.asObservable();
  constructor() {
    super()
  }
  loadSubjects(): Observable<VNoContractEsfInvoices[]> {
    return this.apiClient.nonContractInvoices().pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false)),
    )
  }
}