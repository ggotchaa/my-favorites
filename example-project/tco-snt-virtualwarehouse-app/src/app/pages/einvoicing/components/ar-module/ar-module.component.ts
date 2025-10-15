import { ApReconciliationStatusesEnum } from './../../../../model/enums/ApReconciliationStatusesEnum';
import { state, style, trigger } from '@angular/animations';
import { Component, Inject,  OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ArReconciliationStatusesEnum } from 'src/app/model/enums/ArReconciliationStatusesEnum';
import { InvoiceModuleMode } from 'src/app/model/enums/InvoiceModuleTypes';
import { SelectedView } from 'src/app/model/interfaces/ISelectedView';
import { ArReconciliationStatuses } from 'src/app/model/lists/Einvoicing/ArReconciliationStatuses';
import { InvoiceCurrentModuleToken } from 'src/app/shared/tokens/invoice-current-module';
import { UpdateEsfInvoiceCommand } from '../../../../api/EInvoicingApiClient';
import { GetSuppliersResultDto, InvoiceStatus, RoleType } from '../../../../api/GCPClient';
import { ArTableDataSource } from '../../../../model/dataSources/EInvoicing/ArTableDataSource';
import { AccessControlList } from '../../../../model/entities/AccessControlList';
import { FilterModel } from '../shared/components/filter/filter.model';
import { EsfInvoiceEditDialogComponent, EsfInvoiceEditDialogData } from '../shared/dialogs/esf-invoice-edit-dialog/esf-invoice-edit-dialog.component';
import { InvoiceFacade } from '../shared/invoice.facade';

import { OrganizationFillableToken } from 'src/app/shared/tokens/organization-search.token';
import { OrganizationFilliableService } from 'src/app/shared/services/auto-complete-searches/organization-search/organization-filliable.service';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { SearchParametersStateService } from '../shared/services/state.service';
import { ReportSearchParametersStateService } from '../shared/services/report-search-parameters-state.service';

@Component({
    selector: 'app-ar-module',
    templateUrl: './ar-module.component.html',
    styleUrls: ['./ar-module.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' }))
        ])
    ],
    providers: [
        {
            provide: InvoiceCurrentModuleToken,
            useValue: InvoiceModuleMode.ARModule
        },
        {
            provide: OrganizationFillableToken,
            useClass: OrganizationFilliableService
        },
        ReportSearchParametersStateService
    ],
    standalone: false
})

export class ArModuleComponent implements OnInit {
  
  unsubscribe$: Subject<void> = new Subject();

  eiArAccessControlList = AccessControlList.einvoicing.ar;

  ReconciliationStatuses: SelectedView[] = ArReconciliationStatuses;

  ArReconciliationStatusesEnum = ArReconciliationStatusesEnum;
  InvoiceStatus = InvoiceStatus;

  center = 'center';

  pageSizeOptions = [15, 50, 100, 300, 1000]
  columnsToDisplay: string[] = [
    //JDE
    'jdeType',
    'jdeNumber',
    'jdeLastUpdatedDate',
    'jdeIinBin',
    'jdeCustomer',
    'jdeContractNumber',
    'jdeContractDate',
    'jdeCurrency',
    'jdeTaxableAmount',
    'jdeTaxAmount',
    'jdeGrossAmount',

    //ESF
    'esfType',
    'esfStatus',
    'esfNumber',
    'esfLastUpdatedDate',
    'esfIinBin',
    'esfCustomer',
    'esfContractNumber',
    'esfContractDate',
    'esfCurrency',
    'esfTaxableAmount',
    'esfTaxAmount',
    'esfGrossAmount',
  ];  

  resultsLength = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;



  constructor(    
    public dataSource: ArTableDataSource,
    public dialog: MatDialog,
    public router: Router,
    private invoiceFacade: InvoiceFacade,
    private searchParametersStateService: SearchParametersStateService,
    @Inject(OrganizationFillableToken) private organizationFillable: IFilliable<GetSuppliersResultDto, string>) {
    this.dataSource.apiClient = this.invoiceFacade.jdeClient;
  }

  ngOnInit(): void {
    this.dataSource.apiClient.getSuppliersForAr()
    .pipe(
      takeUntil(this.dataSource.subscription$)
    )
    .subscribe(
      res => {
        this.dataSource.dataSourceSubjects.next(this.dataSource.allSourceSubjects);
        this.organizationFillable.fillOut(res);
      },
      err => this.invoiceFacade.displayErrors(err)
    );
    
  }


  hasAccess(roles: RoleType[]): boolean {
    return this.invoiceFacade.roleAccessService.hasAccess(roles);
  }  


  onFilterOutputChange(filter: FilterModel<ArReconciliationStatusesEnum | ApReconciliationStatusesEnum>) {
    this.checkStateServiceForSearchParameters(filter)
    this.loadArInvoices(this.searchParametersStateService.filter, this.searchParametersStateService.pageIndex, this.searchParametersStateService.pageSize)
  }

  loadArInvoices(filter: FilterModel<ArReconciliationStatusesEnum>, pageIndex: number = 1, pageSize: number = 15) {
    this.dataSource.loadingSubject.next(true);    
    this.dataSource.loadArWithFilters(filter, pageIndex, pageSize)
      .pipe(takeUntil(this.dataSource.subscription$))
      .subscribe(
        (data) => {
          this.dataSource.handleLoad(data);
          this.resultsLength = this.dataSource.pagingModel.totalRecords;
        },
        error => { this.invoiceFacade.displayErrors(error) });
  }

  ngAfterViewInit() {
    this.updatePaginatorFromState()
    this.paginator.page
      .pipe(
        tap(() => {
          if (this.searchParametersStateService.filter) {
            this.searchParametersStateService.setPaginator(this.paginator.pageIndex + 1, this.paginator.pageSize)
            this.loadArInvoices(this.searchParametersStateService.filter, this.searchParametersStateService.pageIndex, this.searchParametersStateService.pageSize);
          }
        }),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe();
  }

  openDialog(matchItem: any): void {
    let dialogData = new EsfInvoiceEditDialogData();
    dialogData.esfinvoiceId = matchItem.esfinvoiceId;
    dialogData.comment = matchItem.commentEsf;


    const dialogRef = this.dialog.open(EsfInvoiceEditDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: UpdateEsfInvoiceCommand) => {
      matchItem.commentEsf = result.comment;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private checkStateServiceForSearchParameters(filter: FilterModel<ArReconciliationStatusesEnum | ApReconciliationStatusesEnum>){
    if(this.searchParametersStateService.filter === undefined){
      this.searchParametersStateService.setFilter(filter as FilterModel<ArReconciliationStatusesEnum>)
    }
    else{
      if(this.paginator !== undefined){
        this.searchParametersStateService.setPaginator()
      }
      this.updatePaginatorFromState()
      this.searchParametersStateService.setFilter(filter as FilterModel<ArReconciliationStatusesEnum>)
    } 
  }

  private updatePaginatorFromState(){
    if(this.paginator !== undefined){
      this.paginator.pageIndex = this.searchParametersStateService.pageIndex - 1
      this.paginator.pageSize =  this.searchParametersStateService.pageSize 
    }
  }
}
