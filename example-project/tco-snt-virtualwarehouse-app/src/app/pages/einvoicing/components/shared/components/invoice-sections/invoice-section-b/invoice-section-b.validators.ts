import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormControlElementsBase } from '../FormControlElementsBase';



export class InvoiceSectionBValidators extends FormControlElementsBase {

  static bankDetailsRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let isSellerPublicOffice = control.root.get('customer.publicOfficeCheckBox').value;
      return isSellerPublicOffice && !control.value ? { bankDetailsRequired: true } : null;
    }

    return null;
  }

  static DisableSectionB1: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const bankName = control.get('seller.bank') as UntypedFormControl;
    const kbe = control.get('seller.kbe') as UntypedFormControl;
    const iik = control.get('seller.iik') as UntypedFormControl;
    const bik = control.get('seller.bik') as UntypedFormControl;

    const customer = control.get('customer') as UntypedFormControl;
    const isSellerPublicOffice = customer.get('publicOfficeCheckBox').value;
    if(isSellerPublicOffice) {
      InvoiceSectionBValidators.enableElements([bankName, kbe, iik, bik]);
    } else{
      InvoiceSectionBValidators.disableElements([bankName, kbe, iik, bik]);

    }
    return null;
  }

  static bankDetailsFilledAllTogether: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let filledDetail = 0;

      filledDetail += control.parent.get('kbe').value ? 1 : 0;
      filledDetail += control.parent.get('iik').value ? 1 : 0;
      filledDetail += control.parent.get('bik').value ? 1 : 0;
      filledDetail += control.parent.get('name').value ? 1 : 0;

      return filledDetail > 0 && filledDetail < 4 ? { bankDetailsFilledAllTogether: true } : null;
    }

    return null;
  }
  

  static getSectionBErrorCount(invoiceCreateForm: UntypedFormGroup): number {
    return (invoiceCreateForm.get('seller.address').errors?.required ? 1 : 0) +
      (invoiceCreateForm.get('seller.name').errors?.required ? 1 : 0) +
      (invoiceCreateForm.get('seller.tin').errors?.required ? 1 : 0) +
      (invoiceCreateForm.get('seller.tin').errors?.pattern ? 1 : 0) +
      (invoiceCreateForm.get('seller.tin').errors?.minlength ? 1 : 0) +
      (invoiceCreateForm.get('seller.tin').errors?.maxlength ? 1 : 0) +
      InvoiceSectionBValidators.getSectionB1ErrorCount(invoiceCreateForm);
  }

  static getSectionB1ErrorCount(form: UntypedFormGroup): number {
    return (form.get('seller.kbe').errors?.bankDetailsRequired ? 1 : 0) +
      (form.get('seller.kbe').errors?.bankDetailsFilledAllTogether ? 1 : 0) +
      (form.get('seller.kbe').errors?.pattern ? 1 : 0) +

      (form.get('seller.iik').errors?.bankDetailsRequired ? 1 : 0) +
      (form.get('seller.iik').errors?.bankDetailsFilledAllTogether ? 1 : 0) +
      (form.get('seller.iik').errors?.pattern ? 1 : 0) +

      (form.get('seller.bik').errors?.bankDetailsRequired ? 1 : 0) +
      (form.get('seller.bik').errors?.bankDetailsFilledAllTogether ? 1 : 0) +
      (form.get('seller.bik').errors?.pattern ? 1 : 0) +

      (form.get('seller.bank').errors?.bankDetailsRequired ? 1 : 0) +
      (form.get('seller.bank').errors?.bankDetailsFilledAllTogether ? 1 : 0);
  }
}
