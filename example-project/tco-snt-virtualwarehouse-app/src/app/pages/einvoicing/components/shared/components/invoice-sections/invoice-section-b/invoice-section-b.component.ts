import { Component, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { CustomerCategory } from 'src/app/model/enums/CustomerCategory';
import { KztCurrencyCode } from 'src/app/model/GlobalConst';
import { SntSectionBValidators } from 'src/app/pages/snt/snt-sections/snt-section-b/snt-section-b.validators';
import { InvoiceFormUtils } from '../../../InvoiceFormUtils';

@Component({
    selector: 'app-invoice-section-b',
    templateUrl: './invoice-section-b.component.html',
    styleUrls: ['./invoice-section-b.component.scss'],
    standalone: false
})

export class InvoiceSectionBComponent {
  private unsubscribe$: Subject<void> = new Subject<void>();

  @Input() draftInvoiceForm: UntypedFormGroup;

  onCategoryChanged(checked: boolean, value: string) {
    let sellerStatusesControl = this.draftInvoiceForm.get('seller.statuses');
    let statusesArray = sellerStatusesControl.value as string[];

    let index = statusesArray.indexOf(value);
    let elementExists = index > -1;

    if (checked && !elementExists) {
      statusesArray.push(value);
    } else if (!checked && elementExists) {
      statusesArray.splice(index, 1);
    }
    sellerStatusesControl.setValue(statusesArray);
    InvoiceFormUtils.udpateValidationOfProductsTnvedCode(this.draftInvoiceForm);    
  }

  changeCurrencyCode(statuses: string[]) {
    const currencyCode = this.draftInvoiceForm.get('currencyCode') as UntypedFormControl;
    const currencyRate = this.draftInvoiceForm.get('currencyRate') as UntypedFormControl;

    if (statuses.some(s =>
      s === CustomerCategory.SHARING_AGREEMENT_PARTICIPANT ||
      s === CustomerCategory.EXPORTER ||
      s === CustomerCategory.TRANSPORTER)) {
      currencyCode.enable();
    }
    else {
      SntSectionBValidators.DisableAndSetValueElement(currencyCode, KztCurrencyCode);
    }
    currencyRate.updateValueAndValidity();
  }  

  onBankDetailsChange() {
    InvoiceFormUtils.updateValidationOfSellerBankDetails(this.draftInvoiceForm);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
