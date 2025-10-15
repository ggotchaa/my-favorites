import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { IResponsibleAccountantDto, MsGraphUser, ResponsibleAccountantDto } from 'src/app/api/GCPClient';
import { AdminFacade } from '../../../admin.facade';
import { ResponsibleAccountantTableDataSource } from 'src/app/model/dataSources/ResponsibleAccountantTableDataSource';

@Component({
    selector: 'app-account-reporting-create',
    templateUrl: './account-reporting-create.component.html',
    styleUrls: ['./account-reporting-create.component.scss'],
    standalone: false
})
export class AccountReportingCreateComponent implements OnInit {
  form: UntypedFormGroup;
  dataLoader = false;
  searchAccountantTerm$ = new Subject<string>();
  searchSupervisorTerm$ = new Subject<string>();
  groupMembers: MsGraphUser[] = [];
  filteredAccountantMembers$: Observable<MsGraphUser[]>;
  filteredSupervisorMembers$: Observable<MsGraphUser[]>;
  public dataSource: ResponsibleAccountantTableDataSource;
  
  constructor(
    public dialogRef: MatDialogRef<AccountReportingCreateComponent>,
    private adminFacade: AdminFacade,
    private fb: UntypedFormBuilder
  ) {
    this.dataSource = new ResponsibleAccountantTableDataSource(false);
    this.dataSource.apiClient = this.adminFacade.responsibleAccountantClient;
    this.form = this.fb.group({
      accountNumber: ['', Validators.required],
      accountantMember: ['', Validators.required],
      accountantFullname: [''],
      supervisorMember: ['', Validators.required],
      supervisorFullname: [''],
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
    return this.groupMembers.filter(member =>
      member.name.toLowerCase().includes(text.toLowerCase()) ||
      member.surname.toLowerCase().includes(text.toLowerCase())
    );
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  onAccountantMemberSelected(selectedAccountant: MsGraphUser){
    this.form.get('accountantFullname')?.setValue(`${selectedAccountant.name} ${selectedAccountant.surname}`);
  }

  onSupervisorMemberSelected(selectedSupervisor: MsGraphUser){
    this.form.get('supervisorFullname')?.setValue(`${selectedSupervisor.name} ${selectedSupervisor.surname}`);
  }

  onAction() {
    if (this.form.valid) {
      const createdDto: IResponsibleAccountantDto = {
        id: 0,
        accountNumber: this.form.get('accountNumber')?.value,
        accountantObjectId: this.form.get('accountantMember')?.value.id,
        accountantFullname: this.form.get('accountantFullname')?.value,
        supervisorObjectId: this.form.get('supervisorMember')?.value.id,
        supervisorFullname: this.form.get('supervisorFullname')?.value,
      };
      const responsibleAccountantDto = new ResponsibleAccountantDto(createdDto);
      this.dataSource.apiClient.addResponsibleAccountant(responsibleAccountantDto).subscribe(
        (newAccountant) => {
          this.dialogRef.close(newAccountant);
        },
        (error) => {
          this.adminFacade.displayErrors(error);
        }
      )
    }
  }

  onFocusAccountant(){
    this.searchAccountantTerm$.next('');
  }

  onFocusSupervisor(){
    this.searchSupervisorTerm$.next('');
  }
}
