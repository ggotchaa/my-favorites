import { AbstractControl, FormArray, UntypedFormControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { COMPANY, KzCountry, KztCurrencyCode, DefaultTCOWarehouseId } from "src/app/model/GlobalConst";
import { Country } from "src/app/model/lists/Countries";

export abstract class FormControlElementsBase {

    public static readonly country = KzCountry;
    public static readonly currencyCode = KztCurrencyCode;
    public static readonly companyTin = COMPANY.tin;
    public static readonly companyName = COMPANY.name;

    public static unchecked(formControls: AbstractControl[]): void{
        (formControls as UntypedFormControl[]).forEach(formControl => {
            formControl.setValue(false, { onlySelf: true, emitEvent: false})
        })
    }
    public static disableElements(formControls: AbstractControl[]): void {
        formControls.forEach(formControl => {
            formControl.disable({onlySelf: true, emitEvent: false})
            formControl.updateValueAndValidity({onlySelf: true, emitEvent: false});
        })
    }
    public static enableElements(formControls: AbstractControl[]): void{
        formControls.forEach(formControl => {
            formControl.enable({onlySelf: true, emitEvent: false})
            formControl.updateValueAndValidity({onlySelf: true, emitEvent: false});
        })
    }
    public static EnableAndSetValueElement(control: UntypedFormControl, value: any, emitModelToViewChange = true, emitViewToModelChange = true) {
        control.enable({onlySelf: true, emitEvent: false})
        control.setValue(value, {onlySelf: true, emitEvent: false, emitModelToViewChange: emitModelToViewChange, emitViewToModelChange: emitViewToModelChange })
    }
    public static DisableAndSetValueElement(control: UntypedFormControl, value: any, emitModelToViewChange = true, emitViewToModelChange = true) {
        control.disable({onlySelf: true, emitEvent: false})
        control.setValue(value, {onlySelf: true, emitEvent: false, emitModelToViewChange: emitModelToViewChange, emitViewToModelChange: emitViewToModelChange})
    }
    public static disableAndSetValueElements(formControls: AbstractControl[], value: any, emitModelToViewChange = true, emitViewToModelChange = true) {
        formControls.forEach(formControl => {
            formControl.disable({onlySelf: true, emitEvent: false})
            formControl.setValue(value, {onlySelf: true, emitEvent: false, emitModelToViewChange: emitModelToViewChange, emitViewToModelChange: emitViewToModelChange})
            formControl.updateValueAndValidity({onlySelf: true, emitEvent: false});
        })
    }

    public static isTCOTin: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
      const isNonResident = control.get('nonResident') as UntypedFormControl;
      const taxpayerStoreId = control.get('taxpayerStoreId') as UntypedFormControl;
      const tin = control.get('tin') as UntypedFormControl
      if(tin.value as string === FormControlElementsBase.companyTin && !isNonResident.value as boolean) {
        FormControlElementsBase.EnableAndSetValueElement(taxpayerStoreId, taxpayerStoreId.value);
        taxpayerStoreId.setValidators([Validators.required])
      }else{
        FormControlElementsBase.DisableAndSetValueElement(taxpayerStoreId, '');
      }
      return null;
    }

    public static isCountryEAES(countryCode): boolean {
        return ['AM', 'BY', 'KZ', 'KG', 'RU'].includes(countryCode);
    }
    public static isCountryEAESWithoutKZ(countryCode): boolean {
        return ['AM', 'BY', 'KG', 'RU'].includes(countryCode);
    }
    public static registerCountryCode: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const registerCountryCode = control.get('registerCountryCode');
        const registerCountryCodeValue = registerCountryCode.value as Country;
        const nonResident = control.get('nonResident');
        if(nonResident.value && registerCountryCodeValue.code && registerCountryCodeValue.code == FormControlElementsBase.country){
            const errors = { ...registerCountryCode.errors};
            errors['registerCountryCodeMustBeKZ'] = true;
            registerCountryCode.setErrors(errors)
        }else {
            if (registerCountryCode.hasError('registerCountryCodeMustBeKZ') ) {
                const { registerCountryCodeMustBeKZ, ...errors } = registerCountryCode.errors;
                registerCountryCode.setErrors(errors)
            }
        }
        return null;
    };
    public fillFields(control:AbstractControl, storeId: number): void{
      throw new Error("not implemented!");
    }
    public resetFields(control:AbstractControl): void{
      throw new Error("not implemented!");
    }

  static addError(control: AbstractControl, error: string) {
    let newError = {};
    newError[error] = true;
    control.setErrors({...control.errors, ...newError});
  }
  static removeError(control: AbstractControl, error: string){
    const errors = control.errors;
    if(errors){
      delete errors[error];
      control.setErrors(Object.keys(errors).length ? errors : null);
    }
  }
}
