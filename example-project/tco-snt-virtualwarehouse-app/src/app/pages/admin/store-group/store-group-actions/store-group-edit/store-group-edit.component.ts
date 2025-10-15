import { Component, Inject, OnInit, Optional } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { takeUntil, finalize } from 'rxjs/operators';
import { AdGroupDto, TaxpayerStoreDescriptionDto, GroupDescriptionDto, IGroupTaxpayerStoresIdsDto, IGroupTaxpayerStoresDto, GroupTaxpayerStoresIdsDto, GroupTaxpayerStoresDto } from 'src/app/api/GCPClient';
import { StoreGroupsTableDataSource } from 'src/app/model/dataSources/StoreGroupsTableDataSource';
import { AdminFacade } from '../../../admin.facade';
import { StoreGroupCreateComponent } from '../store-group-create/store-group-create.component';

@Component({
    selector: 'app-store-group-edit',
    templateUrl: './store-group-edit.component.html',
    styleUrls: ['./store-group-edit.component.scss'],
    standalone: false
})
export class StoreGroupEditComponent implements OnInit {

  form: UntypedFormGroup;
  public dataSource: StoreGroupsTableDataSource
  warehouses: TaxpayerStoreDescriptionDto[]
  groups: AdGroupDto[]
  selectedGroup: GroupDescriptionDto;
  selectedStores: TaxpayerStoreDescriptionDto[] = [];

  constructor(
    public dialogRef: MatDialogRef<StoreGroupCreateComponent>,
    private fb: UntypedFormBuilder,
    public adminFacade: AdminFacade,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: GroupTaxpayerStoresDto,

  ) { 
    this.dataSource = new StoreGroupsTableDataSource(false)
    this.dataSource.apiClient = this.adminFacade.groupTaxpayerStoreClient
    this.form = this.fb.group({
      group: [data.group.name, Validators.required],
      stores: ['', Validators.required]
    })
   
  }
  
  private fillStores(): number[] {
    return this.data.taxpayerStores.map(store => store.id)
  }
  ngOnInit(): void {
    this.adminFacade.loading.next(true);
    this.adminFacade.taxpayerStoreClient.getAllTaxpayerStores()
    .pipe(
      takeUntil(this.dialogRef.afterClosed()),
      finalize(() => this.adminFacade.loading.next(false))
    ).subscribe(
      res => {
        this.warehouses = res
        this.form.get('stores').patchValue(this.fillStores())
      },
      err => this.adminFacade.displayErrors(err)
    )
    this.selectedStores = [...this.data.taxpayerStores];
    this.form.markAllAsTouched();
  }

  onStoresSelected(value: TaxpayerStoreDescriptionDto): void {
    const isExist = this.selectedStores.find(o => o.id == value.id);
    if(isExist)
      this.selectedStores = this.selectedStores.filter(o => o.id !== value.id)
    else this.selectedStores.push(value);
  }
  onCloseDialog(){
    this.dialogRef.close();
  }
  onAction(){
    this.dataSource.loadingSubject.next(true)
    const data: IGroupTaxpayerStoresIdsDto = {
      groupId: this.data.group.id,
      taxpayerStoreIds:this.form.get('stores').value as number[]
    }
    const editGroup: IGroupTaxpayerStoresDto = {
      group : this.data.group,
      taxpayerStores: this.selectedStores

    }
    this.dataSource.onEdit( new GroupTaxpayerStoresIdsDto (data))
      .pipe(
        takeUntil(this.dialogRef.afterClosed()),
      )
      .subscribe(
        _ => this.dialogRef.close( new GroupTaxpayerStoresDto(editGroup)),
        err => this.adminFacade.displayErrors(err),
      )
  }

}
