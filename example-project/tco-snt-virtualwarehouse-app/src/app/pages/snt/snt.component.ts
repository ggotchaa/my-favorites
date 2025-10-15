import { Actions } from './../../model/enums/Actions';
import { RejectSntComponent } from './reject-snt/reject-snt.component';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { SignProcessClient, SntCategory, SntClient, SntExportType, SntFilterType, SntImportType, SntSimpleDto, SntTransferType } from 'src/app/api/GCPClient';
import { SntType } from 'src/app/model/enums/SntType';
import { SntStatus as SntStatusAPI } from 'src/app/api/GCPClient';
import { ConfirmSntComponent } from './confirm-snt/confirm-snt.component';
import { COMPANY, NoConnectionToEsf } from 'src/app/model/GlobalConst';
import { RevokeSntComponent } from './revoke-snt/revoke-snt.component';
import { SntFilter } from './snt-filters/snt-filters.model';
import { SntTableDataSource } from '../../model/dataSources/SntTableDataSource';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { SntFacade } from './snt.facade';
import * as fileSaver from 'file-saver';
import { SntFiltersComponent } from './snt-filters/snt-filters.component';
import { SntStatus } from 'src/app/model/enums/SntStatus';
import { Router } from '@angular/router';
import { TaxpayerStoreSimpleDto } from 'src/app/api/GCPClient';
import { Subject, Subscription } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { SntBtnVisibilityService } from './snt-btn-visibility.service';
import { SntButtonActions, SntButtonVisibility } from 'src/app/model/enums/SntButtonActions';
import { AuthTicketStatusMenuService } from 'src/app/services/auth-ticket-status-menu.service';

@Component({
    selector: 'app-snt',
    templateUrl: './snt.component.html',
    styleUrls: ['./snt.component.scss'],
    providers: [SntTableDataSource],
    standalone: false
})

export class SntComponent implements OnInit {

  @ViewChild('importButton') importButton: MatButton;
  filterForm: UntypedFormGroup;
  displayedColumns: string[] = ["select", "registrationNumber", "number", "date", "senderName", "senderTin", "recipientTin", "status", "lastUpdateDate", "inputDate", "cancelReason", "sntType"];
  selection = new SelectionModel<SntSimpleDto>(true, []);
  loadingReport = false;
  isAccessibleStore: boolean;
  selectedSnt: SntSimpleDto;
  sntActions = Actions;
  sntButtonVisibility: SntButtonVisibility;
  userWarehouses: TaxpayerStoreSimpleDto[];
  unsubscribe$: Subject<void> = new Subject();
  resultsLength = 0;
  pageSizeOptions = [15, 50, 100, 300, 1000];
  private filter = new SntFilter();
  private authMenuSubscription: Subscription;

  @ViewChild('filters') sntFiltersComponent: SntFiltersComponent
  @ViewChild(MatPaginator) paginator: MatPaginator
  get SntStatus(): typeof SntStatus {
    return SntStatus;
  }

  get SntType(): typeof SntType {
    return SntType;
  }

  constructor(
    private sntApi: SntClient,
    private formBuilder: UntypedFormBuilder,
    private titleService: Title,
    public dialog: MatDialog,
    public dataSource: SntTableDataSource,
    public router: Router,
    public sntFacade: SntFacade,
    private sntBtnvisibilityService: SntBtnVisibilityService,
    private signProcessClient: SignProcessClient,
    private authMenuService: AuthTicketStatusMenuService) {
    this.dataSource.apiClient = this.sntApi;
    this.titleService.setTitle('СНТ');
  }

  ngOnInit() {
    this.filterForm = this.formBuilder.group({
      typeSnt: [],
      sntMovement: [],
      sentSnt: [],
      receivedSnt: [],
      workSnt: []
    });
    this.checkFilterSnt()
    this.sntFacade.commonDataService.getUserTaxpayerStores()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(stores => this.userWarehouses = stores);

    this.authMenuSubscription = this.authMenuService.closeMenu$.subscribe(() => {
      this.onImport();
    });

    this.updateSntButtonVisibility();
  }

  private loadDefaultSubject() {
    this.paginator === undefined ? this.dataSource.loadSntWithFilters(this.filter, 1, 15)
      .pipe(takeUntil(this.dataSource.subscription$))
      .subscribe((data) => {
        this.resultsLength = this.dataSource.pagingModel.totalRecords;
        this.dataSource.handleLoad(data);
      }) :
      this.dataSource.loadSntWithFilters(this.filter, this.paginator.pageIndex + 1, this.paginator.pageSize)
        .pipe(takeUntil(this.dataSource.subscription$))
        .subscribe((data) => {
          this.resultsLength = this.dataSource.pagingModel.totalRecords;
          this.dataSource.handleLoad(data);
        });
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => {
          if (this.sntFiltersComponent.model) {
            this.loadDefaultSubject();
          }
        }),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe();
  }

  private checkFilterSnt() {
    let storage = sessionStorage.getItem('snt-filter')
    if (storage === 'undefined' || storage === null) {
      this.loadDefaultSubject()
    }
    else {
      let sntFilter = JSON.parse(sessionStorage.getItem('snt-filter')) as SntFilter;
      sntFilter.dateFrom = sntFilter.dateFrom ? new Date(sntFilter.dateFrom) : null;
      sntFilter.dateTo = sntFilter.dateTo ? new Date(sntFilter.dateTo) : null;
      this.filterSnt(sntFilter)
    }
  }

  submit() {
    if (!this.filterForm.valid) {
      return;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.allSourceSubjects.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() === true) {
      this.selection.clear();
    } else {    
      this.dataSource.allSourceSubjects.forEach(row => this.selection.select(row));
    }

    this.updateSntButtonVisibility();
  }

  public checkAuthAndProceed() {
    this.importButton.disabled = true;
    this.signProcessClient.send().subscribe(
      resp => {
        if (!resp.hasSignedAuthTicket) {
            this.authMenuService.requestOpenMenu();
            this.importButton.disabled = false;
        }else{
          this.onImport();
        }
      },
      error => {
        this.importButton.disabled = false;
      }
    );
  }

  onImport(): void {
    this.selection.clear();
    this.dataSource.loadingSubject.next(true);
    this.importButton.disabled = true;
    let message = ''
    this.dataSource.apiClient.import()
      .pipe(
        switchMap(data => {
          message = 'Добавлено ' + data.added + "<br>" + "Обновлено " + data.updated
          return this.dataSource.loadSntWithFilters(this.filter, this.paginator.pageIndex + 1, this.paginator.pageSize)
        }),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe(
        res => {
          this.resultsLength = this.dataSource.pagingModel.totalRecords;
          this.dataSource.handleLoad(res);
          this.sntFacade.displaySuccess(message)
        },
        err => {
          err.status === 500 ? this.sntFacade.displayErrors(NoConnectionToEsf) : this.sntFacade.displayErrors(err)
        },
        () => this.importButton.disabled = false,
      )
  }

  rowToggle(row: SntSimpleDto) {  
    this.selection.toggle(row)
    this.isAccessibleStore = this.isAccessibleStoreSnt(row);
    this.updateSntButtonVisibility();
  }  

  openModal(type: number) {
    let dialogRef;
    if (this.selection.selected.length == 1) this.selectedSnt = this.selection.selected[0];
    if (type === Actions.ACCEPT) dialogRef = this.dialog.open(ConfirmSntComponent, {
      data: this.selectedSnt.id
    });
    if (type === Actions.REJECT) dialogRef = this.dialog.open(RejectSntComponent, {
      data: this.selectedSnt.id
    });
    if (type === Actions.REVOKE) dialogRef = this.dialog.open(RevokeSntComponent, {
      data: this.selectedSnt.id
    });

    dialogRef.afterClosed().subscribe((result: SntSimpleDto | null) => {
      if (result != null) {
        const index = this.dataSource.allSourceSubjects.findIndex(o => o.id === result.id);
        this.dataSource.allSourceSubjects[index].status = result.status;
        this.dataSource.allSourceSubjects[index].cancelReason = result?.cancelReason;
        this.selectedSnt = null;
      }
      this.selection.clear();
    });
  }

  correctSnt(): void {
    let snt = this.selection.selected[0] as SntSimpleDto;
    this.router.navigate(['snt/correction/', snt.id])
  }

  copySnt(): void {
    let snt = this.selection.selected[0] as SntSimpleDto;
    this.router.navigate(['snt/copy/', snt.id])
  }

  showSnt(): void {
    let snt = this.selection.selected[0] as SntSimpleDto;
    this.router.navigate(['snt/show/', snt.id])
  }

  editSntDraft(): void {
    let snt = this.selection.selected[0] as SntSimpleDto;
    this.router.navigate(['snt/edit/', snt.id])
  }

  onGetSntReport() {
    const filter = this.sntFiltersComponent.model;
    this.loadingReport = true;
    this.dataSource.apiClient.getSntListReport(
      filter.dateFrom,
      filter.dateTo,
      filter.type ? <SntFilterType>filter.type : null,
      filter.importType ? <SntImportType>filter.importType : null,
      filter.exportType ? <SntExportType>filter.exportType : null,
      filter.transferType ? <SntTransferType>filter.transferType : null,
      filter.statuses ? <SntStatusAPI[]>filter.statuses : null,
      null,
      null,
      filter.sellerTin,
      filter.sellerName,
      null,
      filter.number,
      filter.registrationNumber,
      null,
      null,
      filter.category ? <SntCategory>filter.category : null,
    )
      .pipe(
        takeUntil(this.dataSource.subscription$),
      )
      .subscribe(
        res => {
          this.loadingReport = false;
          let blob: any = new Blob([res.data], { type: res.data.type });
          fileSaver.saveAs(blob, res.fileName);
          this.sntFacade.displaySuccess('Отчет успешно сформировался')
        },
        err => {
          this.loadingReport = false
          this.sntFacade.displayErrors(err)
        }
      )
  }
  
  filterSnt(sntFilter: SntFilter) {
    this.dataSource.loadingSubject.next(true);
    this.filter = sntFilter;
    this.paginator === undefined ? this.dataSource.loadSntWithFilters(sntFilter, 1, 15)
      .pipe(takeUntil(this.dataSource.subscription$))
      .subscribe(
        (data) => {
          this.resultsLength = this.dataSource.pagingModel.totalRecords;
          this.dataSource.handleLoad(data);
        },
        error => { this.sntFacade.displayErrors(error) }) :
      this.dataSource.loadSntWithFilters(sntFilter, this.paginator.pageIndex + 1, this.paginator.pageSize)
        .pipe(takeUntil(this.dataSource.subscription$))
        .subscribe(
          (data) => {
            this.resultsLength = this.dataSource.pagingModel.totalRecords;
            this.dataSource.handleLoad(data);
          },
          error => { this.sntFacade.displayErrors(error) });
  }

  private computeButtonVisibility(): SntButtonVisibility {
    return Object.values(SntButtonActions).reduce((acc, action) => {
      acc[action] = this.sntBtnvisibilityService.isButtonAvailable(action, this.selection);
      return acc;
    }, {} as SntButtonVisibility);
  }

  private updateSntButtonVisibility(): void {
    this.sntButtonVisibility = this.computeButtonVisibility();
  }

  private isAccessibleStoreSnt(snt: SntSimpleDto): boolean {
    const storeId = snt.senderTin == COMPANY.tin ? snt.sellerTaxpareStoreId : snt.customerTaxpareStoreId
    return this.sntFacade.vstoreAccessService.isUserAllowedSntWithStores(this.userWarehouses, [storeId]);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.authMenuSubscription){
      this.authMenuSubscription.unsubscribe();
    }
  }
}
