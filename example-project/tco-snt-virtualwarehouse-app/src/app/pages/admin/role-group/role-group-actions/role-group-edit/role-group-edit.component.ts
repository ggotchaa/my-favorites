import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GroupRolesDto, IGroupRolesDto, IPutGroupRolesDto, PutGroupRolesDto, RoleType } from 'src/app/api/GCPClient';
import { RoleGroupTableDataSource } from 'src/app/model/dataSources/RoleGroupTableDataSource';
import { SelectedView } from 'src/app/model/interfaces/ISelectedView';
import { ROLES } from 'src/app/model/lists/Roles';
import { AdminFacade } from '../../../admin.facade';
import { CustomValidators } from '../../../model/CustomValidators';

@Component({
    selector: 'app-edit-role-group',
    templateUrl: './role-group-edit.component.html',
    styleUrls: ['./role-group-edit.component.scss'],
    standalone: false
})
export class RoleGroupEditComponent implements OnInit {
  roles: SelectedView[];
  form: UntypedFormGroup;
  public dataSource: RoleGroupTableDataSource
  private selectedRoles: RoleType[]
  get rolesFormArray(): UntypedFormArray {
    return (this.form.get('roles') as UntypedFormArray)
  }
  constructor(
    public dialogRef: MatDialogRef<RoleGroupEditComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: GroupRolesDto,
    private adminFacade: AdminFacade,
    private fb: UntypedFormBuilder
  ) { 
    this.dataSource = new RoleGroupTableDataSource(false);
    this.dataSource.apiClient = this.adminFacade.roleGroupClient
    this.roles = ROLES;
    const roles = this.roles.map((control) => {
      if(data.roles.includes(control.value as RoleType)) return new UntypedFormControl(true)
      else  return new UntypedFormControl(false)
    });
    this.form = this.fb.group({
      group : [{ value: data.group.name, disabled: true}],
      roles: this.fb.array(roles, [CustomValidators.equalTrue])
    })
  }

  ngOnInit(): void {
    this.selectedRoles = [...this.data.roles]
  }
  onRoleChecked(checked: boolean, role: string): void {
    if(checked){
      this.selectedRoles.push(role as RoleType)
    }else{
      this.selectedRoles = this.selectedRoles.filter(r => r !== role as RoleType)
    }
  }
  onCloseDialog(){
    this.dialogRef.close()
  }
  onAction(){
    this.dataSource.loadingSubject.next(true);
    const editGroup:IGroupRolesDto = {
      group: this.data.group,
      roles: this.selectedRoles
    }
    const putNewGroup: IPutGroupRolesDto = {
        groupId: this.data.group.id,
        roles: this.selectedRoles
    }
    this.dataSource.onEdit(new PutGroupRolesDto(putNewGroup)).subscribe(
      _ => this.dialogRef.close(new GroupRolesDto(editGroup)),
      err => this.adminFacade.displayErrors(err),
    )
  }

}
