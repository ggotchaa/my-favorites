import { AbstractControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SntExportType, SntImportType, SntTransferType } from '../../../../../app/api/GCPClient';
import { FormControlElementsBase } from '../FormControlElementsBase';

export class SntSectionAValidators extends FormControlElementsBase {

  //3. Дата отгрузки товара

  static shippingDateRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if(control.parent){
      const importType = control.parent.get('importType');
      const exportType = control.parent.get('exportType');

      const isImportTypeSelected = importType && (importType.value == SntImportType.IMPORT || importType.value == SntImportType.IMPORT_FOR_PROCESSING || importType.value == SntImportType.IMPORT_OF_TEMPORARY_EXPORTED_PRODUCT || importType.value == SntImportType.TEMPORARY_IMPORT);
      const isExportTypeSelected = exportType && (exportType.value == SntExportType.EXPORT || exportType.value == SntExportType.EXPORT_FOR_PROCESSING || exportType.value == SntExportType.TEMPORARY_EXPORT || exportType.value == SntExportType.EXPORT_OF_TEMPORARY_IMPORTED_PRODUCT);

      return !isImportTypeSelected && !isExportTypeSelected && !control.value ? { shippingDateRequired: true } : null;
    }
    return null;
}

  static shippingDateCantBeEarlierThanFiveYears: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    let date = new Date();
    date.setFullYear(date.getFullYear() - 5);

    return control.value && control.value < date ? { shippingDateEarlierThanFiveYears: true } : null;
  }

  //4.2.1. Дата Акта/Уведомления по цифровой маркировке

  static digitalMarkingNotificationDateRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if(control.parent){
      const digitalMarkingNotificationNumber = control.parent.get('digitalMarkingNotificationNumber');

      return digitalMarkingNotificationNumber.value && !control.value ? { digitalMarkingNotificationDateRequired: true } : null;
    }
    return null;
  }

  //9. Перемещение товара

  static transferTypeCountryMustBeKz: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if(control.parent){
      const transferType = control;
      const sellerCountryCode = control.parent.get('seller.countryCode');
      const sellerCountryCodeValue = sellerCountryCode.value
      const customerCountryCode = control.parent.get('customer.countryCode');
      const customerCountryCodeValue = customerCountryCode.value;

      return transferType && transferType.value == SntTransferType.ONE_PERSON_IN_KZ && (sellerCountryCodeValue != SntSectionAValidators.country || customerCountryCodeValue != SntSectionAValidators.country)
        ? { transferTypeCountryMustBeKz: true } : null;
    }
    return null;
  }

  static transferTypeMustBeSameIINBIN: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const transferType = control.get('transferType');
    const sellerTin = control.get('seller.tin');
    const customerTin = control.get('customer.tin');

    if (transferType && transferType.value == SntTransferType.ONE_PERSON_IN_KZ && sellerTin.value !== customerTin.value) {
      FormControlElementsBase.addError(transferType, 'transferTypeMustBeSameIINBIN');
    }
    else {
      FormControlElementsBase.removeError(transferType, 'transferTypeMustBeSameIINBIN');
    }

    return null;
  }

  static transferTypeSellerMustBeEAEU: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if(control.parent){
      const transferType = control;
      const isSellerNonResident = control.parent.get('seller.nonResident').value;
      const sellerRegisterCountryCode = control.parent.get('seller.registerCountryCode').value;
      const transferTypesErrors = { ...transferType.errors};
      const isOnePersonInEAEU: boolean = transferType && transferType.value == SntTransferType.ONE_PERSON_IN_EAEU
      const valid: boolean = (isSellerNonResident && SntSectionAValidators.isCountryEAESWithoutKZ(sellerRegisterCountryCode))
      const valid1: boolean = (!isSellerNonResident && SntSectionAValidators.country === sellerRegisterCountryCode)
      if(isOnePersonInEAEU && valid1) {
        if(transferType.hasError('transferTypeSellerAndCustomerMustBeEAEU') ) {
          const { transferTypeSellerAndCustomerMustBeEAEU, ...errors } = transferType.errors;
          return errors
        }
      };
      if(isOnePersonInEAEU && valid) {
        if(transferType.hasError('transferTypeSellerAndCustomerMustBeEAEU') ) {
          const { transferTypeSellerAndCustomerMustBeEAEU, ...errors } = transferType.errors;
          return errors
        }
      }
      return transferTypesErrors
    }

    return null;
  }
  static transferTypeCustomerMustBeEAEU: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if(control.parent){
      const transferType = control;
      const isSellerNonResident = control.parent.get('customer.nonResident').value;
      const sellerRegisterCountryCode = control.parent.get('customer.registerCountryCode').value;
      const transferTypesErrors = { ...transferType.errors};
      const isOnePersonInEAEU: boolean = transferType && transferType.value == SntTransferType.ONE_PERSON_IN_EAEU
      const valid: boolean = (isSellerNonResident && SntSectionAValidators.isCountryEAESWithoutKZ(sellerRegisterCountryCode))
      const valid1: boolean = (!isSellerNonResident && SntSectionAValidators.country === sellerRegisterCountryCode)
      if(isOnePersonInEAEU && valid1) {
        if(transferType.hasError('transferTypeSellerAndCustomerMustBeEAEU') ) {
          const { transferTypeSellerAndCustomerMustBeEAEU, ...errors } = transferType.errors;
          return errors
        }
      };
      if(isOnePersonInEAEU && valid) {
        if(transferType.hasError('transferTypeSellerAndCustomerMustBeEAEU') ) {
          const { transferTypeSellerAndCustomerMustBeEAEU, ...errors } = transferType.errors;
          return errors
        }
      }
      return transferTypesErrors
    }

    return null;
  }

  static getSectionAErrorCount(sntCreateForm: UntypedFormGroup): number{
    return (sntCreateForm.get('number').errors?.required ? 1 : 0) +
      (sntCreateForm.get('shippingDate').errors?.shippingDateCantBeEarlierThanFiveYears ? 1 : 0) +
      (sntCreateForm.get('shippingDate').errors?.shippingDateRequired ? 1 : 0) +
      (sntCreateForm.get('digitalMarkingNotificationDate').errors?.digitalMarkingNotificationDateRequired ? 1 : 0) +
      (sntCreateForm.get('transferType').errors?.transferTypeCountryMustBeKz ? 1 : 0) +
      (sntCreateForm.get('transferType').errors?.transferTypeMustBeSameIINBIN ? 1 : 0) +
      (sntCreateForm.get('transferType').errors?.transferTypeSellerAndCustomerMustBeEAEU ? 1 : 0) +
      (sntCreateForm.get('transferType').errors?.transferTypeSellerOrCustomerMustNotBeEAEU ? 1 : 0);
  }
}
