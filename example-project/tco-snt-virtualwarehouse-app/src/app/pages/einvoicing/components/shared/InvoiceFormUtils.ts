import { UntypedFormArray, UntypedFormGroup } from "@angular/forms";

export class InvoiceFormUtils {
  static udpateValidationOfProductsTnvedCode(invoiceForm: UntypedFormGroup) {
    let products = invoiceForm.get('products') as UntypedFormArray;
    products.controls.forEach(p => { p.get('unitCode').updateValueAndValidity() });
  }

  static updateValidationOfSellerBankDetails(invoiceForm: UntypedFormGroup) {
    invoiceForm.get('seller.kbe').updateValueAndValidity();
    invoiceForm.get('seller.iik').updateValueAndValidity();
    invoiceForm.get('seller.bik').updateValueAndValidity();
    invoiceForm.get('seller.bank').updateValueAndValidity();
  }

  static ValidatePublicOfficeDetails(invoiceForm: UntypedFormGroup) {
    invoiceForm.get('publicOffice.iik').updateValueAndValidity();
    invoiceForm.get('publicOffice.payPurpose').updateValueAndValidity();
  }
}
