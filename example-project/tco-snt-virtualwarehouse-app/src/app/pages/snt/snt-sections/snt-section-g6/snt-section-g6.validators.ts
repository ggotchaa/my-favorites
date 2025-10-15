import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { SntImportType } from "../../../../api/GCPClient";
import { FormControlElementsBase } from "../FormControlElementsBase";

export class SntSectionG6Validators extends FormControlElementsBase {

  static vadRateRequired(sntForm: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return sntForm.get('importType').value === SntImportType.IMPORT && !control.value ? { vadRateRequired: true } : null;
    }
  }

  static setOilSetValidation(sntForm: AbstractControl) {
    sntForm.get('oilSet.kogdOfRecipient').setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(4)]);
    sntForm.get('oilSet.kogdOfRecipient').updateValueAndValidity();

    sntForm.get('oilSet.kogdOfSender').setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(4)]);
    sntForm.get('oilSet.kogdOfSender').updateValueAndValidity();

    sntForm.get('oilSet.productSellerType').setValidators([Validators.required]);
    sntForm.get('oilSet.productSellerType').updateValueAndValidity();

    let products = sntForm.get('oilProducts') as UntypedFormArray;
    products.controls.forEach(p => { p.get('vadRate').setValidators(this.vadRateRequired(sntForm)) });
  }

  static removeOilSetValidation(form: AbstractControl) {
    form.get('oilSet.kogdOfRecipient').clearValidators();
    form.get('oilSet.kogdOfRecipient').updateValueAndValidity();

    form.get('oilSet.kogdOfSender').clearValidators();
    form.get('oilSet.kogdOfSender').updateValueAndValidity();

    form.get('oilSet.productSellerType').clearValidators();
    form.get('oilSet.productSellerType').updateValueAndValidity();
  }

  static getSectionG6ErrorCount(sntDraftForm: AbstractControl): number {
    const oilProductsRequired = sntDraftForm.get('hasOilProducts').value;
    return (oilProductsRequired && (sntDraftForm.get('oilProducts') as UntypedFormArray).length === 0) ? 1 : 0;
  }

  static applyOilProductWeightValidation: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      const { importCondition, exportCondition } = FormControlElementsBase.getSntImportExportConditions(control);
      const sntOilProducts = control.root.get('oilProducts') as UntypedFormArray;

      sntOilProducts.controls.forEach((group) => {
        const netWeight = (group as UntypedFormGroup).get('netWeight') as UntypedFormControl;

        if (netWeight) {
          if (importCondition || exportCondition) {
            netWeight.setValidators([Validators.required]);
          } else {
            netWeight.clearValidators();
          }
          netWeight.markAsTouched({ onlySelf: true });
          netWeight.updateValueAndValidity();
        }
      });
    }

    return null;
  } 
}
