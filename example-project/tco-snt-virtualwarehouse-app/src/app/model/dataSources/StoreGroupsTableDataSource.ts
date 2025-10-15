import { Inject, Injectable, Optional } from "@angular/core";
import { Subject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { GroupTaxpayerStoreClient, GroupTaxpayerStoresDto, GroupTaxpayerStoresIdsDto, TaxpayerStoreDescriptionDto } from "src/app/api/GCPClient";
import { IActions } from "src/app/pages/admin/interfaces/IActions";
import { DataSourceBaseEntity } from "../DataSourceBaseEntity";

@Injectable()
export class StoreGroupsTableDataSource extends DataSourceBaseEntity<GroupTaxpayerStoresDto, GroupTaxpayerStoreClient> implements IActions<GroupTaxpayerStoresIdsDto, string> {
    subscription$: Subject<void> = new Subject<void>();
    public loading = this.loadingSubject.asObservable();
    constructor(
        @Inject('loading') loading: boolean = true
        ){
      super();
      this.loadingSubject.next(loading);
    }
    onCreate(data: GroupTaxpayerStoresIdsDto): Observable<void> {
        return this.apiClient.putGroupTaxpayerStores(data)
    }
    onEdit(data: GroupTaxpayerStoresIdsDto): Observable<void> {
        return this.apiClient.putGroupTaxpayerStores(data)
    }
    onDelete(data: string): Observable<void> {
        return this.apiClient.deleteGroupTxpayerStore(data)
    }
    
    
    
    loadSubjects(): Observable<GroupTaxpayerStoresDto[]> {
        return this.apiClient.getAllGroupTaxpayerStores().pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )        
    }

    compareFnByName(a: GroupTaxpayerStoresDto, b: GroupTaxpayerStoresDto): number {
        if(a.group.name < b.group.name) return -1;
        if(a.group.name > b.group.name) return 1;
        return 0;
    }
    compareFnById(a: TaxpayerStoreDescriptionDto, b: TaxpayerStoreDescriptionDto): number {
        if(a.id>b.id) return 1
        if(a.id<b.id) return -1;
        return 0;
    }
}
