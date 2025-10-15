import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { Title } from '@angular/platform-browser';
import * as fileSaver from 'file-saver';
import { Subscription } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { BalanceClient, RoleType, SignProcessClient, SortingOrder } from 'src/app/api/GCPClient';
import { BalanceTableDataSource } from 'src/app/model/dataSources/BalanceTableDataSource';
import { AccessControlList } from 'src/app/model/entities/AccessControlList';
import { CommonUpdateValuesService } from 'src/app/services/commonUpdateValues.service';
import { BalanceFacade } from './balance.facade';
import { BalancesFiltersComponent } from './balances-filters/balances-filters.component';
import { BalancesFilter } from './balances-filters/balancesFilter.model';
import { MatPaginator } from '@angular/material/paginator';
import { AuthTicketStatusMenuService } from 'src/app/services/auth-ticket-status-menu.service';
@Component({
    selector: 'app-snt',
    templateUrl: './balance.component.html',
    styleUrls: ['./balance.component.scss'],
    providers: [BalanceTableDataSource],
    standalone: false
})
export class BalanceComponent implements OnInit {
  title = 'Balance';
  filterForm: UntypedFormGroup;
  balanceAccessControlList = AccessControlList.balance
  loadingReport = false;
  displayedColumns: string[] = ["productId", "name", "tnvedCode", "gtinCode", 'pinCode', "manufactureOrImportDocNumber", "productNumberInImportDoc", 'productNameInImportDoc', 'physicalLabel', "unitPrice", 'quantity','taxpayerStoreName',"measureUnitName",'reserveQuantity'];
  resultsLength = 0;
  pageSizeOptions = [15, 50, 100, 300, 1000];
  private filterBalance = new BalancesFilter(); 
  private authMenuSubscription: Subscription;

  @ViewChild('balanceFilters') balanceFiltersComponent: BalancesFiltersComponent
  @ViewChild('importButton') importButton: MatButton
  @ViewChild(MatPaginator) paginator: MatPaginator

  constructor(
    balanceApi: BalanceClient,
    private commonValuesService: CommonUpdateValuesService,
    private signProcessClient: SignProcessClient,
    private authMenuService: AuthTicketStatusMenuService,
    public dataSource: BalanceTableDataSource,
    private balanceFacade: BalanceFacade,
    private titleService: Title) {
      this.titleService.setTitle('Остатки');
      this.dataSource.apiClient = balanceApi;
  }

  public yesNoFromBoolean(boolValue){
    return this.commonValuesService.yesNoFromBoolean(boolValue);
  }

  ngOnInit() {
    this.dataSource.loadingSubject.next(true);

    this.dataSource.loadSubjects(1, 15).pipe(
      takeUntil(this.dataSource.subscription$))
      .subscribe((data) => {
        this.resultsLength = this.dataSource.pagingModel.totalRecords;
        this.dataSource.dataSourceSubjects.next(data);
      });
  
    this.authMenuSubscription = this.authMenuService.closeMenu$.subscribe(() => {
      this.onImport();
    });
  }    
  private loadDataSource (filter: BalancesFilter, pageIndex: number = 1, pageSize: number = 15) : void {
    this.dataSource.loadingSubject.next(true);
    this.dataSource.loadBalancesWithFilters(filter, pageIndex, pageSize)
    .pipe(takeUntil(this.dataSource.subscription$))
    .subscribe((data) => {
      this.resultsLength = this.dataSource.pagingModel.totalRecords;
      this.dataSource.dataSourceSubjects.next(data);
    }) 
  }
  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => {
          if (this.balanceFiltersComponent.model) {
            this.loadDataSource(this.filterBalance, this.paginator.pageIndex + 1, this.paginator.pageSize);
          }
        }),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe();
  }
  filterBalances(filter: BalancesFilter) {
    this.dataSource.loadingSubject.next(true);
    this.filterBalance = filter
    this.loadDataSource(filter, this.paginator.pageIndex + 1, this.paginator.pageSize)
  }

  hasAccess(roles: RoleType[]): boolean {
    return this.balanceFacade.roleAccessService.hasAccess(roles)
  }

  onGetBalanceReport(){
    this.loadingReport = true;
    const filter = this.balanceFiltersComponent.model
    this.dataSource.apiClient.getBalanceListReport(
      filter.name,
      filter.productNameInImportDoc,
      filter.productNumberInImportDoc,
      filter.manufactureOrImportDocNumber,      
      filter.productId,
      filter.price,
      filter.kpvedCode,
      filter.tnvedCode,
      filter.gtinCode,
      filter.physicalLabel,
      filter.taxpayerStoreId > 0 ? filter.taxpayerStoreId : null,
      filter.measureUnitId > 0 ? filter.measureUnitId : null,
      'Name',
      SortingOrder.Asc,
    )
      .pipe(
        takeUntil(this.dataSource.subscription$),
      )
      .subscribe(
        res => {
          this.loadingReport = false;
          let blob:any = new Blob([res.data], { type: res.data.type});
          fileSaver.saveAs(blob, res.fileName);
          this.balanceFacade.displaySuccess('Отчет успешно сформировался')
        },
        err => {
          this.loadingReport = false;
          this.balanceFacade.displayErrors(err)
        }
      )
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
    this.importButton.disabled = true;
    this.dataSource.loadingSubject.next(true)
    let message = ''
    this.dataSource.apiClient.importBalances()
    .pipe(
      switchMap(data => {
        message = 'Добавлено ' + data.added + "<br>" + "Обновлено " + data.updatedAndDeactivated
        return this.dataSource.loadSubjects(this.paginator.pageIndex + 1, this.paginator.pageSize)
      }),
      takeUntil(this.dataSource.subscription$)
    )
    .subscribe(
      _res => {
        this.importButton.disabled = false;
        this.balanceFacade.displaySuccess(message)
      },
      err => this.balanceFacade.displayErrors(err)
    )
  }

  ngOnDestroy(): void {
    if (this.authMenuSubscription){
      this.authMenuSubscription.unsubscribe();
    }
  }
}
