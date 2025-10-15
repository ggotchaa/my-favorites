import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
import { GroupRolesDto, GroupTaxpayerStoreClient, GroupTaxpayerStoresDto, TaxpayerStoreDescriptionDto } from 'src/app/api/GCPClient';
import { StoreGroupsTableDataSource } from 'src/app/model/dataSources/StoreGroupsTableDataSource';
import { AdminFacade } from '../admin.facade';
import { StoreGroupCreateComponent } from './store-group-actions/store-group-create/store-group-create.component';
import { StoreGroupDeleteComponent } from './store-group-actions/store-group-delete/store-group-delete.component';
import { StoreGroupEditComponent } from './store-group-actions/store-group-edit/store-group-edit.component';

@Component({
    selector: 'app-store-group',
    templateUrl: './store-group.component.html',
    styleUrls: ['./store-group.component.scss'],
    providers: [
        StoreGroupsTableDataSource,
        { provide: 'loading', useValue: true },
    ],
    standalone: false
})
export class StoreGroupComponent implements OnInit {
  displayedColumns: string[] = ["group", "stores", "actions"]
  constructor(
    public dataSource: StoreGroupsTableDataSource,
    private adminFacade:  AdminFacade,
    public dialog: MatDialog,
  ) {
    this.dataSource.apiClient = this.adminFacade.groupTaxpayerStoreClient
   }

  ngOnInit(): void {
    this.dataSource.loadSubjects()
      .pipe(
        tap(data => data.sort(this.dataSource.compareFnByName))
      )
      .subscribe(data => {
        this.dataSource.dataSourceSubjects.next(data);
        this.dataSource.allSourceSubjects = data;
      })
  }

  getTaxpayerStoreName(stores: TaxpayerStoreDescriptionDto[]): string[] {
    return stores.map(store => store.name)
  }
  onCreateAction(){
    const dialog = this.addRoleGroup();
    dialog.afterClosed().subscribe(
      (data: GroupTaxpayerStoresDto) => {
        if(data){
          data.taxpayerStores.sort(this.dataSource.compareFnById)
          this.dataSource.allSourceSubjects = [...this.dataSource.allSourceSubjects, data]
          this.dataSource.allSourceSubjects.sort(this.dataSource.compareFnByName)
          this.dataSource.dataSourceSubjects.next(this.dataSource.allSourceSubjects);
          this.adminFacade.displaySuccess("Группа успешно создана");
        }
      }
    )
  }
  onDeleteAction(element: GroupTaxpayerStoresDto ){
    const deleteRoleGroup = this.deleteRoleGroup(element);
    deleteRoleGroup.afterClosed()
      .subscribe(
        (group: GroupTaxpayerStoresDto) => {
          if(group){
            this.dataSource.allSourceSubjects = this.dataSource.allSourceSubjects.filter( o => o !== group);
            this.dataSource.dataSourceSubjects.next(this.dataSource.allSourceSubjects);
            this.adminFacade.displaySuccess("Группа успешно удалена");
          }
        }
      );
  }

  onEditAction(element: GroupTaxpayerStoresDto) {
    const editRoleGroup = this.editRoleGroup(element);
    editRoleGroup.afterClosed()
      .subscribe(
        (groupStores: GroupTaxpayerStoresDto) => {
          if(groupStores){
            groupStores.taxpayerStores.sort(this.dataSource.compareFnById)
            this.dataSource.allSourceSubjects.forEach(g => {
              if(g.group.id === groupStores.group.id){
                g.taxpayerStores = groupStores.taxpayerStores;
              }
            })
            this.dataSource.dataSourceSubjects.next(this.dataSource.allSourceSubjects);
            this.adminFacade.displaySuccess("Группа успешно изменена");
          }
        }
      );
  }
  private deleteRoleGroup(element: GroupTaxpayerStoresDto): MatDialogRef<StoreGroupDeleteComponent, any>{
    const dialogRef = this.dialog.open(StoreGroupDeleteComponent, {
      data: element,
      closeOnNavigation: true,
      disableClose: true
    });
    return dialogRef;
  }
  private addRoleGroup(): MatDialogRef<StoreGroupCreateComponent, any>{
   
    const dialogRef = this.dialog.open(StoreGroupCreateComponent, {
      closeOnNavigation: true,
      disableClose: true,
      width: '400px',
      maxHeight: 'none',
      maxWidth: 'none',
    });
    return dialogRef;
  }
  private editRoleGroup(element: GroupTaxpayerStoresDto): MatDialogRef<StoreGroupEditComponent, any>{
    const dialogRef = this.dialog.open(StoreGroupEditComponent, {
      data:element,
      closeOnNavigation: true,
      disableClose: true,
      width: '400px',
      maxHeight: 'none',
      maxWidth: 'none',
    
    });
    return dialogRef;
  }

}


