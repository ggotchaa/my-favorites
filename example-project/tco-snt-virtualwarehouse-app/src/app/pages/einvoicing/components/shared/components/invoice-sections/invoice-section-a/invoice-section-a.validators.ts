import { AbstractControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormControlElementsBase } from '../FormControlElementsBase';

export class InvoiceSectionAValidators extends FormControlElementsBase {
  static dateRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control) {
      return !control.value ? { dateRequired: true } : null;
    }

    return null;
  }

  static getSectionAErrorCount(invoiceForm: UntypedFormGroup): number {
    return (invoiceForm.get('date').errors?.dateRequired ? 1 : 0) +
      (invoiceForm.get('num').errors?.required ? 1 : 0) +
      (invoiceForm.get('turnoverDate').errors?.dateRequired ? 1 : 0) +
      (invoiceForm.get('turnoverDate').errors?.dateCantBeEarlierThanFiveYearsAndInFuture ? 1 : 0);
  }
}
