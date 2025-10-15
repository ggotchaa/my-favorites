import { Injectable } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { PagingModel, SortingOrder, UFormClient, UFormSimpleDto, UFormStatusType, UFormType } from "src/app/api/GCPClient";
import { FormsFilter } from "src/app/pages/forms/forms-filters/formsFilter.model";
import { FormsFacade } from '../../pages/forms/forms.facade';
import { DataSourceBaseEntity } from "../DataSourceBaseEntity";
@Injectable()
export class UFormTableDataSource extends DataSourceBaseEntity<UFormSimpleDto, UFormClient> {
    subscription$: Subject<void> = new Subject<void>();
    public loading = this.loadingSubject.asObservable();
    public pagingModel: PagingModel;
    
    constructor(private formsFacade: FormsFacade){
        super();
    }
    loadSubjects(pageIndex: number = 1, pageSize: number = 1000): Observable<UFormSimpleDto[]>{
      return this.apiClient.getAllForms(null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        'Date',
        SortingOrder.Desc,
        pageIndex,
        pageSize
      )
        .pipe(
          tap(res => this.pagingModel = res.paging),
          map(res => res.uforms),
          catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
        )          
    }
   loadFormsWithFilters(filter: FormsFilter, pageIndex: number = 1, pageSize: number = 1000): Observable<UFormSimpleDto[]>{
      this.loadingSubject.next(true);
  
      return (this.apiClient.getAllForms(
        filter.number,
        filter.registrationNumber,
        filter.dateFrom,
        filter.dateTo,
        filter.senderTin,
        filter.recipientTin,
        filter.totalSumFrom,
        filter.totalSumTo,
        filter.type ? <UFormType>filter.type : null,
        filter.status ? <UFormStatusType>filter.status : null,
        filter.senderStoreId > 0 ? filter.senderStoreId : null,
        filter.recipientStoreId > 0 ? filter.recipientStoreId : null,
        'Date',
        SortingOrder.Desc,
        pageIndex,
        pageSize
      ))
        .pipe(
          tap(res => this.pagingModel = res.paging),
          map(res => res.uforms),
          catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
        );
    }
  
    public handleLoad(data: UFormSimpleDto[]){
      this.dataSourceSubjects.next(data);
      this.allSourceSubjects = this.dataSourceSubjects.value.sort(this.formsFacade.compareForms);
      this.dataSourceSubjects.next(this.allSourceSubjects);
    }      
  }
