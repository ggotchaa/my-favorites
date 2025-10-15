import { Observable, of, Subject } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { DictionariesClient, ProductDto } from "src/app/api/GCPClient";
import { DataSourceBaseEntity } from "../DataSourceBaseEntity";
import { Injectable } from "@angular/core";

@Injectable()
export class GSVSTableDataSource extends DataSourceBaseEntity<ProductDto, DictionariesClient>  {
    subscription$: Subject<void> = new Subject<void>();
    public loading = this.loadingSubject.asObservable();
    constructor(){
      super();
    }
    loadSubjects(): Observable<ProductDto[]> {
      return this.apiClient.getFavoriteProducts().pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      // .subscribe((data) => {
      //   this.dataSourceSubjects.next(data);
      //   this.allSourceSubjects = this.dataSourceSubjects.value;
      // });
    }
  }
