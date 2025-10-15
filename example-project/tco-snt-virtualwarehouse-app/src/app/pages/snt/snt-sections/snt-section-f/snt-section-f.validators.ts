import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { FormControlElementsBase } from "../FormControlElementsBase";

export class SntSectionFValidators extends FormControlElementsBase {
    static isCheckedWithContract: ValidatorFn = (control:AbstractControl): ValidationErrors | null =>{
        const checked = control.get('isContract')
        const number = control.get('number')
        const date = control.get('date')        
        const isChecked = checked.value as string

        if(isChecked === 'true'){
            number.markAsTouched({onlySelf: true});
            date.markAsTouched({onlySelf: true});
            number.setValidators(Validators.required)
            date.setValidators(Validators.required)
            number.enable({onlySelf: true, emitEvent: false})
            date.enable({onlySelf:true, emitEvent: false})
        } else if(isChecked === 'false'){
            number.reset('', {onlySelf: true, emitEvent: false})
            date.reset('', {onlySelf: true, emitEvent: false})
            number.disable({onlySelf: true, emitEvent: false})
            date.disable({onlySelf:true, emitEvent: false})
        }
        number.updateValueAndValidity({onlySelf: true, emitEvent: false})
        date.updateValueAndValidity({onlySelf: true, emitEvent: false})
        return null
    }

    static getSectionFErrorCount(section: AbstractControl): number {
        return (section.get('contract.number').errors?.required === true ? 1 : 0) +
        (section.get('contract.date').errors?.required === true ? 1 : 0)
    }
}
