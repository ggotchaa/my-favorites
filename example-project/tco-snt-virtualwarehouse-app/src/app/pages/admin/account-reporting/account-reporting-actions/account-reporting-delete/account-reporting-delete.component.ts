import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResponsibleAccountantDto } from 'src/app/api/GCPClient';
import { AdminFacade } from '../../../admin.facade';
import { ResponsibleAccountantTableDataSource } from 'src/app/model/dataSources/ResponsibleAccountantTableDataSource';

@Component({
    selector: 'app-account-reporting-delete',
    templateUrl: './account-reporting-delete.component.html',
    styleUrls: ['./account-reporting-delete.component.scss'],
    standalone: false
})
export class AccountReportingDeleteComponent{
  public dataSource: ResponsibleAccountantTableDataSource
  constructor(
    public dialogRef: MatDialogRef<AccountReportingDeleteComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ResponsibleAccountantDto,
    public adminFacade: AdminFacade
  ) { 
    this.dataSource = new ResponsibleAccountantTableDataSource(false)
    this.dataSource.apiClient = this.adminFacade.responsibleAccountantClient
  }
  
  onCloseDialog(){
    this.dialogRef.close()
  }

  onAction(){
    this.dataSource.apiClient.deleteResponsibleAccountant(this.data.id).subscribe(
        (_) =>{},
        (err) => {
          this.adminFacade.displayErrors(err)
        },
        () => {
          this.dialogRef.close(this.data)
        }
      )
  }

}
