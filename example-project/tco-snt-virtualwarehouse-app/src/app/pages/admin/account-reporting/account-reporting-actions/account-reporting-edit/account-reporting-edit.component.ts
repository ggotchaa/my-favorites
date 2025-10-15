import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, Subject, tap } from 'rxjs';
import { MsGraphUser, ResponsibleAccountantDto, IResponsibleAccountantDto } from 'src/app/api/GCPClient';
import { AdminFacade } from '../../../admin.facade';
import { ResponsibleAccountantTableDataSource } from 'src/app/model/dataSources/ResponsibleAccountantTableDataSource';

@Component({
    selector: 'app-account-reporting-edit',
    templateUrl: './account-reporting-edit.component.html',
    styleUrls: ['./account-reporting-edit.component.scss'],
    standalone: false
})
export class AccountReportingEditComponent implements OnInit {
  form: UntypedFormGroup;
  dataLoader = false;
  searchAccountantTerm$ = new Subject<string>();
  searchSupervisorTerm$ = new Subject<string>();
  groupMembers: MsGraphUser[] = [];
  filteredAccountantMembers$: Observable<MsGraphUser[]>;
  filteredSupervisorMembers$: Observable<MsGraphUser[]>;
  public dataSource: ResponsibleAccountantTableDataSource;

  constructor(
    public dialogRef: MatDialogRef<AccountReportingEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResponsibleAccountantDto,
    private adminFacade: AdminFacade,
    private fb: UntypedFormBuilder
  ) {
    this.dataSource = new ResponsibleAccountantTableDataSource(false);
    this.dataSource.apiClient = this.adminFacade.responsibleAccountantClient;
    this.form = this.fb.group({
      accountNumber: [data.accountNumber, Validators.required],
      accountantMember: [{id: data.accountantObjectId, name: data.accountantFullname, surname: '' }, Validators.required],
      accountantFullname: [data.accountantFullname],
      supervisorMember: [{id: data.supervisorObjectId, name: data.supervisorFullname, surname: '' }, Validators.required],
      supervisorFullname: [data.supervisorFullname],
    });

    this.filteredAccountantMembers$ = this.searchAccountantTerm$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      map(text => this.filterMembers(text))
    );

    this.filteredSupervisorMembers$ = this.searchSupervisorTerm$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      map(text => this.filterMembers(text))
    );
  }

  ngOnInit(): void {
    this.form.markAllAsTouched();
    this.dataLoader = true;
    this.adminFacade.getEinvoicingGroupMembers().pipe(
      tap(members =>{
        this.groupMembers = members;
        this.dataLoader = false;
      }),
      catchError(error =>{
        this.dataLoader = false;
        return of([]);
      })
    ).subscribe();
  }

  displayFn(member: MsGraphUser): string {
    return member ? `${member.name} ${member.surname}` : '';
  }

  private filterMembers(text: string): MsGraphUser[]{
    if (!text.trim()) {
      return this.groupMembers;
    }
    return this.groupMembers.filter(member =>
      member.name.toLowerCase().includes(text.toLowerCase()) ||
      member.surname.toLowerCase().includes(text.toLowerCase())
    );
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  onAccountantMemberSelected(selectedAccountant: MsGraphUser) {
    this.form.get('accountantFullname')?.setValue(`${selectedAccountant.name} ${selectedAccountant.surname}`);
  }

  onSupervisorMemberSelected(selectedSupervisor: MsGraphUser) {
    this.form.get('supervisorFullname')?.setValue(`${selectedSupervisor.name} ${selectedSupervisor.surname}`);
  }

  onSave() {
    if (this.form.valid) {
      const updatedDto: IResponsibleAccountantDto = {
        id: this.data.id,
        accountNumber: this.form.get('accountNumber')?.value,
        accountantObjectId: this.form.get('accountantMember')?.value.id,
        accountantFullname: this.form.get('accountantFullname')?.value,
        supervisorObjectId: this.form.get('supervisorMember')?.value.id,
        supervisorFullname: this.form.get('supervisorFullname')?.value,
      };
      const responsibleAccountantDto = new ResponsibleAccountantDto(updatedDto);

      this.dataSource.apiClient.updateResponsibleAccountant(responsibleAccountantDto.id, responsibleAccountantDto).subscribe(
        (updatedAccountant) => {
          this.dialogRef.close(updatedAccountant);
        },
        (error) => {
          this.adminFacade.displayErrors(error);
        }
      );
    }
  }

  onFocusAccountant(){
    this.searchAccountantTerm$.next('');
  }

  onFocusSupervisor(){
    this.searchSupervisorTerm$.next('');
  }
}
