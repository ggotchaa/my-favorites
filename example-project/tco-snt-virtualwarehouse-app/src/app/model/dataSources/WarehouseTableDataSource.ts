import { Inject, Injectable, Optional } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { catchError, finalize, map, takeUntil } from "rxjs/operators";
import { TaxpayerStoreDescriptionDto, TaxpayerStoreClient, TaxpayerStoreSimpleDto } from "src/app/api/GCPClient";
import { DataSourceBaseEntity } from "../DataSourceBaseEntity";
import { TaxpayerDescriptionDtoAdapter } from "../entities/TaxpayerDescriptionDtoAdapter";

@Injectable()
export class WarehouseTableDataSource extends DataSourceBaseEntity<TaxpayerStoreSimpleDto, TaxpayerStoreClient> {
  subscription$: Subject<void> = new Subject<void>();
  private taxPayerDescription: TaxpayerDescriptionDtoAdapter

  public loading = this.loadingSubject.asObservable();
  constructor(
    @Inject('loading') @Optional() loading: boolean = true
  ){
    super()
    this.taxPayerDescription = new TaxpayerDescriptionDtoAdapter()
    this.loadingSubject.next(loading);
  }
  loadSubjects(): Observable<TaxpayerStoreSimpleDto[]>{
    return this.apiClient.getUserTaxpayerStores().pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false)),
    )
  }

  loadSubjectsByType(): Observable<TaxpayerStoreDescriptionDto[]>{
    return this.apiClient.getUserTaxpayerStores().pipe(
      map(items => items.map(item => this.taxPayerDescription.adapt(item))),
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false)),
  )
  }

}
