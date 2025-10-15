import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UntypedFormControl, Validators } from '@angular/forms';
import { ConfirmSntDto, IConfirmSntDto, SntClient } from 'src/app/api/GCPClient';
import { SntFacade } from '../snt.facade';
import { Subscription } from 'rxjs';
import { DsignDialogComponent } from 'src/app/shared/components/dsign-dialog/dsign-dialog.component';
import { SignWidget } from 'src/app/shared/interfaces/sign-widget.model';

@Component({
    selector: 'app-confirm-snt',
    templateUrl: './confirm-snt.component.html',
    styleUrls: ['./confirm-snt.component.scss'],
    standalone: false
})


export class ConfirmSntComponent{
  private subscription: Subscription;
  dsignDialog: DsignDialogComponent;
  sntApi:SntClient;
  isLoading = false;
  powerOfAttorneyNumberFormControl = new UntypedFormControl('', [
    Validators.required,
  ]);
  powerOfAttorneyDateFormControl = new UntypedFormControl('', [
    Validators.required,
  ]);
 

  constructor(
    public dialogRef: MatDialogRef<ConfirmSntComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: number,
    @Inject(SntClient)sntApi: SntClient,
    private sntFacade: SntFacade
    ) {
      this.sntApi = sntApi;
    }

  DateFilter = (d: Date | null): boolean => {
    return d < new Date();
  }
  onCancel(): void {
    this.unsubscribe();
    this.dialogRef.close(null);
  }  

  onConfirm(): void {
    this.dialogRef.close();
    const dialogRefDsign = this.dialog.open(DsignDialogComponent, {
      closeOnNavigation: true,
      disableClose: true,
      width: "400px",
    });
    this.dsignDialog = dialogRefDsign.componentInstance;
    this.dsignDialog.verifyAuthentication().subscribe(
      isAuthorized => this.startSigningProcess(isAuthorized),
      error => this.sntFacade.displayErrors(error)
    );
  }

  
  private startSigningProcess(isAuthorized: boolean): void {
    if (!isAuthorized) return;
    const signWidget: SignWidget = { url: '', hasError: false, errorMessage: '' };
    const iConfirmSntDto: IConfirmSntDto = {
      sntId : this.data,
      powerOfAttorneyDate: this.powerOfAttorneyDateFormControl.value,
      powerOfAttorneyNumber: this.powerOfAttorneyNumberFormControl.value
    }; 
    const confirmSntDto = new ConfirmSntDto(iConfirmSntDto);
    this.sntApi.signingPageToConfirmSnt(confirmSntDto).subscribe(
      response => this.handleSignResponse(response, signWidget),
      error => this.handleSignError(error, signWidget)
    );
  }

  private handleSignResponse(response: any, signWidget: SignWidget): void {
    signWidget.url = response.urlToSign;
    this.dsignDialog.signDocument(signWidget);
  }
  
  private handleSignError(error: any, signWidget: SignWidget): void {
    signWidget.hasError = true;
    signWidget.errorMessage = error.title;
    this.dsignDialog.signDocument(signWidget);
  }

  private unsubscribe() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

