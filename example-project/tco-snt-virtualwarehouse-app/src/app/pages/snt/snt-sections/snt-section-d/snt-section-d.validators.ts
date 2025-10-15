import { AbstractControl, UntypedFormControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { FormControlElementsBase } from "../FormControlElementsBase";

export class SntSectionDValidators extends FormControlElementsBase{
    static isNonResidentConsignorCheck: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const isNonResidentConsignor = control.get('nonResident')
        const tinConsignor = control.get('tin')
        const countryCodeConsignor = control.get('countryCode')
        if(!isNonResidentConsignor.value){
            tinConsignor.clearValidators()
            tinConsignor.setValidators([Validators.pattern(/^[0-9]*$/), Validators.required, Validators.minLength(12), Validators.maxLength(12)]);
            
        } else{
            tinConsignor.clearValidators()
            tinConsignor.setValidators([Validators.pattern(/^[0-9]*$/), Validators.minLength(1), Validators.maxLength(50)]);
        }
        (countryCodeConsignor as UntypedFormControl).setValue(countryCodeConsignor.value, {onlySelf: true, emitEvent: false, emitModelToViewChange: false})
        tinConsignor.updateValueAndValidity({onlySelf: true, emitEvent: false});
        return null;
    }
    static isNonResidentConsigneeCheck: ValidatorFn = (control:  AbstractControl): ValidationErrors | null => {
        const isNonResidentConsignee = control.get('nonResident')
        const tinConsignee = control.get('tin')
        const countryCodeConsignee = control.get('countryCode')
        if(!isNonResidentConsignee.value){
            tinConsignee.clearValidators()
            tinConsignee.setValidators([Validators.pattern(/^[0-9]*$/), Validators.required, Validators.minLength(12), Validators.maxLength(12)]);
        } else{
            tinConsignee.clearValidators()
            tinConsignee.setValidators([Validators.pattern(/^[0-9]*$/), Validators.minLength(1), Validators.maxLength(50)]);
        }
        (countryCodeConsignee as UntypedFormControl).setValue(countryCodeConsignee.value, {onlySelf: true, emitEvent: false, emitModelToViewChange: false})
        tinConsignee.updateValueAndValidity({onlySelf: true, emitEvent: false});
        return null;
    }
    
    /**
     * Fill tin, name, countryCode fields
     * @param control 
     */
    static fillFields(control: AbstractControl): void {
        (control.get('tin') as UntypedFormControl).setValue(SntSectionDValidators.companyTin, {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
        (control.get('name') as UntypedFormControl).setValue(SntSectionDValidators.companyName, {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
        SntSectionDValidators.DisableAndSetValueElement((control.get('countryCode') as UntypedFormControl), SntSectionDValidators.country)
    }

    /**
     * Reset tin, name, countryCode fields
     * @param control 
     */
    static resetFields(control: AbstractControl): void {
        (control.get('tin') as UntypedFormControl).setValue('', {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
        (control.get('name') as UntypedFormControl).setValue('', {onlySelf: true, emitEvent: false, emitModelToViewChange: false});
        SntSectionDValidators.EnableAndSetValueElement((control.get('countryCode') as UntypedFormControl), '', false, false)
        control.updateValueAndValidity({onlySelf: true})
    }
   
    static getSectionDErrorCount(section: AbstractControl): number {
        return (section.get('consignee.tin').errors?.required === true ? 1 : 0) +
        (section.get('consignor.countryCode').errors?.required === true ? 1 : 0) +
        (section.get('consignee.countryCode').errors?.required === true ? 1 : 0) +
        (section.get('consignee.tin').errors?.pattern ? 1 : 0) +
        (section.get('consignee.tin').errors?.minlength ? 1 : 0) +
        (section.get('consignee.tin').errors?.maxlength ? 1 : 0) + 
        (section.get('consignee.name').errors?.required ? 1 : 0) +
        (section.get('consignor.tin').errors?.required === true ? 1 : 0) +
        (section.get('consignor.tin').errors?.pattern ? 1 : 0) +
        (section.get('consignor.tin').errors?.minlength ? 1 : 0) +
        (section.get('consignor.tin').errors?.maxlength ? 1 : 0) +
        (section.get('consignor.name').errors?.required ? 1 : 0)
    }
}
