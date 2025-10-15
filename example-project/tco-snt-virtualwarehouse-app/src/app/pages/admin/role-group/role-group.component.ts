import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { GroupRoleClient, GroupRolesDto, PutGroupRolesDto, RoleType } from 'src/app/api/GCPClient';
import { ROLES } from 'src/app/model/lists/Roles';
import { RoleGroupTableDataSource } from '../../../model/dataSources/RoleGroupTableDataSource'
import { AdminFacade } from '../admin.facade';
import { RoleGroupDeleteComponent } from './role-group-actions/role-group-delete/role-group-delete.component';
import { RoleGroupEditComponent } from './role-group-actions/role-group-edit/role-group-edit.component';
import { RoleGroupCreateComponent } from './role-group-actions/role-group-create/role-group-create.component';


@Component({
    selector: 'app-role-group',
    templateUrl: './role-group.component.html',
    styleUrls: ['./role-group.component.scss'],
    providers: [
        RoleGroupTableDataSource,
        { provide: 'loading', useValue: true }
    ],
    standalone: false
})
export class RoleGroupComponent implements OnInit {
  displayedColumns: string[] = ["group","roles", "actions"]
  constructor(
    public dataSource: RoleGroupTableDataSource,
    private roleGroupClient: GroupRoleClient,
    private adminFacade:  AdminFacade,
    public dialog: MatDialog,
  ) { 
    this.dataSource.apiClient = this.roleGroupClient
  }

  ngOnInit(): void {
    this.dataSource.loadSubjects()
      .pipe(
        tap(data =>{
          data.sort(this.dataSource.compareFnByName).forEach(d => d.roles = d.roles.sort(this.dataSource.compareFn))
        })
      )
      .subscribe(data => {
        this.dataSource.dataSourceSubjects.next(data);
        this.dataSource.allSourceSubjects = data;
      })
  }

  localizedRoles(roles: RoleType[]): string[]{
    const localizedRoles: string[] = [];
    roles.forEach(role => {
      const localizedRole = ROLES.find(r => r.value === role);
      if(localizedRole) localizedRoles.push(localizedRole.viewValue);
    })
    return localizedRoles;
  }
  private deleteRoleGroup(element: GroupRolesDto): MatDialogRef<RoleGroupDeleteComponent, any>{
    const dialogRef = this.dialog.open(RoleGroupDeleteComponent, {
      data: element,
      closeOnNavigation: true,
      disableClose: true
    });
    return dialogRef;
  }
  private addRoleGroup(): MatDialogRef<RoleGroupCreateComponent, any>{
   
    const dialogRef = this.dialog.open(RoleGroupCreateComponent, {
      closeOnNavigation: true,
      disableClose: true,
      width: '500px',
      maxHeight: 'none',
      maxWidth: 'none',
    });
    return dialogRef;
  }
  private editRoleGroup(element: GroupRolesDto): MatDialogRef<RoleGroupEditComponent, any>{
    const dialogRef = this.dialog.open(RoleGroupEditComponent, {
      data:element,
      closeOnNavigation: true,
      disableClose: true,
      width: '500px',
      maxHeight: 'none',
      maxWidth: 'none',
    
    });
    return dialogRef;
  }
 
  onEditAction(element: GroupRolesDto){
    const clonedElement: GroupRolesDto =  Object.assign({}, element);
    const dialog = this.editRoleGroup(clonedElement);
    dialog.afterClosed().subscribe(
      (data: GroupRolesDto) => {
        if(data){
          data.roles.sort(this.dataSource.compareFn)
          this.dataSource.allSourceSubjects.forEach(g => {
            if(g.group.id === data.group.id){
              g.roles = data.roles;
            }
          })
          this.dataSource.dataSourceSubjects.next(this.dataSource.allSourceSubjects);
          this.adminFacade.displaySuccess("Группа успешно изменена");
        }
      }
    )
  }
  onDeleteAction(element: GroupRolesDto ){
    const deleteRoleGroup = this.deleteRoleGroup(element);
    deleteRoleGroup.afterClosed()
      .subscribe(
        (group: GroupRolesDto) => {
          if(group){
            this.dataSource.allSourceSubjects = this.dataSource.allSourceSubjects.filter( o => o !== group);
            this.dataSource.dataSourceSubjects.next(this.dataSource.allSourceSubjects);
            this.adminFacade.displaySuccess("Группа успешно удалена");
          }
        }
      );
  }
  onCreateAction(){
    const dialog = this.addRoleGroup();
    dialog.afterClosed().subscribe(
      (data: GroupRolesDto) => {
        if(data){
          data.roles.sort(this.dataSource.compareFn)
          this.dataSource.allSourceSubjects = [...this.dataSource.allSourceSubjects, data]
          this.dataSource.allSourceSubjects.sort(this.dataSource.compareFnByName)
          this.dataSource.dataSourceSubjects.next(this.dataSource.allSourceSubjects);
          this.adminFacade.displaySuccess("Группа успешно создана");
        }
      }
    )
  }

}
