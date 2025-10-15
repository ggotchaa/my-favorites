import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { FormControlElementsBase } from "../FormControlElementsBase";

export class SntSectionG10Validators extends FormControlElementsBase {

    static getSectionG10ErrorCount(sntDraftForm: AbstractControl): number {
        const exportControlProductsRequired = sntDraftForm.get('hasExportControlProducts').value;
        return (exportControlProductsRequired && (sntDraftForm.get('exportControlProducts') as UntypedFormArray).length === 0) ? 1 : 0;
    }
    static applyExportControlProductWeightValidation: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
      if (control.parent) {
        const { importCondition, exportCondition } = FormControlElementsBase.getSntImportExportConditions(control);
        const sntProducts = control.root.get('exportControlProducts') as UntypedFormArray;
  
        sntProducts.controls.forEach((group) => {
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
