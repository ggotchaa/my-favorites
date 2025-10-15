import { UntypedFormArray, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export class CustomValidators extends Validators {

    /**
     * check formArray values, if all are false, then return error, otherwise return null
     * @param control 
     * @returns 
     */
    static equalTrue: ValidatorFn = (control: UntypedFormArray): ValidationErrors | null => {
        for (let index = 0; index < control.controls.length; index++) {
            const element = control.controls[index].value as boolean;
            if (element) return null;
        }
        return { equalTrue: true }
    }
}