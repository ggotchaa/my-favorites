import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SntTransferType } from 'src/app/api/GCPClient';
import { FormControlElementsBase } from '../FormControlElementsBase';

export class SntSectionBValidators extends FormControlElementsBase {

  public static isNonResidentCheck: ValidatorFn = (control: AbstractControl):  ValidationErrors | null => {
    const isNonResident = control.get('nonResident') as UntypedFormControl;
    const registerCountryCode = control.get('registerCountryCode') as UntypedFormControl;
    const tin = control.get('tin') as UntypedFormControl
    if (isNonResident.value) {
      tin.setValidators([Validators.pattern(/^[0-9]*$/), Validators.minLength(1), Validators.maxLength(50)])
      registerCountryCode.enable({onlySelf: true, emitEvent: false});
    }else{
      tin.setValidators([Validators.pattern(/^[0-9]*$/), Validators.required, Validators.minLength(12), Validators.maxLength(12)])
      SntSectionBValidators.DisableAndSetValueElement(registerCountryCode, SntSectionBValidators.country)
    }
    tin.updateValueAndValidity({onlySelf: true, emitEvent: false});
    return null;
  }

  static checkEAES: ValidatorFn = (control: AbstractControl): null => {
    const transferType = control.get('transferType') as UntypedFormControl;
    const registerCountryCode = control.get('seller.registerCountryCode') as UntypedFormControl;
    const registerCountryCodeValue = registerCountryCode.value;
    const nonResident = control.get('seller.nonResident') as UntypedFormControl;
    if(transferType.value === SntTransferType.ONE_PERSON_IN_EAEU && nonResident.value && !SntSectionBValidators.isCountryEAES(registerCountryCodeValue)){
      const errors = { ...registerCountryCode.errors};
      errors['notEqualToEAES'] = true;
      registerCountryCode.setErrors(errors)
      transferType.setErrors({ transferTypeSellerAndCustomerMustBeEAEU: true })
    }else{
      if (registerCountryCode.hasError('notEqualToEAES') ) {
        const { notEqualToEAES, ...errors } = registerCountryCode.errors;
        registerCountryCode.setErrors(errors)
      }
    }
    return null
  }

  static countryCodeImportType: ValidatorFn = (control: AbstractControl): null => {
    const importType = control.get('importType');
    const nonResidentSeller = control.get('seller.nonResident');
    const countryCodeSeller = control.get('seller.countryCode');
    const countryCode = countryCodeSeller.value
    if(importType.value && nonResidentSeller.value && countryCode == SntSectionBValidators.country) countryCodeSeller.setErrors({equalToKZ: true})
    else if(importType.value && !SntSectionBValidators.isCountryEAES(countryCode)) countryCodeSeller.setErrors({notEqualToEAES: true})
    else countryCodeSeller.setErrors(null);
    return null;
  }

  public fillFields(control: AbstractControl, storeId: number): void{
    (control.get('tin') as UntypedFormControl).setValue(SntSectionBValidators.companyTin, {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
    (control.get('name') as UntypedFormControl).setValue(SntSectionBValidators.companyName, {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
    SntSectionBValidators.EnableAndSetValueElement((control.get('taxpayerStoreId') as UntypedFormControl), storeId , false);
    SntSectionBValidators.EnableAndSetValueElement((control.get('countryCode') as UntypedFormControl), SntSectionBValidators.country, false);
  }
   /**
     * Reset tin, name fields
     * @param control
     */
  static resetFields(control: AbstractControl): void {

    (control.get('tin') as UntypedFormControl).setValue('', {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
    (control.get('name') as UntypedFormControl).setValue('', {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
    (control.get('actualAddress') as UntypedFormControl).setValue('', {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
    SntSectionBValidators.DisableAndSetValueElement((control.get('taxpayerStoreId') as UntypedFormControl), null);
    SntSectionBValidators.EnableAndSetValueElement((control.get('countryCode') as UntypedFormControl), SntSectionBValidators.country, false);
  }

  static getSectionBErrorCount(sntCreateForm: UntypedFormGroup): number{
    return (sntCreateForm.get('seller.actualAddress').errors?.required ? 1 : 0) +
    (sntCreateForm.get('seller.name').errors?.required ? 1 : 0) +
    (sntCreateForm.get('seller.registerCountryCode').errors?.required ? 1 : 0) +
    (sntCreateForm.get('seller.countryCode').errors?.equalToKZ ? 1 : 0) +
    (sntCreateForm.get('seller.countryCode').errors?.notEqualToEAES ? 1 : 0) +
    (sntCreateForm.get('seller.registerCountryCode').errors?.notEqualToEAES ? 1 : 0) +
    (sntCreateForm.get('seller.registerCountryCode').errors?.registerCountryCodeMustBeKZ ? 1 : 0) +
    (sntCreateForm.get('seller.tin').errors?.required ? 1 : 0) +
    (sntCreateForm.get('seller.tin').errors?.pattern ? 1 : 0) +
    (sntCreateForm.get('seller.tin').errors?.minlength ? 1 : 0) +
    (sntCreateForm.get('seller.tin').errors?.maxlength ? 1 : 0) +
    (sntCreateForm.get('seller.countryCode').errors?.required ? 1 : 0) +
    (sntCreateForm.get('seller.taxpayerStoreId').errors?.required ? 1 : 0)
  }
}
