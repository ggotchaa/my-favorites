import { Component, Input, OnInit} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-invoice-section-a-esf',
    templateUrl: './invoice-section-a-esf.component.html',
    styleUrls: ['./invoice-section-a-esf.component.scss'],
    standalone: false
})

export class InvoiceSectionAEsfComponent implements OnInit {
  fixedInvoiceDetails = {
    date: '4.1. Дата выписки счета-фактуры, в который вносятся исправления',
    num: '4.2. Номер счета-фактуры, в который вносятся исправления',
    regNum: '4.3. Регистрационный номер счета-фактуры, в который вносятся исправления', 
    enableInvoiceDetails: true
  }
  additionalInvoiceDetails = {
    date: '5.1. Дата выписки счета-фактуры, к которому выписывается дополнительный счет-фактура',
    num: '5.2. Номер счета-фактуры, к которому выписывается дополнительный счет-фактура',
    regNum: '5.3. Регистрационный номер счета-фактуры, к которому выписывается дополнительный счет-фактура', 
    enableInvoiceDetails: true
  }
  invoiceDetails = {date: '', num: '', regNum: '', enableInvoiceDetails: false}
  @Input() draftInvoiceForm: UntypedFormGroup;
  private unsubscribe$: Subject<void> = new Subject<void>();
  private get fixedCheckBox(): UntypedFormControl {
    return this.draftInvoiceForm.get('related.fixedInvoiceCheckBox') as UntypedFormControl;
  }
  private get additionalCheckBox(): UntypedFormControl {
    return this.draftInvoiceForm.get('related.additionalInvoiceCheckBox') as UntypedFormControl;
  }
  ngOnInit(): void { 
    this.isHaveRelatedInvoice()
  }
  public isHaveRelatedInvoice(): void {
    if (this.fixedCheckBox.value) 
      this.invoiceDetails = this.fixedInvoiceDetails
    if (this.additionalCheckBox.value)
      this.invoiceDetails = this.additionalInvoiceDetails
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
  