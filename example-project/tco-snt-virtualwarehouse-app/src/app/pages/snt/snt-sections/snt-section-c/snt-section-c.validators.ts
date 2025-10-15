import { AbstractControl, UntypedFormControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { SntTransferType } from "src/app/api/GCPClient";
import { Country } from "src/app/model/lists/Countries";
import { FormControlElementsBase } from "../FormControlElementsBase";

export class SntSectionCValidators extends FormControlElementsBase {
    public static isNonResidentCheck: ValidatorFn = (control: AbstractControl):  ValidationErrors | null => {
        const isNonResident = control.get('nonResident') as UntypedFormControl;
        const registerCountryCode = control.get('registerCountryCode') as UntypedFormControl;
        const tin = control.get('tin') as UntypedFormControl
        if (isNonResident.value) {
          tin.setValidators([Validators.pattern(/^[0-9]*$/), Validators.minLength(1), Validators.maxLength(50)])
          registerCountryCode.enable({onlySelf: true, emitEvent: false});
        }else{
          tin.setValidators([Validators.pattern(/^[0-9]*$/), Validators.required, Validators.minLength(12), Validators.maxLength(12)])
          SntSectionCValidators.DisableAndSetValueElement(registerCountryCode, SntSectionCValidators.country)
        }
        tin.updateValueAndValidity({onlySelf: true, emitEvent: false});
        return null;
    }

    static countryCodeExportType: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const exportType = control.get('exportType');
        const nonResidentSeller = control.get('customer.nonResident');
        const countryCodeSeller = control.get('customer.countryCode');
        const countryCodeSellerValue = countryCodeSeller.value as Country
        if(exportType.value && nonResidentSeller.value && countryCodeSellerValue.code == SntSectionCValidators.country) countryCodeSeller.setErrors({equalToKZ: true})
        else countryCodeSeller.setErrors(null);
        return null;
    }
    static countryCodeTransferType92: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = control.value as Country;
        if(!SntSectionCValidators.isCountryEAES(controlValue.code)) return {notEqualToEAES: true}
        return null
    }
    static checkEAES: ValidatorFn = (control: AbstractControl): null => {
        const transferType = control.get('transferType') as UntypedFormControl;
        const registerCountryCode = control.get('customer.registerCountryCode') as UntypedFormControl;
        const registerCountryCodeValue = registerCountryCode.value as Country
        const nonResident = control.get('customer.nonResident') as UntypedFormControl;
        if(transferType.value === SntTransferType.ONE_PERSON_IN_EAEU && nonResident.value && !SntSectionCValidators.isCountryEAES(registerCountryCodeValue.code)){
            const errors = { ...registerCountryCode.errors};
            errors['notEqualToEAES'] = true;
            registerCountryCode.setErrors(errors)
            transferType.setErrors({ transferTypeSellerAndCustomerMustBeEAEU: true })
          }else{
            if(registerCountryCode.hasError('notEqualToEAES') ) {
              const { notEqualToEAES, ...errors } = registerCountryCode.errors;
              registerCountryCode.setErrors(errors)
            }
          }
          return null
      }
    /**
     * Reset tin, name fields
     * @param control
     */
    static resetFields(control: AbstractControl): void{
        (control.get('tin') as UntypedFormControl).setValue('', {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
        (control.get('name') as UntypedFormControl).setValue('', {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
        (control.get('actualAddress') as UntypedFormControl).setValue('', {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
        SntSectionCValidators.EnableAndSetValueElement(control.get('taxpayerStoreId') as UntypedFormControl, null, false);
        SntSectionCValidators.EnableAndSetValueElement((control.get('countryCode') as UntypedFormControl), SntSectionCValidators.country, false);
    }

    public fillFields(control: AbstractControl, storeId: number): void {
        (control.get('tin') as UntypedFormControl).setValue(SntSectionCValidators.companyTin, {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
        (control.get('name') as UntypedFormControl).setValue(SntSectionCValidators.companyName, {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
        SntSectionCValidators.EnableAndSetValueElement((control.get('taxpayerStoreId') as UntypedFormControl), storeId);
        SntSectionCValidators.DisableAndSetValueElement((control.get('countryCode') as UntypedFormControl), SntSectionCValidators.country);
    }
    static getSectionCErrorCount(section: AbstractControl): number {
        return (section.get('customer.actualAddress').errors?.required === true ? 1 : 0) +
        (section.get('customer.name').errors?.required === true ? 1 : 0) +
        (section.get('customer.registerCountryCode').errors?.required === true ? 1 : 0) +
        (section.get('customer.countryCode').errors?.equalToKZ ? 1 : 0) +
        (section.get('customer.countryCode').errors?.notEqualToEAES ? 1 : 0) +
        (section.get('customer.registerCountryCode').errors?.notEqualToEAES ? 1 : 0) +
        (section.get('customer.registerCountryCode').errors?.registerCountryCodeMustBeKZ ? 1 : 0) +
        (section.get('customer.tin').errors?.required === true ? 1 : 0) +
        (section.get('customer.tin').errors?.pattern ? 1 : 0) +
        (section.get('customer.tin').errors?.minlength ? 1 : 0) +
        (section.get('customer.tin').errors?.maxlength ? 1 : 0) +
        (section.get('customer.countryCode').errors?.required === true ? 1 : 0) +
        (section.get('customer.taxpayerStoreId').errors?.required ? 1 : 0)
    }
}
