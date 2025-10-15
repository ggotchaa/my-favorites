import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { FormControlElementsBase } from "../FormControlElementsBase";

export class InvoiceSectionC1Validators extends FormControlElementsBase {

  static iikAndPayPurposeFilledTogether: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let iik = control.parent.get('iik').value;
      let payPurpose = control.parent.get('payPurpose').value;      

      return (iik && !payPurpose) || (!iik && payPurpose) ? { iikAndPayPurposeFilledTogether: true } : null;
    }

    return null;
  }  

  static getSectionC1ErrorCount(section: AbstractControl): number {
    if (!section.get('customer.publicOfficeCheckBox').value) return 0;

    return (section.get('publicOffice.iik').errors?.pattern ? 1 : 0) +
      (section.get('publicOffice.iik').errors?.iikAndPayPurposeFilledTogether ? 1 : 0) +

      (section.get('publicOffice.productCode').errors?.pattern ? 1 : 0) +

      (section.get('publicOffice.payPurpose').errors?.iikAndPayPurposeFilledTogether ? 1 : 0) +

      (section.get('publicOffice.bik').errors?.tinRequired ? 1 : 0) +

      (section.get('publicOffice.iik').errors?.iikRequired ? 1 : 0) +

      (section.get('publicOffice.payPurpose').errors?.payPurposeRequired ? 1 : 0);
  }

  static iikRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let isPublicOffice = control.parent.parent.get('customer.publicOfficeCheckBox').value;
      return isPublicOffice && !control.value ? { iikRequired: true } : null;
    }
    return null;
  }

  static payPurposeRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let isPublicOffice = control.parent.parent.get('customer.publicOfficeCheckBox').value;
      return isPublicOffice && !control.value ? { payPurposeRequired: true } : null;
    }
    return null;
  }
}
