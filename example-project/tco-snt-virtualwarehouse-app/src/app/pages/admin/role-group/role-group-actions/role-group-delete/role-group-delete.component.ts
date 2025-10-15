import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GroupRolesDto } from 'src/app/api/GCPClient';
import { RoleGroupTableDataSource } from 'src/app/model/dataSources/RoleGroupTableDataSource';
import { AdminFacade } from '../../../admin.facade';

@Component({
    selector: 'app-delete-role-group',
    templateUrl: './role-group-delete.component.html',
    styleUrls: ['./role-group-delete.component.scss'],
    standalone: false
})
export class RoleGroupDeleteComponent{
  public dataSource: RoleGroupTableDataSource
  constructor(
    public dialogRef: MatDialogRef<RoleGroupDeleteComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: GroupRolesDto,
    public adminFacade: AdminFacade
  ) { 
    this.dataSource = new RoleGroupTableDataSource(false)
    this.dataSource.apiClient = this.adminFacade.roleGroupClient
  }
  
  onCloseDialog(){
    this.dialogRef.close()
  }

  onAction(){
    this.dataSource.loadingSubject.next(true);
    this.dataSource.onDelete(this.data.group.id)
      .subscribe(
        _=> this.dialogRef.close(this.data),
        err => this.adminFacade.displayErrors(err),
      )
  }

}
