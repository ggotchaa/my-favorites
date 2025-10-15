import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { TransportTypeCodes } from 'src/app/model/lists/Einvoicing/TransportTypeCodes';
import { DELIVERY_CONDITION } from 'src/app/pages/snt/snt-sections/snt-section-f/snt-section-f.component';

@Component({
    selector: 'app-invoice-section-e',
    templateUrl: './invoice-section-e.component.html',
    styleUrls: ['./invoice-section-e.component.scss'],
    standalone: false
})
export class InvoiceSectionEComponent {
  @Input() draftInvoiceForm: UntypedFormGroup

  transportTypeCodes = TransportTypeCodes;
  deliveryConditionCodes = DELIVERY_CONDITION;

  today = new Date();

}
