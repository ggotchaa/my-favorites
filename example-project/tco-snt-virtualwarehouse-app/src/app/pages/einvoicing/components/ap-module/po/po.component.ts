import { ArReconciliationStatusesEnum } from './../../../../../model/enums/ArReconciliationStatusesEnum';
import { trigger, state, style } from '@angular/animations';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { takeUntil, tap } from 'rxjs/operators';
import { ApPoModuleTableDataSource } from 'src/app/model/dataSources/EInvoicing/ApPoModuleTableDataSource';
import { FilterModel } from '../../shared/components/filter/filter.model';
import { InvoiceFacade } from '../../shared/invoice.facade';
import { InvoiceCurrentModuleToken } from 'src/app/shared/tokens/invoice-current-module';
import { InvoiceModuleMode } from 'src/app/model/enums/InvoiceModuleTypes';
import { ApMatchType, EsfJdeApPoMatchDto, GetSuppliersResultDto, RoleType } from 'src/app/api/GCPClient';
import { ApReconciliationStatusesEnum } from 'src/app/model/enums/ApReconciliationStatusesEnum';
import { ApModuleTableService } from '../../shared/services/ap-module-table.service';
import { OrganizationFillableToken } from 'src/app/shared/tokens/organization-search.token';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { OrganizationFilliableService } from 'src/app/shared/services/auto-complete-searches/organization-search/organization-filliable.service';
import { ReportSearchParametersStateService } from '../../shared/services/report-search-parameters-state.service';
import { AccessControlList } from 'src/app/model/entities/AccessControlList';
import { ManualReconService } from '../../shared/services/manual-recon.service';

@Component({
    selector: 'app-po',
    templateUrl: './po.component.html',
    styleUrls: ['./po.component.scss'],
    providers: [
        ApPoModuleTableDataSource,
        {
            provide: InvoiceCurrentModuleToken,
            useValue: InvoiceModuleMode.ReconciliationPO
        },
        {
            provide: OrganizationFillableToken,
            useClass: OrganizationFilliableService
        },
        ReportSearchParametersStateService,
        ManualReconService
    ],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' }))
        ])
    ],
    standalone: false
})
export class PoComponent implements OnInit, AfterViewInit {

  private filter: FilterModel<ApReconciliationStatusesEnum>;
  pageSize = 15;
  ApReconciliationStatus = ApReconciliationStatusesEnum
  center = 'center';
  pageSizeOptions = [15, 50, 100, 300, 1000]
  resultsLength = 0;
  eiAccessControlList = AccessControlList.einvoicing;
  reconciliationCommentTypes = this.manualReconService.reconciliationCommentTypes;
  isLoadingCommentId = 0;
  selection = this.manualReconService.selection;
  bulkReconButtons: string[] = [];
  sendingComments = false;
  allComments = this.manualReconService.allComments;
  columnsToDisplay: string[] = [
    //JDE
    'select',
    //JDE
    'jdeType',
    'jdeDocumentNumber',
    'matchStatus',
    'jdeStatus',
    'jdeSupplierNumber',
    'jdeSupplierAddressNumber',
    'jdeIinBin',
    'jdeSellerName',
    'jdeContractNumber',
    'jdeCurrency',
    'jdeNetAmount',
    'jdeTaxAmount',
    'jdeGrossAmount',

    //ESF
    'esfRegistrationNumber',
    'esfType',
    'esfStatus',
    'esfNumber',
    'esfDate',
    'esfSellerTin',
    'esfSellerName',
    'esfContractNumber',
    'esfCurrency',
    'esfNetAmount',
    'esfTaxAmount',
    'esfGrossAmount',
    'esfLastUpdatedDate',
    
    // Manual Reconciliation
    'manualReconciliationComment',
    'commentUpdatedUserFullName',
    'manualReconciliationCommentUpdateDate',
  ];  

  expand: boolean = false;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public dataSource: ApPoModuleTableDataSource,
    private invoiceFacade: InvoiceFacade,
    public apModuleTableService: ApModuleTableService,
    public manualReconService: ManualReconService,
    @Inject(OrganizationFillableToken) private organizationFillable: IFilliable<GetSuppliersResultDto, string>
 
  ) { 
    this.dataSource.apiClient = this.invoiceFacade.jdeClient;
    this.manualReconService.dataSource = dataSource;
    this.manualReconService.invoiceFacade = invoiceFacade;
    this.manualReconService.apMatchType = ApMatchType.ApPoMatch
  }

  ngOnInit(): void {

    this.dataSource.apiClient.getSuppliersForApPo()
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

    this.subscribeManualReconFields()
  }

  ngAfterViewInit(){
    this.paginator.page
    .pipe(
      tap(() => this.loadApPo(this.filter, this.paginator.pageIndex + 1, this.paginator.pageSize)),
      takeUntil(this.dataSource.subscription$)
    )
    .subscribe();
  }

  onFilterOutputChange(filter: FilterModel<ApReconciliationStatusesEnum | ArReconciliationStatusesEnum>) {
    this.filter = filter as FilterModel<ApReconciliationStatusesEnum>;
        
    this.paginator === undefined ? this.loadApPo(this.filter, 1, this.pageSize) 
      : this.loadApPo(this.filter, this.paginator.pageIndex + 1, this.paginator.pageSize);

  }

  private loadApPo(filter: FilterModel<ApReconciliationStatusesEnum>, pageIndex: number, pageSize: number) {
    this.dataSource.loadingSubject.next(true);


    this.dataSource.loadApPoWithFilters(filter, pageIndex, pageSize)
    .pipe(
      tap(() => this.resultsLength = this.dataSource.pagingModel.totalRecords),
      takeUntil(this.dataSource.subscription$)
    )
    .subscribe(
      res => {
        this.dataSource.allSourceSubjects = res;
        this.dataSource.dataSourceSubjects.next(this.dataSource.allSourceSubjects);
      },
      err => this.invoiceFacade.displayErrors(err)
    )
  }

  sendSelected(button: string){
    this.manualReconService.sendSelected(button);
  }

  masterToggle(){
    this.manualReconService.masterToggle();
  }

  isAllSelected(): boolean {
    return this.manualReconService.isAllSelected();
  } 

  toggleSelection(element: EsfJdeApPoMatchDto){
    this.manualReconService.toggleSelection(element);
  }

  changeReconComment(element: EsfJdeApPoMatchDto){
    this.manualReconService.changeReconComment(element);
  }
  subscribeManualReconFields(){
    this.manualReconService.bulkReconButtons.subscribe(buttons => {
      this.bulkReconButtons = buttons;
    });
    this.manualReconService.sendingComments.subscribe(sending => {
      this.sendingComments = sending;
    });
    this.manualReconService.isLoadingCommentId.subscribe(isLoadingCommentId => {
      this.isLoadingCommentId = isLoadingCommentId;
    });
  }
  hasAccess(roles: RoleType[]): boolean {
    return this.invoiceFacade.roleAccessService.hasAccess(roles);
  }
}
