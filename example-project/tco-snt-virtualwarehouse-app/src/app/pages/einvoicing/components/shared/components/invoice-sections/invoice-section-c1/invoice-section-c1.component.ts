import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { InvoiceFormUtils } from '../../../InvoiceFormUtils';

@Component({
    selector: 'app-invoice-section-c1',
    templateUrl: './invoice-section-c1.component.html',
    styleUrls: ['./invoice-section-c1.component.scss'],
    standalone: false
})
export class InvoiceSectionC1Component{

  @Input() draftInvoiceForm: UntypedFormGroup;  

  onPublicOfficeDetailsChange() {
    InvoiceFormUtils.ValidatePublicOfficeDetails(this.draftInvoiceForm);
  }
}
