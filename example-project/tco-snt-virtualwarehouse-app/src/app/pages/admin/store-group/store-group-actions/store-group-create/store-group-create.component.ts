import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap, takeUntil, finalize } from 'rxjs/operators';
import { AdGroupDto, GroupDescriptionDto, GroupTaxpayerStoresDto, GroupTaxpayerStoresIdsDto, IGroupDescriptionDto, IGroupTaxpayerStoresDto, IGroupTaxpayerStoresIdsDto, TaxpayerStoreDescriptionDto, TaxpayerStoreSimpleDto } from 'src/app/api/GCPClient';
import { StoreGroupsTableDataSource } from 'src/app/model/dataSources/StoreGroupsTableDataSource';
import { AdminFacade } from '../../../admin.facade';

@Component({
    selector: 'app-store-group-create',
    templateUrl: './store-group-create.component.html',
    styleUrls: ['./store-group-create.component.scss'],
    standalone: false
})
export class StoreGroupCreateComponent implements OnInit {
  form: UntypedFormGroup;
  searchTerm$ = new Subject<string>();
  public dataSource: StoreGroupsTableDataSource
  groups: AdGroupDto[]
  dataLoader = false;
  warehouses: TaxpayerStoreDescriptionDto[]
  selectedGroup: GroupDescriptionDto;
  selectedStores: TaxpayerStoreDescriptionDto[] = [];
  constructor(
    public dialogRef: MatDialogRef<StoreGroupCreateComponent>,
    private fb: UntypedFormBuilder,
    public adminFacade: AdminFacade,
  ) { 
    this.dataSource = new StoreGroupsTableDataSource(false)
    this.dataSource.apiClient = this.adminFacade.groupTaxpayerStoreClient
    this.form = this.fb.group({
      group: ['', Validators.required],
      stores: ['', Validators.required]
    })
 
    

    this.searchTerm$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(e => e.length > 0),
      switchMap(text => {
        this.groups = [];
        this.dataLoader = true;
        return this.adminFacade.searchGroupByText(text).pipe(
          tap(res =>{
            if(res.length === 0) this.form.get('group').setErrors({notFound: true})
            else {
              if(this.form.get('group').hasError('notFound') ) {
                const { notFound, ...errors } = this.form.get('group').errors;
                this.form.get('group').setErrors(errors)
              }
            }
          }),
          takeUntil(this.dialogRef.afterClosed()),
        )
      })
    ).subscribe(
      res => {
        this.groups = res
        this.dataLoader = false;
      },
      err => {
        this.adminFacade.displayErrors(err);
      }
    )
  }
  

  ngOnInit(): void {
    this.form.markAllAsTouched();
    this.adminFacade.loading.next(true);
    this.adminFacade.taxpayerStoreClient.getAllTaxpayerStores()
    .pipe(
      takeUntil(this.dialogRef.afterClosed()),
      finalize(() => this.adminFacade.loading.next(false))
    ).subscribe(
      res => this.warehouses = res,
      err => this.adminFacade.displayErrors(err)
    )
  }

  displayFn(group: AdGroupDto): string {
    return group && group.name ? group.name : '';
  }

  onGroupSelected(value:AdGroupDto): void {
    const IgroupDescriptionDto : IGroupDescriptionDto = {
      name: value.name,
      id: value.id
    }
    const groupDescriptionDto = new GroupDescriptionDto(IgroupDescriptionDto)
    this.selectedGroup = groupDescriptionDto
  }
  onStoresSelected(value: TaxpayerStoreDescriptionDto): void {
    if(!this.selectedStores.includes(value))
      this.selectedStores.push(value)
    else this.selectedStores = this.selectedStores.filter(store => store !== value)
  }
  onCloseDialog(){
    this.dialogRef.close();
  }
  onAction(){
    this.dataSource.loadingSubject.next(true)
    const data: IGroupTaxpayerStoresIdsDto = {
      groupId: this.selectedGroup.id,
      taxpayerStoreIds:this.form.get('stores').value as number[]
    }
    const group: IGroupDescriptionDto = {
      id: this.selectedGroup.id,
      name: this.selectedGroup.name
    }
    const newGroup: IGroupTaxpayerStoresDto = {
      group : new GroupDescriptionDto(group),
      taxpayerStores: this.selectedStores

    }
    this.dataSource.onCreate( new GroupTaxpayerStoresIdsDto (data))
      .pipe(
        takeUntil(this.dialogRef.afterClosed()),
      )
      .subscribe(
        _ => this.dialogRef.close( new GroupTaxpayerStoresDto(newGroup)),
        err => this.adminFacade.displayErrors(err),
      )
  }
}
