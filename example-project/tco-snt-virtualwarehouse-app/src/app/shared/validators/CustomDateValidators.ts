import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { isEmpty } from "rxjs";

export class CustomDateValidators extends Validators {
    static dateCantBeEarlierThanFiveYearsAndInFuture: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        let fiveYearDate = new Date();
        fiveYearDate.setFullYear(fiveYearDate.getFullYear() - 5);
        let dateNow = new Date();

        fiveYearDate.toDateOnly();
        dateNow.toDateOnly();

        let valueDate = new Date(control.value);

        valueDate.toDateOnly();

        let isInvalid = control.value && (valueDate < fiveYearDate || valueDate > dateNow);

        return isInvalid ? { dateCantBeEarlierThanFiveYearsAndInFuture: true } : null;
    }

    static invoiceDateMustBeChecked: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        let value = control.get('date').value.toString()
        let dateForm = new Date((value).replace(/(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"))
        
        return dateForm.dateIsActual() ?  null : { invoiceDateIsNotCurrent: true };
    }
}