import { Injectable } from "@angular/core";
import { Subject, Observable, of } from "rxjs";
import { tap, map, catchError, finalize } from "rxjs/operators";
import { EsfJdeApUndistributedMatchDto, GetJdeUndistributedMatchesResponseDto, InvoiceStatus, JdeClient, PagingModel, SortingOrder } from "src/app/api/GCPClient";
import { FilterModel } from "src/app/pages/einvoicing/components/shared/components/filter/filter.model";
import { DataSourceBaseEntity } from "../../DataSourceBaseEntity";
import { ApReconciliationStatusesAdapter } from "../../entities/Einvoicing/Adapters/ApReconciliationStatusesAdapter";
import { ApReconciliationStatusesEnum } from "../../enums/ApReconciliationStatusesEnum";
import { ApInvoiceTypesAdapter } from "../../entities/Einvoicing/Adapters/ApInvoiceTypesAdapter";

@Injectable()
export class ApUndistributedModuleTableDataSource extends DataSourceBaseEntity<GetJdeUndistributedMatchesResponseDto, JdeClient>{

    subscription$: Subject<void> = new Subject<void>();

    public loading = this.loadingSubject.asObservable();
    public pagingModel: PagingModel;

    private apReconciliationStatusesAdapter: ApReconciliationStatusesAdapter;
    private apInvoiceTypesAdapter: ApInvoiceTypesAdapter;

    constructor() {
        super();
        this.apReconciliationStatusesAdapter = new ApReconciliationStatusesAdapter();
        this.apInvoiceTypesAdapter = new ApInvoiceTypesAdapter();
    }

    loadSubjects(): Observable<GetJdeUndistributedMatchesResponseDto[]> {
        return this.apiClient.getJdeApUndistributedMatches(
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
            'id',
            SortingOrder.Asc,
            1,
            1000)
            .pipe(
                tap(res => this.pagingModel = res.paging),
                map(res => res.matches),
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
    }

    loadApUndistributedWithFilters(filter: FilterModel<ApReconciliationStatusesEnum>, pageIndex: number = 1, pageSize: number = 1000): Observable<EsfJdeApUndistributedMatchDto[]> {
        return this.apiClient.getJdeApUndistributedMatches(
            filter?.dateFrom,
            filter?.dateTo,
            filter?.number,
            this.apReconciliationStatusesAdapter.adapt(filter?.reconciliationStatus),
            filter.invoiceStatus,
            undefined,
            this.apInvoiceTypesAdapter.adapt(filter?.invoiceType),
            filter?.tin,
            filter.registerNumber,
            filter.manualReconciliationCommentType,
            'id',
            SortingOrder.Asc,
            pageIndex,
            pageSize
        )
            .pipe(
                tap(res => this.pagingModel = res.paging),
                map(res => res.matches),
                finalize(() => this.loadingSubject.next(false))
            );
    }
}