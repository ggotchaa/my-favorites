import { Observable, of, Subject } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { BalanceClient, BalanceSimpleDto, PagingModel, SortingOrder } from "src/app/api/GCPClient";
import { BalancesFilter } from "../../pages/balances/balances-filters/balancesFilter.model";
import { DataSourceBaseEntity } from "../DataSourceBaseEntity";
import { Injectable } from "@angular/core";

@Injectable()
export class BalanceTableDataSource extends DataSourceBaseEntity<BalanceSimpleDto, BalanceClient>  {
  subscription$: Subject<void> = new Subject<void>();
  public loading = this.loadingSubject.asObservable();
  public pagingModel: PagingModel;
  constructor(){
    super()
  }
  loadSubjects(pageIndex = 1, pageSize = 1000): Observable<BalanceSimpleDto[]> {
    return this.apiClient.getAll(
      null, null, null, null, null, null, null, null, null,null, null, null,
      'Name',
      SortingOrder.Asc,
      pageIndex,
      pageSize
      )
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.balances),
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))      
    )        
  }  

  loadBalancesWithFilters(filter: BalancesFilter, pageIndex = 1, pageSize = 1000): Observable<BalanceSimpleDto[]> {    
    return this.apiClient.getAll(
      filter.name,
      filter.productNameInImportDoc,
      filter.productNumberInImportDoc,
      filter.manufactureOrImportDocNumber,      
      filter.productId,
      filter.price,
      filter.kpvedCode,
      filter.tnvedCode,
      filter.gtinCode,
      filter.physicalLabel,
      filter.taxpayerStoreId > 0 ? filter.taxpayerStoreId : null,
      filter.measureUnitId > 0 ? filter.measureUnitId : null,
      'Name',
      SortingOrder.Asc,
      pageIndex,
      pageSize
    )
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.balances),
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))      
    )        
  }
}
