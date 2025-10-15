import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AwpDto, AwpWorksPerformedDto, GetSntProductBySntIdResponseDto, SntSimpleDto } from 'src/app/api/GCPClient';
import { ProductSelectAwpComponent } from 'src/app/shared/components/product-select-awp/product-select-awp.component';
import { ProductSelectSntComponent } from 'src/app/shared/components/product-select-snt/product-select-snt.component';
import { SiblingComponentsDataSharing } from 'src/app/shared/services/sibling-components-data-sharing.service';
import { InvoiceFacade } from '../../../invoice.facade';
import { Utilities } from 'src/app/shared/helpers/Utils';

@Component({
    selector: 'app-invoice-section-f',
    templateUrl: './invoice-section-f.component.html',
    styleUrls: ['./invoice-section-f.component.scss'],
    standalone: false
})
export class InvoiceSectionFComponent implements OnDestroy {

  @Input() draftInvoiceForm: UntypedFormGroup;

  @Output() awpWorksPerformedSelected = new EventEmitter<AwpWorksPerformedDto>();
  
  @Output() sntProductsBySntId = new EventEmitter<GetSntProductBySntIdResponseDto>();
  today = new Date();

  constructor(
    public dialog: MatDialog,
    private invoiceFacade: InvoiceFacade,

    private siblingComponentsDataSharing: SiblingComponentsDataSharing,
    
  ) {}

  get registrationDate(): string {
    const date = this.draftInvoiceForm.get('date').value;
    if (!date)
      return '';

    const registrationDate = date as Date;
    if (registrationDate.getFullYear() > 1)
      return formatDate(registrationDate, 'dd.MM.yyyy', 'en');

    return '';
  }

  private unsubscribe$: Subject<void> = new Subject<void>();

  openSntSelect() {
    let sntSelectRef = this.dialog.open(ProductSelectSntComponent, {
      width: '1500px',
      height: '90vh',
      maxHeight: 'none',
      maxWidth: 'none',
      data: { title: 'СНТ' },
    });

    sntSelectRef.afterClosed()
    .pipe(
      switchMap((snt: SntSimpleDto | null) => {
        if(snt == null) {
          return of(null)
        }else{
          this.draftInvoiceForm.get('requisites.deliveryDocNum').setValue(snt.registrationNumber);
          this.draftInvoiceForm.get('requisites.deliveryDocDate').setValue(snt.date);
          this.siblingComponentsDataSharing.setLoaderStatus(true);
          return this.invoiceFacade.getSntProductsBySntId(snt.id)
        }
       
      })
    )
    .subscribe(
      snt => {
      this.siblingComponentsDataSharing.setLoaderStatus(false)
      if(snt) this.sntProductsBySntId.emit(snt);
      },
      err => {
        this.invoiceFacade.displayErrors(err)
        this.draftInvoiceForm.get('requisites.deliveryDocNum').setValue('');
        this.draftInvoiceForm.get('requisites.deliveryDocDate').setValue('');
        this.siblingComponentsDataSharing.setLoaderStatus(false)
      }
    );
  }

  openAwpSelect() {
    let senderTin = this.draftInvoiceForm.get('seller.tin').value;
    let recipientTin = this.draftInvoiceForm.get('customer.tin').value;
    let awpSelectRef = this.dialog.open(ProductSelectAwpComponent, {
      width: '1500px',
      height: '90vh',
      maxHeight: 'none',
      maxWidth: 'none',
      data: { senderTin, recipientTin },
    });

    
    awpSelectRef.afterClosed().pipe(
      switchMap( (awp: AwpDto | null) => {
        if(awp == null) {
          return of(null);
        }else{
          this.draftInvoiceForm.get('requisites.deliveryDocNum').setValue(awp.registrationNumber);
          this.draftInvoiceForm.get('requisites.deliveryDocDate').setValue(awp.awpDate);
          this.siblingComponentsDataSharing.setLoaderStatus(true);
          return this.invoiceFacade.getAwpWorksPerformedByAwpdId(awp.id);
        }
      })
    ).subscribe((res) => {
      this.siblingComponentsDataSharing.setLoaderStatus(false);
      if(res) this.awpWorksPerformedSelected.emit(res)
    });

  }

  public isSentInvoice(): boolean {
    return Utilities.isEmptyValue(this.draftInvoiceForm.get('regNum').value)
  }
  
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
