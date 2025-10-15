import { Component, OnInit} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef} from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AdGroupDto, GroupDescriptionDto, GroupRolesDto, IGroupDescriptionDto, IGroupRolesDto, IPutGroupRolesDto, PutGroupRolesDto, RoleType } from 'src/app/api/GCPClient';
import { RoleGroupTableDataSource } from 'src/app/model/dataSources/RoleGroupTableDataSource';
import { SelectedView } from 'src/app/model/interfaces/ISelectedView';
import { ROLES } from 'src/app/model/lists/Roles';
import { AdminFacade } from '../../../admin.facade';
import { CustomValidators } from '../../../model/CustomValidators';

@Component({
    selector: 'app-role-group-create',
    templateUrl: './role-group-create.component.html',
    styleUrls: ['./role-group-create.component.scss'],
    standalone: false
})
export class RoleGroupCreateComponent implements OnInit {

  form: UntypedFormGroup;
  dataLoader = false;
  roles: SelectedView[]
  searchTerm$ = new Subject<string>();
  groups: AdGroupDto[]
  selectedGroup: GroupDescriptionDto;
  selectedRoles: string[] = [];
  private subscription$ = new Subject<void>();
  public dataSource: RoleGroupTableDataSource
  get rolesFormArray(): UntypedFormArray {
    return (this.form.get('roles') as UntypedFormArray)
  }
  constructor(
    public dialogRef: MatDialogRef<RoleGroupCreateComponent>,
    //@Optional() is used to prevent error if no data is passed
    private adminFacade: AdminFacade,
    private fb: UntypedFormBuilder
  ) {
    this.dataSource = new RoleGroupTableDataSource(false);
    this.dataSource.apiClient = this.adminFacade.roleGroupClient
    this.roles = ROLES;
    const roles = this.roles.map(_control => new UntypedFormControl(false));
    this.form = this.fb.group({
      group: ['', Validators.required],
      roles: this.fb.array(roles, [CustomValidators.equalTrue])
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
          takeUntil(this.subscription$),
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
  }
  
  onGroupSelected(value:AdGroupDto): void {
    const IgroupDescriptionDto : IGroupDescriptionDto = {
      name: value.name,
      id: value.id
    }
    const groupDescriptionDto = new GroupDescriptionDto(IgroupDescriptionDto)
    this.selectedGroup = groupDescriptionDto
  }
  onRoleChecked(checked: boolean, role: string): void {
    if(checked){
      this.selectedRoles.push(role);
    }else{
      this.selectedRoles = this.selectedRoles.filter(r => r !== role)
    }
  }
  displayFn(group: AdGroupDto): string {
    return group && group.name ? group.name : '';
  }

  onCloseDialog(){
    this.dialogRef.close();
  }
  onAction(){
    this.dataSource.loadingSubject.next(true);
    const newGroup: IGroupRolesDto = {
      group: this.selectedGroup,
      roles: this.selectedRoles as RoleType[]
    }
    const putNewGroup : IPutGroupRolesDto = {
      groupId: this.selectedGroup.id,
      roles: this.selectedRoles as RoleType[]
    }
    this.dataSource.onCreate(new PutGroupRolesDto(putNewGroup)).subscribe(
      _ => this.dialogRef.close(new GroupRolesDto(newGroup)),
      err => this.adminFacade.displayErrors(err),
     
    )
  }

 

}
