import { Observable, of, Subject } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { AwpClient, AwpDto, PagingModel } from "src/app/api/GCPClient";

import { Injectable } from "@angular/core";
import { DataSourceBaseEntity } from "../../DataSourceBaseEntity";
import { AwpFilter } from "../../entities/Awp/AwpFilter";

@Injectable()
export class AwpTableDataSource extends DataSourceBaseEntity<AwpDto, AwpClient>  {
  subscription$: Subject<void> = new Subject<void>();

  public loading = this.loadingSubject.asObservable();
  public pagingModel: PagingModel;

  constructor() {
    super()
  }
  loadSubjects(): Observable<AwpDto[]> {
    return this.apiClient.getAll(
      null, null, undefined, null, null, null, null, null,
      1,
      1000)
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.awps),
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
  }

  loadAwpWithFilters(filter: AwpFilter, pageIndex: number = 1, pageSize: number = 1000): Observable<AwpDto[]> {
    return this.apiClient.getAll(
      filter.dateFrom,
      filter.dateTo,
      filter.registrationNumber,
      filter.senderTin,
      filter.recipientTin,
      filter.awpStatus,
      null,
      undefined,
      pageIndex,
      pageSize
    )
      .pipe(
        tap(res => this.pagingModel = res.paging),
        map(res => res.awps),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  public handleLoad(data: AwpDto[]) {
    this.allSourceSubjects = data;
    this.dataSourceSubjects.next(this.allSourceSubjects);
  }
}
