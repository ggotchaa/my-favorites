import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { FormControlElementsBase } from "../FormControlElementsBase";


export class SntSectionGValidators extends FormControlElementsBase {
  static getSectionGErrorCount(sntDraftForm: AbstractControl): number {
    const productsOilRequired = !sntDraftForm.get('hasOilProducts').value
    const productsExportControlRequired = !sntDraftForm.get('hasExportControlProducts').value
    return productsOilRequired && productsExportControlRequired && sntDraftForm.get('products').hasError('required') ? 1 : 0
  } 

  static applyProductWeightValidation: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      const { importCondition, exportCondition } = FormControlElementsBase.getSntImportExportConditions(control);
      const sntProducts = control.root.get('products') as UntypedFormArray;

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
