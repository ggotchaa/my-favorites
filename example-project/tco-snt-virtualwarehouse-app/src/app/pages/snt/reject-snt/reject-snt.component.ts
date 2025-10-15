import { Validators, UntypedFormControl } from '@angular/forms';
import { SECTIONS } from './../../../model/lists/Sections';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DeclineSntDto, IDeclineSntDto, SntClient } from 'src/app/api/GCPClient';
import { SntFacade } from '../snt.facade';
import { Subscription } from 'rxjs';
import { DsignDialogComponent } from 'src/app/shared/components/dsign-dialog/dsign-dialog.component';
import { SignWidget } from 'src/app/shared/interfaces/sign-widget.model';

@Component({
    selector: 'app-reject-snt',
    templateUrl: './reject-snt.component.html',
    styleUrls: ['./reject-snt.component.scss'],
    standalone: false
})

export class RejectSntComponent{
  sntApi:SntClient;
  sections = SECTIONS;
  isLoading = false;
  dsignDialog: DsignDialogComponent;
  private subscription: Subscription;
  sectionFormControl = new UntypedFormControl('', [
    Validators.required,
  ]);
  @ViewChild('description') description: ElementRef;
  constructor(
    public dialogRef: MatDialogRef<RejectSntComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: number,
    @Inject(SntClient)sntApi: SntClient,
    private sntFacade:SntFacade ) {
      this.sntApi = sntApi;
    }
      
  onCancel(): void {
    this.unsubscribe();
    this.dialogRef.close(null);
  }
  onReject(): void {
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
    const signWidget: SignWidget = { url: '', hasError: false, errorMessage: '' };
    if (!isAuthorized) return;
    const iDeclineSntDto: IDeclineSntDto = {
      sntId: this.data,
      cause: `${this.sectionFormControl.value}: ${this.description.nativeElement.value}`
    }
    const declineSntDto = new DeclineSntDto(iDeclineSntDto);
    this.sntApi.signingPageToDeclineSnt(declineSntDto).subscribe(
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
