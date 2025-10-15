import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class NumericValidators {
  static positiveNumber: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const isPositive = control.value && Number(control.value) > 0;
    return !isPositive ? {positiveNumber: true} : null;
  }

  static nonNegativeNumber: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const isEmpty = (val) => val === undefined || val === null || val === '';
    const isNonNegative = !isEmpty(control.value) && Number(control.value) >= 0;
    return isNonNegative ? null : {nonNegativeNumber: true} ;
  }

  static optionalPositiveNumber: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;    
    return Number(control.value) <= 0 ? { optionalPositiveNumber: true } : null;
  }
}
