import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SntTransferType } from 'src/app/api/GCPClient';
import { CustomerCategory } from 'src/app/model/enums/CustomerCategory';
import { KzCountry } from 'src/app/model/GlobalConst';
import { FormControlElementsBase } from '../FormControlElementsBase';

export class InvoiceSectionDValidators extends FormControlElementsBase {
  static getSectionDErrorCount(invoiceCreateForm: UntypedFormGroup): number {
    return (invoiceCreateForm.get('consignor.tin').errors?.pattern ? 1 : 0) +
      (invoiceCreateForm.get('consignor.name').errors?.minlength ? 1 : 0) +
      (invoiceCreateForm.get('consignor.name').errors?.maxlength ? 1 : 0) +
      (invoiceCreateForm.get('consignor.address').errors?.minlength ? 1 : 0) +
      (invoiceCreateForm.get('consignor.address').errors?.maxlength ? 1 : 0) +

      (invoiceCreateForm.get('consignee.tin').errors?.pattern ? 1 : 0) +
      (invoiceCreateForm.get('consignee.tin').errors?.required ? 1 : 0) +
      (invoiceCreateForm.get('consignee.name').errors?.consigneeNameRequired ? 1 : 0) +
      (invoiceCreateForm.get('consignee.name').errors?.minlength ? 1 : 0) +
      (invoiceCreateForm.get('consignee.name').errors?.maxlength ? 1 : 0) +
      (invoiceCreateForm.get('consignee.address').errors?.consigneeAddressRequired ? 1 : 0) +
      (invoiceCreateForm.get('consignee.address').errors?.minlength ? 1 : 0) +
      (invoiceCreateForm.get('consignee.address').errors?.maxlength ? 1 : 0) +
      (invoiceCreateForm.get('consignee.countryCode').errors?.required ? 1 : 0)
      ;
  }


  //https://dev.azure.com/chevron/TCO-E-Invoicing/_wiki/wikis/TCO-E-Invoicing.wiki/50464/ESF-Section-D-%D0%A0%D0%B5%D0%BA%D0%B2%D0%B8%D0%B7%D0%B8%D1%82%D1%8B-%D0%B3%D1%80%D1%83%D0%B7%D0%BE%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D1%82%D0%B5%D0%BB%D1%8F-%D0%B8-%D0%B3%D1%80%D1%83%D0%B7%D0%BE%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B0%D1%82%D0%B5%D0%BB%D1%8F#:~:text=3.%20%D0%95%D1%81%D0%BB%D0%B8%20%D0%B2%20%D0%BF%D0%BE%D0%BB%D0%B5%2018.1%20%C2%AB%D0%9A%D0%BE%D0%B4%20%D1%81%D1%82%D1%80%D0%B0%D0%BD%D1%8B%C2%BB%20%D1%83%D0%BA%D0%B0%D0%B7%D0%B0%D0%BD%D0%B0%20%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B0%2C%20%D0%BE%D1%82%D0%BB%D0%B8%D1%87%D0%BD%D0%B0%D1%8F%20%D0%BE%D1%82%20%C2%ABKZ%C2%BB%2C%20%D0%B7%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BF%D0%BE%D0%BB%D1%8F%2026.1%20%D0%B4%D0%BE%D0%BB%D0%B6%D0%BD%D0%BE%20%D0%B1%D1%8B%D1%82%D1%8C%20%D1%80%D0%B0%D0%B2%D0%BD%D0%BE%20%D0%B7%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%B8%D1%8E%20%D0%BF%D0%BE%D0%BB%D1%8F%2018.1%20%C2%AB%D0%9A%D0%BE%D0%B4%20%D1%81%D1%82%D1%80%D0%B0%D0%BD%D1%8B%C2%BB 

  static countryCodeRule3: ValidatorFn = (control: AbstractControl): null => {
    const consigneeCountryCode = control.get('consignee.countryCode') as UntypedFormControl;
    const customerCountryCode= control.get('customer.countryCode') as UntypedFormControl;
    const customerStatus = control.get('customer.statuses') as UntypedFormControl;
    const isCustomerNonResident = (customerStatus.value as string[]).includes(CustomerCategory.NONRESIDENT);
    if(isCustomerNonResident && consigneeCountryCode.disabled && customerCountryCode.value != InvoiceSectionDValidators.country){
      InvoiceSectionDValidators.EnableAndSetValueElement(consigneeCountryCode, customerCountryCode.value)
    }
    if(isCustomerNonResident && !consigneeCountryCode.disabled){
      consigneeCountryCode.setValue(consigneeCountryCode.value, { onlySelf: true, emitEvent: false})
    }
    return null
  }

  //https://dev.azure.com/chevron/TCO-E-Invoicing/_wiki/wikis/TCO-E-Invoicing.wiki/50464/ESF-Section-D-%D0%A0%D0%B5%D0%BA%D0%B2%D0%B8%D0%B7%D0%B8%D1%82%D1%8B-%D0%B3%D1%80%D1%83%D0%B7%D0%BE%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D1%82%D0%B5%D0%BB%D1%8F-%D0%B8-%D0%B3%D1%80%D1%83%D0%B7%D0%BE%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B0%D1%82%D0%B5%D0%BB%D1%8F#:~:text=.%20%D0%92%D0%BE%D0%B7%D0%BC%D0%BE%D0%B6%D0%BD%D0%BE%D1%81%D1%82%D1%8C%20%D0%B2%D1%8B%D0%B1%D0%BE%D1%80%D0%B0%20%D0%B8%D0%B7%20%D1%81%D0%BF%D1%80%D0%B0%D0%B2%D0%BE%D1%87%D0%BD%D0%B8%D0%BA%D0%B0%20%C2%AB%D0%A1%D1%82%D1%80%D0%B0%D0%BD%D0%B0%C2%BB%2C%20%D0%B5%D1%81%D0%BB%D0%B8%20%D0%B2%20%D0%BF%D0%BE%D0%BB%D0%B5%2010%20%22%D0%9A%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F%20%D0%BF%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D1%89%D0%B8%D0%BA%D0%B0%22%20%D1%83%D0%BA%D0%B0%D0%B7%D0%B0%D0%BD%D1%8B%20%D0%BA%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D0%B8%20%22E%20-%20%D1%83%D1%87%D0%B0%D1%81%D1%82%D0%BD%D0%B8%D0%BA%20%D0%A1%D0%A0%D0%9F%22%2C%20%22G%20-%20%D1%8D%D0%BA%D1%81%D0%BF%D0%BE%D1%80%D1%82%D0%B5%D1%80%22%20%D0%B8%D0%BB%D0%B8%20%22H%20-%20%D0%BC%D0%B5%D0%B6%D0%B4%D1%83%D0%BD%D0%B0%D1%80%D0%BE%D0%B4%D0%BD%D1%8B%D0%B9%20%D0%BF%D0%B5%D1%80%D0%B5%D0%B2%D0%BE%D0%B7%D1%87%D0%B8%D0%BA%22
  static countryCodeRule2: ValidatorFn = (control: AbstractControl) : null => {
    const sellerStatus = control.get('seller.statuses') as UntypedFormControl
    const consigneeCountryCode = control.get('consignee.countryCode') as UntypedFormControl
    const customerStatus = control.get('customer.statuses') as UntypedFormControl;
    const isCustomerNonResident = (customerStatus.value as string[]).includes(CustomerCategory.NONRESIDENT);
    if (!sellerStatus.value) {
      return null;
    }

    //TODO add SellerCategory from API
    const categoriesThatEnableCountryEditing = [CustomerCategory.SHARING_AGREEMENT_PARTICIPANT, CustomerCategory.EXPORTER, CustomerCategory.TRANSPORTER];
    //1. Автоматическое заполнение значением "KZ" без возможности редактирования, если в поле 10 "Категория поставщика" не указаныкатегории "E - участник СРП", или "G - экспортер", или "H - международный перевозчик".
    let categoriesAreSelected = (sellerStatus.value as string[]).some(x => categoriesThatEnableCountryEditing.some(y => y == x));
    if (!isCustomerNonResident) {
      InvoiceSectionDValidators.DisableAndSetValueElement(consigneeCountryCode, InvoiceSectionDValidators.country);
    } else if(categoriesAreSelected && !isCustomerNonResident){
      consigneeCountryCode.enable({onlySelf: true, emitEvent: false});
    }

    return null
  }
  static consigneeTinRequired: ValidatorFn = (control: AbstractControl): null => {
    let consigneeCountryCode = control.get('countryCode').value;

    if (consigneeCountryCode == KzCountry) {
      control.get('tin').setValidators([Validators.pattern(/^[0-9]*$/), Validators.required]);
    } else {
      control.get('tin').setValidators([Validators.pattern(/^[0-9]*$/)]);

      if (control.get('tin').hasError('required')) {
        control.get('tin').setErrors(null);
      }
    }

    return null;
  }

  static consigneeNameRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let customerCountryCode = control.parent.parent.get('customer.countryCode').value;
      let consigneeCountryCode = control.parent.parent.get('consignee.countryCode').value;

      return !control.value && customerCountryCode != KzCountry && consigneeCountryCode != KzCountry ? { consigneeNameRequired: true } : null;
    }
    return null;
  }

  static consigneeAddressRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let customerCountryCode = control.parent.parent.get('customer.countryCode').value;
      let consigneeCountryCode = control.parent.parent.get('consignee.countryCode').value;

      return !control.value && customerCountryCode != KzCountry && consigneeCountryCode != KzCountry ? { consigneeAddressRequired: true } : null;
    }
    return null;
  }
}
