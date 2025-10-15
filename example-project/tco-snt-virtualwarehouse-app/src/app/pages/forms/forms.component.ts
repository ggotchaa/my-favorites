import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Title } from '@angular/platform-browser';
import * as fileSaver from 'file-saver';
import { Subscription } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { RoleType, SignProcessClient, SortingOrder, UFormClient, UFormSimpleDto, UFormStatusType, UFormType } from 'src/app/api/GCPClient';
import { UFormTableDataSource } from 'src/app/model/dataSources/UFormTableDataSource';
import { AccessControlList } from 'src/app/model/entities/AccessControlList';
import { FormStatusType } from '../../model/enums/UForms/FormStatusType';
import { FormFiltersComponent } from './forms-filters/form-filters.component';
import { FormsFilter } from './forms-filters/formsFilter.model';
import { FormsFacade } from './forms.facade';
import { MatPaginator } from '@angular/material/paginator';
import { AuthTicketStatusMenuService } from 'src/app/services/auth-ticket-status-menu.service';
import { Router } from '@angular/router';
@Component({
    selector: 'app-forms',
    templateUrl: './forms.component.html',
    styleUrls: ['./forms.component.scss'],
    providers: [UFormTableDataSource],
    standalone: false
})
export class FormsComponent implements OnInit {
  displayedColumns: string[] = ["select","number","registrationNumber","date","type","senderTin","recipientTin","totalSum","status","cancelReason"]
  loadingReport = false;
  formAccessControlList: Map<string, RoleType[]> = AccessControlList.form
  selection = new SelectionModel<UFormSimpleDto>(true, []);
  selectedForm: UFormSimpleDto;
  private filter = new FormsFilter();
  @ViewChild('formFilters') formFiltersComponent: FormFiltersComponent
  @ViewChild('importButton') importButton: MatButton
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private authMenuSubscription: Subscription;

  FormType = UFormType;
  FormStatus = FormStatusType;
  
  isEditButtonEnabled = false;

  pageSize = 15;
  pageSizeOptions = [15, 50, 100, 300, 1000]
  resultsLength = 0;

  constructor(
    private formsApi: UFormClient,
    private titleService: Title,
    public dataSource: UFormTableDataSource,
    public router: Router,
    private formsFacade: FormsFacade,
    private signProcessClient: SignProcessClient,
    private authMenuService: AuthTicketStatusMenuService
    ) {
      this.dataSource.apiClient = this.formsApi;
      this.titleService.setTitle('Список форм');
  }
 

  ngOnInit() {
    this.selection.changed.subscribe(
      () => {
        if (this.selection.selected.length == 1) {
          const selectedForm = this.selection.selected[0] as UFormSimpleDto;
          this.isEditButtonEnabled = this.isFormEditable(selectedForm);
        }
        else {
          this.isEditButtonEnabled = false;
        }
      }
    )

    this.loadDataSource(this.filter, 1, this.pageSize)
  
    this.authMenuSubscription = this.authMenuService.closeMenu$.subscribe(() => {
      this.onImport();
    });
  }
  private loadDataSource (filter: FormsFilter, pageIndex: number = 1, pageSize: number = 15) : void {
    this.dataSource.loadingSubject.next(true);
    this.dataSource.loadFormsWithFilters(filter, pageIndex, pageSize)
    .pipe(takeUntil(this.dataSource.subscription$))
    .subscribe((data) => {
      this.resultsLength = this.dataSource.pagingModel.totalRecords;
      this.dataSource.handleLoad(data);
    }) 
  }
  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => {
          if (this.formFiltersComponent.model) {
            this.loadDataSource(this.filter, this.paginator.pageIndex + 1, this.paginator.pageSize);
          }
        }),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe();
  }

  editForm(): void{
    let form = this.selection.selected[0] as UFormSimpleDto;
    this.router.navigate(['forms/edit/', form.id])
  }
  showForm(): void {
    let form = this.selection.selected[0] as UFormSimpleDto;
    this.router.navigate(['forms/show/', form.id])
  }
  filterForms(formsFilter: FormsFilter){
    this.filter = formsFilter;
    this.loadDataSource(this.filter, this.paginator.pageIndex + 1, this.paginator.pageSize)
  }

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
  }  

  hasAccess(roles: RoleType[]): boolean {
    return this.formsFacade.roleAccessService.hasAccess(roles);
  }
  onGetFormReport(){
    this.loadingReport = true;
    const filter = this.formFiltersComponent.model;
    // TODO Remove paging properties, when these properties will be eliminated in REST API
    this.dataSource.apiClient.getUFormListReport(
      filter.number,
      filter.registrationNumber,
      filter.dateFrom,
      filter.dateTo,
      filter.senderTin,
      filter.recipientTin,
      filter.totalSumFrom,
      filter.totalSumTo,
      filter.type ? <UFormType>filter.type : null,
      filter.status ? <UFormStatusType>filter.status : null,
      filter.senderStoreId > 0 ? filter.senderStoreId : null,
      filter.recipientStoreId > 0 ? filter.recipientStoreId : null,
      'Number',
      SortingOrder.Asc      
    )
      .pipe(
        takeUntil(this.dataSource.subscription$),
      )
      .subscribe(
        res => {  
          this.loadingReport = false;
          let blob:any = new Blob([res.data], { type: res.data.type});
          fileSaver.saveAs(blob, res.fileName);
          this.formsFacade.displaySuccess('Отчет успешно сформировался')
        },
        err => {
          this.loadingReport = false
          this.formsFacade.displayErrors(err)
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
    this.dataSource.loadingSubject.next(true);
    let message = ''
    this.dataSource.apiClient.import()
      .pipe(
        switchMap(data => {
          message = 'Добавлено ' + data.added +"<br>"+"Обновлено " + data.updated
          return this.dataSource.loadSubjects(this.paginator.pageIndex + 1, this.paginator.pageSize)
        }),
        takeUntil(this.dataSource.subscription$)
      )
      .subscribe(
        res => {
          this.dataSource.handleLoad(res);
          this.importButton.disabled = false;
          this.formsFacade.displaySuccess(message)
        },
        err => this.formsFacade.displayErrors(err)
      )
  }
  
  isFormEditable(form: UFormSimpleDto) {
    return form.status === UFormStatusType.DRAFT;
  }

  ngOnDestroy(): void {
    if (this.authMenuSubscription){
      this.authMenuSubscription.unsubscribe();
    }
  }
}
