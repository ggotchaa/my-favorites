import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AdminFacade } from '../admin.facade';
import { ResponsibleAccountantTableDataSource } from 'src/app/model/dataSources/ResponsibleAccountantTableDataSource';
import { ResponsibleAccountantDto } from 'src/app/api/GCPClient';
import { AccountReportingCreateComponent } from './account-reporting-actions/account-reporting-create/account-reporting-create.component';
import { AccountReportingEditComponent } from './account-reporting-actions/account-reporting-edit/account-reporting-edit.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountReportingDeleteComponent } from './account-reporting-actions/account-reporting-delete/account-reporting-delete.component';

@Component({
    selector: 'app-account-reporting',
    templateUrl: './account-reporting.component.html',
    styleUrls: ['./account-reporting.component.scss'],
    providers: [
        ResponsibleAccountantTableDataSource,
        { provide: 'loading', useValue: true }
    ],
    standalone: false
})
export class AccountReportingComponent implements OnInit {
  displayedColumns: string[] = ["index", "accountNumber","accountantFullname", "supervisorFullname", "actions"]
  unsubscribe$: Subject<void> = new Subject();

  constructor(
    public dataSource: ResponsibleAccountantTableDataSource,
    private adminFacade: AdminFacade,
    public dialog: MatDialog,
  ) { 
    this.dataSource.apiClient = this.adminFacade.responsibleAccountantClient;
  }

  ngOnInit(): void {
    this.dataSource.loadSubjects()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.dataSource.setData(data);
      })
  }

  ngOnDestroy(): void{
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onCreateAction(): MatDialogRef<AccountReportingCreateComponent, any>{
    const dialogRef = this.dialog.open(AccountReportingCreateComponent, {
      closeOnNavigation: true,
      disableClose: true,
      maxWidth:400,
    });

    dialogRef.afterClosed().subscribe(newRecord =>{
      if(newRecord){
        const currentData = this.dataSource.dataSourceSubjects.getValue();
        const newData = [...currentData, newRecord];

        this.dataSource.setData(newData);
        this.adminFacade.displaySuccess('Добавлен новый счет и ответственные лица');
      }
    });

    return dialogRef;
  }

  onEditAction(element: ResponsibleAccountantDto): MatDialogRef<AccountReportingEditComponent, any> {
    const dialogRef = this.dialog.open(AccountReportingEditComponent, {
      data: element,
      closeOnNavigation: true,
      disableClose: true,
      maxWidth: 400,
    });

    dialogRef.afterClosed().subscribe(updatedRecord =>{
      if(updatedRecord){
        const currentData = this.dataSource.dataSourceSubjects.getValue();
        const updatedData = currentData.map(item =>
          item.id === updatedRecord.id ? updatedRecord : item
        );
        this.dataSource.setData(updatedData);
        this.adminFacade.displaySuccess('Изменения сохранены');
      }
    });

    return dialogRef;
  }
  
  onDeleteAction(element: ResponsibleAccountantDto ): MatDialogRef<AccountReportingDeleteComponent, any> {
    const dialogRef = this.dialog.open(AccountReportingDeleteComponent, {
      data: element,
      closeOnNavigation: true,
      disableClose: true,
      maxWidth: 400,
    });

    dialogRef.afterClosed().subscribe((deletedRecord: ResponsibleAccountantDto) => {
          if(deletedRecord){
            this.dataSource.allSourceSubjects = this.dataSource.allSourceSubjects.filter( o => o !== deletedRecord);
            this.dataSource.dataSourceSubjects.next(this.dataSource.allSourceSubjects);
            this.adminFacade.displaySuccess("Удалено");
          }
        }
      );
      
    return dialogRef;
  }

}
