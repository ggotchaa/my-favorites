import { Subject, Observable, of } from "rxjs";
import { DataSourceBaseEntity } from "../DataSourceBaseEntity";
import { GroupRoleClient, GroupRolesDto, PutGroupRolesDto, RoleType } from "../../api/GCPClient";
import { catchError, defaultIfEmpty, finalize, tap } from "rxjs/operators";
import { Inject, Injectable } from "@angular/core";
import { IActions } from "src/app/pages/admin/interfaces/IActions";
@Injectable()
export class RoleGroupTableDataSource extends DataSourceBaseEntity<GroupRolesDto, GroupRoleClient> implements IActions<PutGroupRolesDto, string>{
    subscription$: Subject<void> = new Subject<void>();
    public loading = this.loadingSubject.asObservable();
    constructor(
        @Inject('loading') loading: boolean = true
    ){
      super();
      this.loadingSubject.next(loading);
    }
    loadSubjects(): Observable<GroupRolesDto[]> {
        return this.apiClient.getAllGroupRoles().pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )        
    }
    
    onCreate(data: PutGroupRolesDto): Observable<void> {
        return this.apiClient.putGroupRoles(data).pipe(
            defaultIfEmpty(undefined)
        );
    }
    onEdit(data: PutGroupRolesDto): Observable<void> {
        return this.apiClient.putGroupRoles(data).pipe(
            defaultIfEmpty(undefined)
        );
    }
    onDelete(data: string): Observable<void> {
        return this.apiClient.deleteGroupRoles(data).pipe(
            defaultIfEmpty(undefined)
        );
    }
    compareFnByName(a: GroupRolesDto, b: GroupRolesDto): number {
        if(a.group.name < b.group.name) return -1;
        if(a.group.name > b.group.name) return 1;
        return 0;
    }
    compareFn(a: RoleType, b: RoleType): number {
        if(a>b) return 1
        if(a<b) return -1;
        return 0;
    }
}
