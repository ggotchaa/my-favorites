import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject, switchMap, takeUntil, tap } from 'rxjs';
import { GetInvoicesForSigningDto, InvoiceDto, ISendInvoiceDto, ISendMassInvoicesDto, RoleType, SendInvoiceDto, SendMassInvoicesDto } from 'src/app/api/GCPClient';
import { AccessControlList } from 'src/app/model/entities/AccessControlList';
import { InvoiceModuleMode } from 'src/app/model/enums/InvoiceModuleTypes';
import { InvoiceCurrentModuleToken } from 'src/app/shared/tokens/invoice-current-module';
import { InvoiceFacade } from '../../shared/invoice.facade';
import { SelectionModel } from '@angular/cdk/collections';
import { ArDraftsTableDataSource } from 'src/app/model/dataSources/EInvoicing/ArDraftsTableDataSource';
import { ArDraftsFilterModel } from './ar-drafts-filter/ar-drafts-filter.model';
import { DsignDialogComponent } from 'src/app/shared/components/dsign-dialog/dsign-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { InvoiceActionsDependenciesBase } from '../../shared/invoice-actions/invoice-actions-base/invoice-actions-dependencies.base';
import { SignWidget } from 'src/app/shared/interfaces/sign-widget.model';

@Component({
    selector: 'app-ar-drafts',
    templateUrl: './ar-drafts.component.html',
    styleUrls: ['./ar-drafts.component.scss'],
    providers: [
        {
            provide: InvoiceCurrentModuleToken,
            useValue: InvoiceModuleMode.ARModule
        },
        InvoiceActionsDependenciesBase,
    ],
    standalone: false
})

export class ArDraftsComponent implements OnInit, AfterViewInit, OnDestroy {
  unsubscribe$: Subject<void> = new Subject();
  eiArAccessControlList = AccessControlList.einvoicing.ar;
  selection = new SelectionModel<GetInvoicesForSigningDto>(true, []);
  pageSizeOptions = [15, 50, 100, 300, 1000];
  columnsToDisplay: string[] = [
    "select",
    'invoiceType',
    'invoiceDate',
    'invoiceTurnoverDate',
    'invoiceNumber',
    'customerIinBin',
    'customerName',
    'contractNumber',
    'contractDate',
    'currency',
    'taxableAmount',
    'taxAmount',
    'grossAmount'
  ];

  private filter = new ArDraftsFilterModel();

  resultsLength = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dsignDialog: DsignDialogComponent
  constructor(
    public dataSource: ArDraftsTableDataSource,
    public dialog: MatDialog,
    public router: Router,
    private invoiceFacade: InvoiceFacade,
    public deps: InvoiceActionsDependenciesBase) {
    this.dataSource.apiClient = this.invoiceFacade.invoiceClient;
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.dataSource.loadingSubject.next(true);

    this.dataSource.loadSubjects(1, 15).pipe(
      takeUntil(this.dataSource.subscription$))
      .subscribe((data) => {
        this.resultsLength = this.dataSource.pagingModel.totalRecords;
        this.dataSource.handleLoad(data);
      });
  }

  ngAfterViewInit(): void {
    this.paginator.page
      .pipe(
        tap(() => {
          this.loadArDraftInvoices(this.filter, this.paginator.pageIndex + 1, this.paginator.pageSize);
        }),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe();
  }

  onFilterOutputChange(filter: ArDraftsFilterModel) {
    this.loadArDraftInvoices(filter, this.paginator.pageIndex + 1, this.paginator.pageSize)
  }

  loadArDraftInvoices(filter: ArDraftsFilterModel, pageIndex: number = 1, pageSize: number = 15) {
    this.dataSource.loadingSubject.next(true);
    this.dataSource.loadArDraftsWithFilters(filter, pageIndex, pageSize)
      .pipe(
        tap(() => this.resultsLength = this.dataSource.pagingModel.totalRecords),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe(
        (data) => {
          this.dataSource.handleLoad(data);
          this.resultsLength = this.dataSource.pagingModel.totalRecords;
          this.selection.clear();
        },
        error => { this.invoiceFacade.displayErrors(error) });
  }

  hasAccess(roles: RoleType[]): boolean {
    return this.invoiceFacade.roleAccessService.hasAccess(roles);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.allSourceSubjects.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected() === true) {
      this.selection.clear();
    } else {
      this.dataSource.allSourceSubjects.forEach(row => this.selection.select(row as GetInvoicesForSigningDto));
    }
  }

  toggleSelection(row: GetInvoicesForSigningDto) {
    this.selection.toggle(row)
  }

  private confirmPopup(title: string): Promise<boolean> {
    const dialogRef = this.deps.dialog.open(ConfirmDialogComponent, {
      closeOnNavigation: true,
      disableClose: true,
      maxWidth: "400px",
      data: {
        title: title,
        message: ""
      }
    });
    return dialogRef.afterClosed().toPromise();
  }

  sign() {
    const title = `Вы, действительно, хотите отправить счет(а) в ЭСФ?`;

    this.confirmPopup(title).then(result => {
      if (!result) return;
      const dialogRef = this.deps.dialog.open(DsignDialogComponent, {
        closeOnNavigation: true,
        disableClose: true,
        width: "400px",
      });
      this.dsignDialog = dialogRef.componentInstance;
      this.dsignDialog.verifyAuthentication().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(
        isAuthorized => this.startSigningProcess(isAuthorized),
        error => this.deps.facade.displayErrors(error)
      );
    });
  }

  private startSigningProcess(isAuthorized: boolean): void {
      if (!isAuthorized) return;
      const signWidget: SignWidget = { url: '', hasError: false, errorMessage: '' };
      const selectedInvoiceIds = this.selection.selected.map(x => x.id);

      let idto: ISendMassInvoicesDto = {
        ids: selectedInvoiceIds,
        localTimezoneOffsetMinutes: new Date().getTimezoneOffset() * -1
      } 
      let dto = new SendMassInvoicesDto(idto);
      this.deps.facade.invoiceClient.signingPageForInvoices(dto).subscribe(
        response => this.handleSignResponse(response, signWidget),
        error => this.handleSignError(error, signWidget)
      );
    }

    private handleSignResponse(response: any, signWidget: SignWidget): void {
      signWidget.url = response.urlToSign;
      this.dsignDialog.signDocument(signWidget).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(
        isSigned => {
            if (isSigned) {
            setTimeout(() => {
              this.loadInitialData();
            }, 3000);
            }
        }
      );
    }
    
    private handleSignError(error: any, signWidget: SignWidget): void {
      signWidget.hasError = true;
      signWidget.errorMessage = error.title;
      this.dsignDialog.signDocument(signWidget);
    }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
