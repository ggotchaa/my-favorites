import { AbstractControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormControlElementsBase } from '../FormControlElementsBase';

export class InvoiceSectionFValidators extends FormControlElementsBase {
  static dateRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control) {
      return !control.value ? { dateRequired: true } : null;
    }

    return null;
  }

  static getSectionFErrorCount(invoiceForm: UntypedFormGroup): number {
    return (invoiceForm.get('requisites.deliveryDocNum').errors?.required ? 1 : 0) +
      (invoiceForm.get('requisites.deliveryDocDate').errors?.required ? 1 : 0);
  }
}
