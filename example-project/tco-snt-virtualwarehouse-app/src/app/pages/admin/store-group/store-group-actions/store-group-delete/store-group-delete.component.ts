import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { GroupTaxpayerStoresDto } from 'src/app/api/GCPClient';
import { StoreGroupsTableDataSource } from 'src/app/model/dataSources/StoreGroupsTableDataSource';
import { AdminFacade } from '../../../admin.facade';

@Component({
    selector: 'app-store-group-delete',
    templateUrl: './store-group-delete.component.html',
    styleUrls: ['./store-group-delete.component.scss'],
    standalone: false
})
export class StoreGroupDeleteComponent{
  public dataSource: StoreGroupsTableDataSource
  constructor(
    public dialogRef: MatDialogRef<StoreGroupDeleteComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: GroupTaxpayerStoresDto,
    public adminFacade: AdminFacade
  ) {
    this.dataSource = new StoreGroupsTableDataSource(false)
    this.dataSource.apiClient = this.adminFacade.groupTaxpayerStoreClient
   }
  
  onCloseDialog(){
    this.dialogRef.close()
  }

  onAction(){
    this.dataSource.loadingSubject.next(true);
    this.dataSource.onDelete(this.data.group.id)
      .pipe(
        takeUntil(this.dialogRef.afterClosed())
      )
      .subscribe(
        _=> this.dialogRef.close(this.data),
        err => this.adminFacade.displayErrors(err),
      )
  }
}
