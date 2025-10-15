import { Subject, Observable, of } from "rxjs";
import { DataSourceBaseEntity } from "../DataSourceBaseEntity";
import { ResponsibleAccountantClient, ResponsibleAccountantDto } from "../../api/GCPClient";
import { catchError, finalize } from "rxjs/operators";
import { Inject, Injectable } from "@angular/core";

@Injectable()
export class ResponsibleAccountantTableDataSource extends DataSourceBaseEntity<ResponsibleAccountantDto, ResponsibleAccountantClient> {
    subscription$: Subject<void> = new Subject<void>();
    public loading = this.loadingSubject.asObservable();
    constructor(
        @Inject('loading') loading: boolean = true
    ){
      super();
      this.loadingSubject.next(loading);
    }

    loadSubjects(): Observable<ResponsibleAccountantDto[]> {
        return this.apiClient.getResponsibleAccountants().pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )        
    }

    setData(data: ResponsibleAccountantDto[]){
        this.dataSourceSubjects.next(data);
        this.allSourceSubjects = data;
    }
}
