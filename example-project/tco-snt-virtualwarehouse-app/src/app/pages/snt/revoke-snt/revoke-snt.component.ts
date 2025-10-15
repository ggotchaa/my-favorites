import { Validators, UntypedFormControl } from '@angular/forms';
import { SECTIONS } from './../../../model/lists/Sections';
import { Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { IRevokeSntDto, RevokeSntDto, SntClient } from 'src/app/api/GCPClient';
import { SntFacade } from '../snt.facade';
import { Subscription } from 'rxjs';
import { DsignDialogComponent } from 'src/app/shared/components/dsign-dialog/dsign-dialog.component';
import { SignWidget } from 'src/app/shared/interfaces/sign-widget.model';

@Component({
    selector: 'app-revoke-snt',
    templateUrl: './revoke-snt.component.html',
    styleUrls: ['./revoke-snt.component.scss'],
    standalone: false
})

export class RevokeSntComponent implements  OnDestroy {
  sntApi:SntClient;
  sections = SECTIONS;
  isLoading = false;
  private subscription: Subscription;
  dsignDialog: DsignDialogComponent;
  sectionFormControl = new UntypedFormControl('', [
    Validators.required,
  ]);
  @ViewChild('description') description: ElementRef;
  constructor(
    public dialogRef: MatDialogRef<RevokeSntComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: number,
    @Inject(SntClient)sntApi: SntClient,
    private sntFacade:SntFacade ) {
      this.sntApi = sntApi;
    }  

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  onCancel(): void {
    this.unsubscribe();
    this.dialogRef.close(null);
  }
  onRevoke(): void {
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
    const iRevokeSntDto: IRevokeSntDto = {
      sntId: this.data,
      cause: `${this.sectionFormControl.value}: ${this.description.nativeElement.value}`
    }
    const revokeSntDto = new RevokeSntDto(iRevokeSntDto);
    this.sntApi.signingPageToRevokeSnt(revokeSntDto).subscribe(
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
